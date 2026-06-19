document.addEventListener('DOMContentLoaded', () => {
  chargerEnseignantsDansSelect()
})

function afficherFormulaire(type) {
  fermerFormulaire()
  document.getElementById(`form-${type}`).style.display = 'block'
}

function fermerFormulaire() {
  document.getElementById('form-enseignant').style.display = 'none'
  document.getElementById('form-ec').style.display = 'none'
}

// Remplit le menu enseignants dans le formulaire EC
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

async function ajouterEnseignant() {
  const nom = document.getElementById('ens-nom').value.trim()
  const prenom = document.getElementById('ens-prenom').value.trim()
  const dispo = document.getElementById('ens-dispo').value.trim()

  if (!nom || !prenom) {
    alert('Veuillez remplir le nom et le prénom')
    return
  }

  try {
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