console.log("EMPLOI JS CHARGE");

const CLASSE_ID = localStorage.getItem('classe_id')
const CLASSE_NOM = localStorage.getItem('classe_choisie')

let dateSelectionnee = ''
let coursASupprimer = null
let calendar

const dicoECs = {}
const dicoEnseignants = {}

document.addEventListener('DOMContentLoaded', async () => {
  if (!CLASSE_ID || !CLASSE_NOM) {
    window.location.href = 'accueil.html'
    return
  }

  document.getElementById('titre-classe').textContent = `Emploi Du Temps — ${CLASSE_NOM}`
  document.title = `Emploi du Temps — ${CLASSE_NOM}`

  await chargerModules()
  await chargerEnseignants()
  await initialiserCalendrier()
})

async function chargerModules() {
  try {
    const res = await fetch(`${API_URL}/api/ec?classe_id=${CLASSE_ID}`)
    if (!res.ok) throw new Error()
    const liste = await res.json()

    const select = document.getElementById('module')
    select.innerHTML = '<option value="">-- Choisir un module --</option>'

    liste.forEach(ec => {
      dicoECs[ec.id] = ec.nom  // BUG CORRIGÉ : dico → dicoECs
      const option = document.createElement('option')
      option.value = ec.id
      option.textContent = ec.nom
      select.appendChild(option)
    })
  } catch {
    console.warn('Modules non disponibles')
  }
}

async function chargerEnseignants() {
  try {
    const res = await fetch(`${API_URL}/api/enseignants`)
    if (!res.ok) throw new Error()
    const liste = await res.json()

    const select = document.getElementById('enseignant')
    select.innerHTML = '<option value="">-- Choisir un enseignant --</option>'

    liste.forEach(e => {
      dicoEnseignants[e.id] = `${e.prenom} ${e.nom}`
      const option = document.createElement('option')
      option.value = e.id
      option.textContent = `${e.prenom} ${e.nom}`
      select.appendChild(option)
    })
  } catch {
    console.warn('Enseignants non disponibles')
  }
}

async function chargerEmplois() {
  try {
    const res = await fetch(`${API_URL}/api/emplois-du-temps?classe_id=${CLASSE_ID}`)
    if (!res.ok) throw new Error()
    const data = await res.json()

    return data.map(e => ({
      id: e.id,
      
      title: `${dicoECs[e.ec_id] || 'Module inconnu'} - ${dicoEnseignants[e.enseignant_id] || 'Enseignant inconnu'}`,
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

    dateClick: function (info) {
      dateSelectionnee = info.dateStr
      document.getElementById('date-selectionnee').textContent =
        new Date(info.dateStr).toLocaleDateString('fr-FR', {
          weekday: 'long', day: 'numeric', month: 'long'
        })
      document.getElementById('modal').style.display = 'flex'
    },

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

function fermerModal() {
  document.getElementById('modal').style.display = 'none'
  document.getElementById('module').value = ''
  document.getElementById('enseignant').value = ''
  document.getElementById('heure-debut').value = '08:00'
  document.getElementById('heure-fin').value = '10:00'
}

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
    const res = await fetch(`${API_URL}/api/emplois-du-temps`, {
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
      alert("Erreur lors de l'enregistrement")
    }
  } catch {
    alert('Impossible de contacter le serveur')
  }
}

function fermerModalSuppression() {
  document.getElementById('modal-suppression').style.display = 'none'
  coursASupprimer = null
}

async function confirmerSuppression() {
  if (!coursASupprimer) return

  try {
    const res = await fetch(
      `${API_URL}/api/emplois-du-temps/${coursASupprimer}`,
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
    pdf.text(`Emploi du Temps — ${CLASSE_NOM}`, largeur / 2, 15, { align: 'center' })

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')}`, largeur / 2, 22, { align: 'center' })

    const ratio = canvas.width / canvas.height
    const imgHauteur = (largeur - 20) / ratio
    pdf.addImage(imgData, 'PNG', 10, 28, largeur - 20, imgHauteur)

    pdf.save(`emploi_du_temps_${CLASSE_NOM.replace(/ /g, '_')}.pdf`)
  })
}