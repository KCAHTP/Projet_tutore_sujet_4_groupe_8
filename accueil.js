// =============================================
// ACCUEIL.JS
// Charge les classes depuis le back et
// gère la sélection + redirection
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    chargerClasses()

    document.getElementById('validerBtn').addEventListener('click', () => {
        const select = document.getElementById('classeSelect')
        const valeur = select.value

        if (!valeur) {
            alert("Veuillez choisir une classe.")
            return
        }

        // La valeur est au format "id|nom" ex: "3|L3 - ISI"
        const [id, nom] = valeur.split('|')

        // Stockage avec les mêmes clés que emploi.js, suivi.js, etc.
        localStorage.setItem('classe_id', id)
        localStorage.setItem('classe_choisie', nom)

        // Redirection vers le tableau de bord
        window.location.href = 'tableau_bord.html'
    })
})

// =============================================
// CHARGER LES CLASSES DEPUIS LE BACK
// =============================================
async function chargerClasses() {
    const select = document.getElementById('classeSelect')

    try {
        // /api/classes — route définie dans routes.py
        const res = await fetch('http://localhost:5000/api/classes')
        if (!res.ok) throw new Error()
        const classes = await res.json()

        // Réinitialise le select
        select.innerHTML = '<option value="" disabled selected>-- Choisissez votre classe --</option>'

        // On regroupe les classes par niveau pour faire des <optgroup>
        // Ex: { "L1": [...], "L2": [...], "L3": [...], "M1": [...], "M2": [...] }
        const parNiveau = {}
        classes.forEach(c => {
            if (!parNiveau[c.niveau]) parNiveau[c.niveau] = []
            parNiveau[c.niveau].push(c)
        })

        // Ordre d'affichage souhaité
        const ordreNiveaux = ['L1', 'L2', 'L3', 'M1', 'M2']

        ordreNiveaux.forEach(niveau => {
            const groupe = parNiveau[niveau]
            if (!groupe) return

            if (groupe.length === 1) {
                // Pas de groupe si un seul élément (ex: L1, L2)
                const c = groupe[0]
                const option = document.createElement('option')
                option.value = `${c.id}|${niveau} - ${c.nom}`
                option.textContent = `${niveau} - ${c.nom}`
                select.appendChild(option)
            } else {
                // Plusieurs classes dans ce niveau → <optgroup>
                const optgroup = document.createElement('optgroup')
                optgroup.label = niveau === 'L3' ? 'Licence 3'
                               : niveau === 'M1' ? 'Master 1'
                               : niveau === 'M2' ? 'Master 2'
                               : niveau

                groupe.forEach(c => {
                    const option = document.createElement('option')
                    option.value = `${c.id}|${niveau} - ${c.nom}`
                    option.textContent = `${niveau} - ${c.nom}`
                    optgroup.appendChild(option)
                })

                select.appendChild(optgroup)
            }
        })

    } catch {
        // Si le back est indisponible, on affiche un message
        select.innerHTML = '<option value="" disabled selected>-- Erreur de chargement --</option>'
        console.warn('Impossible de charger les classes depuis le serveur')
    }
}
