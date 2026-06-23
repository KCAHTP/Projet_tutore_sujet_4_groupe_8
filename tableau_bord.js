
document.addEventListener("DOMContentLoaded", async () => {
    const className = localStorage.getItem('classe_choisie')
    const classeId = parseInt(localStorage.getItem('classe_id'))
    document.getElementById('welcomeMessage').textContent =
        className ? `Bienvenue dans la classe ${className}` : "Bienvenue (Aucune classe sélectionnée)"

        try {
            const [resStats, resAlertes] = await Promise.all([
                fetch(`${API_URL}/statistiques`),
                fetch(`${API_URL}/alertes`)
            ])
            const stats = await resStats.json()
            const alertes = await resAlertes.json()

            // Filtre alertes de la classe courante
            const alertesClasse = alertes.filter(a => a.evaluation_id !== undefined)

            document.getElementById('total-ec').textContent = stats.total_evaluations ?? '—'
            document.getElementById('total-planifiees').textContent = stats.planifiées ?? '—'
            document.getElementById('total-terminees').textContent = stats.terminées ?? '—'
            document.getElementById('total-alertes').textContent = alertesClasse.length

            const pct = parseFloat(stats.avancement_global) || 0
            document.getElementById('avancement-global').textContent = stats.avancement_global ?? '—'
            document.getElementById('progress-bar').style.width = `${pct}%`

        } catch(err) {
            console.warn('Erreur chargement du tableau de bord', err)
    }
})
