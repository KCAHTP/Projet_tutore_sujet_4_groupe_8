document.addEventListener('DOMContentLoaded', () => {
  chargerEnseignantsDansSelect()
  chargerClassesDansSelect()
})

function afficherFormulaire(type) {
  fermerFormulaire()
  document.getElementById(`form-${type}`).style.display = 'block'
}

// =============================================
// AFFICHER / FERMER FORMULAIRES
// =============================================
function fermerFormulaire() {
  document.getElementById('form-enseignant').style.display = 'none'
  document.getElementById('form-ec').style.display = 'none'
}

// =============================================
// CHARGER LES CLASSES DANS LE SELECT EC
// =============================================
async function chargerClassesDansSelect() {
  try {
    // /api/classes — route définie dans routes.py
    const res = await fetch('http://localhost:5000/api/classes')
    if (!res.ok) throw new Error()
    const classes = await res.json()
 
    const select = document.getElementById('ec-classe')
    select.innerHTML = '<option value="">-- Choisir une classe --</option>'
 
    // Correspondance niveau court → libellé complet
    const libelleNiveau = {
      'L1': 'Licence 1',
      'L2': 'Licence 2',
      'L3': 'Licence 3',
      'M1': 'Master 1',
      'M2': 'Master 2'
    }
 
    // Regroupement par niveau
    const parNiveau = {}
    classes.forEach(c => {
      if (!parNiveau[c.niveau]) parNiveau[c.niveau] = []
      parNiveau[c.niveau].push(c)
    })
 
    const ordreNiveaux = ['L1', 'L2', 'L3', 'M1', 'M2']
 
    ordreNiveaux.forEach(niveau => {
      const groupe = parNiveau[niveau]
      if (!groupe) return
 
      const libelle = libelleNiveau[niveau] || niveau
 
      if (groupe.length === 1) {
        // L1 et L2 : option simple
        const c = groupe[0]
        const option = document.createElement('option')
        option.value = c.id
        option.textContent = libelle
        select.appendChild(option)
      } else {
        // L3, M1, M2 : optgroup avec sous-options
        const optgroup = document.createElement('optgroup')
        optgroup.label = libelle
 
        groupe.forEach(c => {
          const option = document.createElement('option')
          option.value = c.id
          option.textContent = `${libelle} - ${c.nom}`
          optgroup.appendChild(option)
        })
 
        select.appendChild(optgroup)
      }
    })
 
  } catch {
    console.warn('Classes non disponibles')
  }
}

// Remplit le menu enseignants dans le formulaire EC

// =============================================
// CHARGER LES ENSEIGNANTS DANS LE SELECT EC
// =============================================
async function chargerEnseignantsDansSelect() {
  try {
    const res = await fetch('http://localhost:5000/api/enseignants')
    if (!res.ok) throw new Error()
    const liste = await res.json()
    const select = document.getElementById('ec-enseignant')
    select.innerHTML = '<option value="">-- Choisir un enseignant --</option>'
    liste.forEach(e => {
      const option = document.createElement('option')
      option.value = e.id
      option.textContent = `${e.prenom} ${e.nom}`
      select.appendChild(option)
    })
  } catch {
    console.warn('Back non disponible')
  }
}


// =============================================
// AJOUTER UN ENSEIGNANT
// =============================================
async function ajouterEnseignant() {
  const nom = document.getElementById('ens-nom').value.trim()
  const prenom = document.getElementById('ens-prenom').value.trim()
  const dispo = document.getElementById('ens-dispo').value.trim()

  if (!nom || !prenom) {
    alert('Veuillez remplir le nom et le prénom')
    return
  }

  try {

    //!!!!!!!!!!!!!!!!
    // !!!!!!!!!!!!!!!!la route a ajoute pour renvoyer au back
    const res = await fetch('http://localhost:5000/api/enseignants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, prenom, disponibilites: dispo })
    })
    if (res.ok) {
      alert('Enseignant ajouté !')
      fermerFormulaire()
      chargerEnseignantsDansSelect()
    }
  } catch {
    alert('Erreur de connexion au serveur')
  }
}



// =============================================
// AJOUTER UN MODULE (EC)
// =============================================
async function ajouterEC() {
  const nom = document.getElementById('ec-nom').value.trim()
  const volume = document.getElementById('ec-volume').value
  const classeId = document.getElementById('ec-classe').value
  const enseignantId = document.getElementById('ec-enseignant').value

  if (!nom || !volume || !classeId || !enseignantId) {
    alert('Veuillez remplir tous les champs')
    return
  }

  try {
    const res = await fetch('http://localhost:5000/api/ec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom,
        volume_horaire: parseInt(volume),
        classe_id: parseInt(classeId),
        enseignant_id: parseInt(enseignantId)
      })
    })
    if (res.ok) {
      alert('Module ajouté !')
      fermerFormulaire()
    }
  } catch {
    alert('Erreur de connexion au serveur')
  }
}
