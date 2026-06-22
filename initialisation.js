document.addEventListener('DOMContentLoaded', () => {
  chargerEnseignantsDansSelect()
  chargerClassesDansSelect()
  chargerTableauEnseignants()
  chargerTableauEC()
})

function afficherFormulaire(type) {
  fermerFormulaire()
  document.getElementById(`form-${type}`).style.display = 'block'
}

function fermerFormulaire() {
  document.getElementById('form-enseignant').style.display = 'none'
  document.getElementById('form-ec').style.display = 'none'
}

// CHARGER LES CLASSES DANS LE SELECT EC
async function chargerClassesDansSelect() {
  try {
    const res = await fetch(`${API_URL}/api/classes`)
    if (!res.ok) throw new Error()
    const classes = await res.json()

    const select = document.getElementById('ec-classe')
    select.innerHTML = '<option value="">-- Choisir une classe --</option>'

    const libelleNiveau = {
      'L1': 'Licence 1', 'L2': 'Licence 2', 'L3': 'Licence 3',
      'M1': 'Master 1', 'M2': 'Master 2'
    }

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
        const option = document.createElement('option')
        option.value = groupe[0].id
        option.textContent = libelle
        select.appendChild(option)
      } else {
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

// CHARGER LES ENSEIGNANTS DANS LE SELECT EC
async function chargerEnseignantsDansSelect() {
  try {
    const res = await fetch(`${API_URL}/api/enseignants`)
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
    console.warn('Enseignants non disponibles')
  }
}

// TABLEAU ENSEIGNANTS
async function chargerTableauEnseignants() {
  try {
    const res = await fetch(`${API_URL}/api/enseignants`)
    if (!res.ok) throw new Error()
    const liste = await res.json()
    const tbody = document.getElementById('table-enseignants')

    if (liste.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Aucun enseignant enregistré.</td></tr>'
      return
    }

    tbody.innerHTML = ''
    liste.forEach(e => {
      const tr = document.createElement('tr')
      tr.innerHTML = `
        <td>${e.nom}</td>
        <td>${e.prenom}</td>
        <td>${e.disponibilites || '—'}</td>
        <td><button class="btn-delete" onclick="supprimerEnseignant(${e.id})">Supprimer</button></td>
      `
      tbody.appendChild(tr)
    })
  } catch {
    console.warn('Erreur chargement tableau enseignants')
  }
}

// TABLEAU EC
async function chargerTableauEC() {
  try {
    const [resEC, resClasses, resEnseignants] = await Promise.all([
      fetch(`${API_URL}/api/ec`),
      fetch(`${API_URL}/api/classes`),
      fetch(`${API_URL}/api/enseignants`)
    ])
    const ecs = await resEC.json()
    const classes = await resClasses.json()
    const enseignants = await resEnseignants.json()

    const mapClasses = {}
    classes.forEach(c => mapClasses[c.id] = `${c.niveau} - ${c.nom}`)

    const mapEnseignants = {}
    enseignants.forEach(e => mapEnseignants[e.id] = `${e.prenom} ${e.nom}`)

    const tbody = document.getElementById('table-ec')

    if (ecs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Aucun module enregistré.</td></tr>'
      return
    }

    tbody.innerHTML = ''
    ecs.forEach(ec => {
      const tr = document.createElement('tr')
      tr.innerHTML = `
        <td>${ec.nom}</td>
        <td>${ec.volume_horaire}h</td>
        <td>${mapClasses[ec.classe_id] || ec.classe_id}</td>
        <td>${mapEnseignants[ec.enseignant_id] || ec.enseignant_id}</td>
        <td><button class="btn-delete" onclick="supprimerEC(${ec.id})">Supprimer</button></td>
      `
      tbody.appendChild(tr)
    })
  } catch {
    console.warn('Erreur chargement tableau EC')
  }
}

// SUPPRIMER UN ENSEIGNANT
async function supprimerEnseignant(id) {
    if (!confirm('Supprimer cet enseignant ?')) return
    try {
        const res = await fetch(`${API_URL}/api/enseignants/${id}`, { method: 'DELETE' })
        const data = await res.json()
        if (res.ok) {
            chargerTableauEnseignants()
            chargerEnseignantsDansSelect()
        } else {
            alert(data.message)
        }
    } catch {
        alert('Erreur de connexion au serveur')
    }
}

// SUPPRIMER UN EC
async function supprimerEC(id) {
  if (!confirm('Supprimer ce module ?')) return
  try {
    const res = await fetch(`${API_URL}/api/ec/${id}`, { method: 'DELETE' })
    if (res.ok) {
      chargerTableauEC()
    } else {
      alert('Erreur lors de la suppression')
    }
  } catch {
    alert('Erreur de connexion au serveur')
  }
}

// AJOUTER UN ENSEIGNANT
async function ajouterEnseignant() {
  const nom = document.getElementById('ens-nom').value.trim()
  const prenom = document.getElementById('ens-prenom').value.trim()
  const dispo = document.getElementById('ens-dispo').value.trim()

  if (!nom || !prenom) {
    alert('Veuillez remplir le nom et le prénom')
    return
  }

  try {
    const res = await fetch(`${API_URL}/api/enseignants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, prenom, disponibilites: dispo })
    })
    if (res.ok) {
      alert('Enseignant ajouté !')
      fermerFormulaire()
      chargerEnseignantsDansSelect()
      chargerTableauEnseignants()
    }
  } catch {
    alert('Erreur de connexion au serveur')
  }
}

// AJOUTER UN MODULE (EC)
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
    const res = await fetch(`${API_URL}/api/ec`, {
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
      chargerTableauEC()
    }
  } catch {
    alert('Erreur de connexion au serveur')
  }
}