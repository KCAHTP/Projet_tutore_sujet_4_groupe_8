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
    await chargerPrecedences()
})

// CHARGER LES MODULES DE LA CLASSE CHOISIE
async function chargerModules() {
    const moduleSelect = document.getElementById('moduleSelect')
    const predSelect = document.getElementById('predecesseurSelect')

    try {
        // /api/ec?classe_id=... — route définie dans routes.py
        const res = await fetch(`${API_URL}/api/ec?classe_id=${CLASSE_ID}`)
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

// ENREGISTRER LA PRECEDENCE
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
        // /api/precedences POST
        // body attendu : { ec_avant_id, ec_apres_id }
        const res = await fetch(`${API_URL}/api/precedences`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ec_avant_id: parseInt(ecAvantId),
                ec_apres_id: parseInt(ecApresId)
            })
        })

        if (res.ok) {
            document.getElementById('moduleSelect').value = ''
            document.getElementById('predecesseurSelect').value = ''
            chargerPrecedences() // tableau se rafraîchit automatiquement
        } else {
            alert("Erreur lors de l'enregistrement")
        }

    } catch {
        alert('Impossible de contacter le serveur')
    }
})

async function chargerPrecedences() {
    const tbody = document.getElementById('tableau-precedences')
    tbody.innerHTML = '<tr><td colspan="3">Chargement...</td></tr>'

    try {
        const [resPrecedences, resEC] = await Promise.all([
            fetch(`${API_URL}/api/precedences`),
            fetch(`${API_URL}/api/ec`)
        ])
        const precedences = await resPrecedences.json()
        const ecs = await resEC.json()

        const ecMap = {}
        ecs.forEach(ec => ecMap[ec.id] = ec.nom)

        // Filtre uniquement les précédences de la classe courante
        const ecClasse = ecs.filter(ec => ec.classe_id === parseInt(CLASSE_ID)).map(ec => ec.id)
        const filtrees = precedences.filter(p =>
            ecClasse.includes(p.ec_avant_id) && ecClasse.includes(p.ec_apres_id)
        )

        if (filtrees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center">Aucune précédence enregistrée</td></tr>'
            return
        }

        tbody.innerHTML = ''
        filtrees.forEach(p => {
            const tr = document.createElement('tr')
            tr.innerHTML = `
                <td>${ecMap[p.ec_avant_id] || '#' + p.ec_avant_id}</td>
                <td>${ecMap[p.ec_apres_id] || '#' + p.ec_apres_id}</td>
                <td><button onclick="supprimerPrecedence(${p.id})" class="btn-suppr">🗑 Supprimer</button></td>
            `
            tbody.appendChild(tr)
        })

    } catch {
        tbody.innerHTML = '<tr><td colspan="3" class="erreur">Erreur de chargement</td></tr>'
    }
}

async function supprimerPrecedence(id) {
    if (!confirm('Supprimer cette précédence ?')) return
    const res = await fetch(`${API_URL}/api/precedences/${id}`, { method: 'DELETE' })
    if (res.ok) chargerPrecedences()
    else alert('Erreur lors de la suppression')
}