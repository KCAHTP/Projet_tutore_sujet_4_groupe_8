// =============================================
// SUIVI.JS
// Validation des devoirs (évaluations) 
// de la classe choisie
// =============================================

// Lecture du localStorage — classe déjà choisie
const CLASSE_ID = localStorage.getItem('classe_id')
const CLASSE_NOM = localStorage.getItem('classe_choisie')

document.addEventListener('DOMContentLoaded', () => {

    // Sécurité — si pas de classe choisie, retour à l'accueil
    if (!CLASSE_ID || !CLASSE_NOM) {
        window.location.href = 'accueil.html'
        return
    }

    // Affiche le nom de la classe
    document.getElementById('nom-classe').textContent = CLASSE_NOM

    // Charge les devoirs
    chargerDevoirs()
})

// =============================================
// CHARGER LES DEVOIRS DE LA CLASSE
// =============================================
async function chargerDevoirs() {
    const conteneur = document.getElementById('liste-devoirs')
    conteneur.innerHTML = '<p class="chargement">Chargement des devoirs...</p>'

    try {
        // /api/evaluations — route définie dans evaluations.py
        const res = await fetch('http://localhost:5000/api/evaluations')
        if (!res.ok) throw new Error()
        const evaluations = await res.json()

        // On filtre côté front par classe_id
        const devoirsClasse = evaluations.filter(e => e.classe_id === parseInt(CLASSE_ID))

        afficherDevoirs(devoirsClasse)

    } catch {
        conteneur.innerHTML = '<p class="erreur">Erreur de connexion au serveur.</p>'
        console.warn('Impossible de charger les devoirs')
    }
}

// =============================================
// AFFICHER LES DEVOIRS
// =============================================
function afficherDevoirs(liste) {
    const conteneur = document.getElementById('liste-devoirs')
    conteneur.innerHTML = ''

    if (!liste || liste.length === 0) {
        conteneur.innerHTML = '<p class="vide">Aucun devoir programmé pour cette classe.</p>'
        return
    }

    liste.forEach(devoir => {
        const card = document.createElement('div')

        // Couleur de la carte selon le statut
        let classeStatut = ''
        if (devoir.statut === 'terminée') classeStatut = 'card-confirmee'
        else if (devoir.statut === 'Non fait') classeStatut = 'card-annulee'
        card.className = `devoir-card ${classeStatut}`

        // Boutons ou statut final
        let boutonsHTML = ''
        if (devoir.statut === 'planifiée' || devoir.statut === 'planifie' || devoir.statut === 'en cours') {
            boutonsHTML = `
                <div class="card-actions">
                    <button onclick="validerDevoir(${devoir.id}, 'terminée')" class="btn-confirm">✔️ Fait</button>
                    <button onclick="validerDevoir(${devoir.id}, 'Non fait')" class="btn-reject">❌ Non fait</button>
                </div>`
        } else {
            boutonsHTML = `<span class="status-final">
                ${devoir.statut === 'terminée' ? '🟢 Effectué' : '🔴 Non fait'}
            </span>`
        }

        card.innerHTML = `
            <h3>Évaluation #${devoir.id}</h3>
            <p><strong>Type :</strong> ${devoir.type}</p>
            <p><strong>Date :</strong> ${devoir.date ? formaterDate(devoir.date) : 'Non définie'}</p>
            <p><strong>Statut :</strong> ${devoir.statut}</p>
            ${boutonsHTML}
        `
        conteneur.appendChild(card)
    })
}

// =============================================
// VALIDER UN DEVOIR → BACK
// =============================================
async function validerDevoir(devoirId, statutChoisi) {
    try {
        // PUT /api/evaluations/<id> — route définie dans evaluations.py
        const res = await fetch(`http://localhost:5000/api/evaluations/${devoirId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ statut: statutChoisi })
        })

        if (res.ok) {
            // Recharge la liste pour refléter le nouveau statut
            chargerDevoirs()
        } else {
            alert("Erreur lors de la validation.")
        }

    } catch {
        alert("Impossible de contacter le serveur.")
        console.error("Erreur validation devoir")
    }
}

// =============================================
// FORMATER UNE DATE
// =============================================
function formaterDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long'
    })
}
