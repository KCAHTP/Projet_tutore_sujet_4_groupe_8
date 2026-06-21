// =============================================
// PRECEDENCE.JS
// Gestion des précédences entre modules (EC)
// =============================================

// Lecture du localStorage — classe déjà choisie
const CLASSE_ID = localStorage.getItem('classe_id')
const CLASSE_NOM = localStorage.getItem('classe_choisie')

document.addEventListener('DOMContentLoaded', async () => {

    // Sécurité — si pas de classe choisie, retour à l'accueil
    if (!CLASSE_ID || !CLASSE_NOM) {
        window.location.href = 'accueil.html'
        return
    }

    await chargerModules()
})

// =============================================
// CHARGER LES MODULES DE LA CLASSE CHOISIE
// =============================================
async function chargerModules() {
    const moduleSelect = document.getElementById('moduleSelect')
    const predSelect = document.getElementById('predecesseurSelect')

    try {
        // /api/ec?classe_id=... — route définie dans routes.py
        const res = await fetch(`http://localhost:5000/api/ec?classe_id=${CLASSE_ID}`)
        if (!res.ok) throw new Error()
        const ecs = await res.json()

        if (ecs.length === 0) {
            moduleSelect.innerHTML = '<option value="">Aucun module disponible</option>'
            predSelect.innerHTML = '<option value="">Aucun module disponible</option>'
            return
        }

        moduleSelect.innerHTML = '<option value="">-- Choisir un module --</option>'
        predSelect.innerHTML = '<option value="">-- Choisir un prédécesseur --</option>'

        ecs.forEach(ec => {
            const option1 = document.createElement('option')
            option1.value = ec.id
            option1.textContent = ec.nom
            moduleSelect.appendChild(option1)

            const option2 = document.createElement('option')
            option2.value = ec.id
            option2.textContent = ec.nom
            predSelect.appendChild(option2)
        })

    } catch {
        console.warn('Modules non disponibles')
    }
}

// =============================================
// ENREGISTRER LA PRECEDENCE
// =============================================
document.getElementById('precedenceForm').addEventListener('submit', async (e) => {
    e.preventDefault()

    const ecApresId = document.getElementById('moduleSelect').value
    const ecAvantId = document.getElementById('predecesseurSelect').value

    if (!ecApresId || !ecAvantId) {
        alert('Veuillez sélectionner les deux modules')
        return
    }

    if (ecAvantId === ecApresId) {
        alert('Un module ne peut pas être son propre prédécesseur')
        return
    }

    try {
        // /api/precedences POST — route définie dans routes.py
        // body attendu : { ec_avant_id, ec_apres_id }
        const res = await fetch('http://localhost:5000/api/precedences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ec_avant_id: parseInt(ecAvantId),
                ec_apres_id: parseInt(ecApresId)
            })
        })

        if (res.ok) {
            alert('Précédence ajoutée avec succès !')
            document.getElementById('moduleSelect').value = ''
            document.getElementById('predecesseurSelect').value = ''
        } else {
            alert("Erreur lors de l'enregistrement")
        }

    } catch {
        alert('Impossible de contacter le serveur')
    }
})
