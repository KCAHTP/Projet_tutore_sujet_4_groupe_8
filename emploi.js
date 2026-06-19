// =============================================
// EMPLOI.JS
// La classe est déjà choisie et stockée
// dans localStorage — on lit et on adapte
// =============================================
console.log("EMPLOI JS CHARGE");
// =============================================
// LECTURE DU LOCALSTORAGE — classe déjà choisie
// =============================================
const CLASSE_ID = localStorage.getItem('classe_id')
const CLASSE_NOM = localStorage.getItem('classe_choisie')

// Variables globales
let dateSelectionnee = ''
let coursASupprimer = null
let calendar

// =============================================
// INITIALISATION — dès que la page charge
// =============================================
document.addEventListener('DOMContentLoaded', async () => {

  // Sécurité — si pas de classe choisie, retour à l'accueil
  if (!CLASSE_ID || !CLASSE_NOM) {
    window.location.href = 'accueil.html'
    return
  }

  // Adapte le titre avec le nom de la classe
  document.getElementById('titre-classe').textContent =
    `Emploi Du Temps — ${CLASSE_NOM}`

  // Adapte le titre de l'onglet navigateur
  document.title = `Emploi du Temps — ${CLASSE_NOM}`

  // Charge les menus et le calendrier
  await chargerModules()
  await chargerEnseignants()
  await initialiserCalendrier()
})

// =============================================
// CHARGER LES MODULES DE LA CLASSE CHOISIE
// =============================================
async function chargerModules() {
  try {
    // On filtre les modules par classe_id
    const res = await fetch(
      `http://localhost:5000/api/ec?classe_id=${CLASSE_ID}`
    )
    if (!res.ok) throw new Error()
    const liste = await res.json()

    const select = document.getElementById('module')
    select.innerHTML = '<option value="">-- Choisir un module --</option>'

    liste.forEach(ec => {
      const option = document.createElement('option')
      option.value = ec.id
      option.textContent = ec.nom
      select.appendChild(option)
    })

  } catch {
    console.warn('Modules non disponibles')
  }
}

// =============================================
// CHARGER LES ENSEIGNANTS
// =============================================
async function chargerEnseignants() {
  try {
    const res = await fetch('http://localhost:5000/api/enseignants')
    if (!res.ok) throw new Error()
    const liste = await res.json()

    const select = document.getElementById('enseignant')
    select.innerHTML = '<option value="">-- Choisir un enseignant --</option>'

    liste.forEach(e => {
      const option = document.createElement('option')
      option.value = e.id
      option.textContent = `${e.prenom} ${e.nom}`
      select.appendChild(option)
    })

  } catch {
    console.warn('Enseignants non disponibles')
  }
}

// =============================================
// CHARGER LES COURS DE LA CLASSE CHOISIE
// =============================================
async function chargerEmplois() {
  try {
    // On filtre les emplois du temps par classe_id
    const res = await fetch(
      `http://localhost:5000/api/planning?classe_id=${CLASSE_ID}`
    )
    if (!res.ok) throw new Error()
    const data = await res.json()

    return data.map(e => ({
      id: e.id,
      title: `${e.ec_nom} — ${e.enseignant_nom}`,
      start: `${e.date}T${e.heure_debut}`,
      end: `${e.date}T${e.heure_fin}`,
      backgroundColor: '#3b82f6',
      borderColor: '#1d4ed8'
    }))

  } catch {
    console.warn('Emplois du temps non disponibles')
    return []
  }
}

// =============================================
// INITIALISER LE CALENDRIER
// =============================================
async function initialiserCalendrier() {
  const emplois = await chargerEmplois()
  const el = document.getElementById('calendrier')

  calendar = new FullCalendar.Calendar(el, {
    initialView: 'timeGridWeek',
    locale: 'fr',
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',
    editable: true,
    selectable: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay'
    },
    events: emplois,

    // Clic sur une case vide → ouvrir modal ajout
    dateClick: function (info) {
      dateSelectionnee = info.dateStr
      document.getElementById('date-selectionnee').textContent =
        new Date(info.dateStr).toLocaleDateString('fr-FR', {
          weekday: 'long', day: 'numeric', month: 'long'
        })
      document.getElementById('modal').style.display = 'flex'
    },

    // Clic sur un cours → ouvrir modal suppression
    eventClick: function (info) {
      coursASupprimer = info.event.id
      document.getElementById('info-cours-suppression').textContent =
        info.event.title + ' — ' +
        new Date(info.event.start).toLocaleDateString('fr-FR', {
          weekday: 'long', day: 'numeric', month: 'long'
        })
      document.getElementById('modal-suppression').style.display = 'flex'
    }
  })

  calendar.render()
}

// =============================================
// FERMER MODAL AJOUT
// =============================================
function fermerModal() {
  document.getElementById('modal').style.display = 'none'
  document.getElementById('module').value = ''
  document.getElementById('enseignant').value = ''
  document.getElementById('heure-debut').value = '08:00'
  document.getElementById('heure-fin').value = '10:00'
}

// =============================================
// ENREGISTRER UN COURS → BACK
// =============================================
async function enregistrer() {
  const ecId = document.getElementById('module').value
  const enseignantId = document.getElementById('enseignant').value
  const heureDebut = document.getElementById('heure-debut').value
  const heureFin = document.getElementById('heure-fin').value

  if (!ecId || !enseignantId || !heureDebut || !heureFin) {
    alert('Veuillez remplir tous les champs')
    return
  }

  const date = dateSelectionnee.split('T')[0]

  try {
    const res = await fetch('http://localhost:5000/api/planning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ec_id: parseInt(ecId),
        classe_id: parseInt(CLASSE_ID),
        enseignant_id: parseInt(enseignantId),
        date: date,
        heure_debut: heureDebut,
        heure_fin: heureFin
      })
    })

    if (res.ok) {
      fermerModal()
      const emplois = await chargerEmplois()
      calendar.removeAllEvents()
      calendar.addEventSource(emplois)
    } else {
      alert('Erreur lors de l\'enregistrement')
    }

  } catch {
    alert('Impossible de contacter le serveur')
  }
}

// =============================================
// FERMER MODAL SUPPRESSION
// =============================================
function fermerModalSuppression() {
  document.getElementById('modal-suppression').style.display = 'none'
  coursASupprimer = null
}

// =============================================
// CONFIRMER SUPPRESSION → BACK
// =============================================
async function confirmerSuppression() {
  if (!coursASupprimer) return

  try {
    const res = await fetch(
      `http://localhost:5000/api/planning/${coursASupprimer}`,
      { method: 'DELETE' }
    )

    if (res.ok) {
      calendar.getEventById(coursASupprimer).remove()
      fermerModalSuppression()
    } else {
      alert('Erreur lors de la suppression')
    }

  } catch {
    alert('Impossible de contacter le serveur')
  }
}

// =============================================
// EXPORT PDF
// =============================================
function exporterPDF() {
  const { jsPDF } = window.jspdf

  html2canvas(document.getElementById('calendrier'), {
    scale: 2,
    useCORS: true
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('landscape', 'mm', 'a4')
    const largeur = pdf.internal.pageSize.getWidth()

    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text(
      `Emploi du Temps — ${CLASSE_NOM}`,
      largeur / 2, 15,
      { align: 'center' }
    )

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(
      `Exporté le ${new Date().toLocaleDateString('fr-FR')}`,
      largeur / 2, 22,
      { align: 'center' }
    )

    const ratio = canvas.width / canvas.height
    const imgHauteur = (largeur - 20) / ratio
    pdf.addImage(imgData, 'PNG', 10, 28, largeur - 20, imgHauteur)

    pdf.save(`emploi_du_temps_${CLASSE_NOM.replace(/ /g, '_')}.pdf`)
  })
}