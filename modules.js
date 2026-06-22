document.addEventListener('DOMContentLoaded', async () => {
    const classId = localStorage.getItem('classe_id');
    const classeNom = localStorage.getItem('classe_choisie')
    const modulesList = document.getElementById('modulesList');

    if (!classId) {
       window.location.href = 'accueil.html'
        return;
    }

    try {
        // Remplacez '/api/ec' par l'URL réelle de votre backend
        const [resEcs,resEnseignants] = await Promise.all([
            fetch(`${API_URL}/api/ec?classe_id=${classId}`),
            fetch(`${API_URL}/api/enseignants`)
        ])


        if (!resEcs.ok || !resEnseignants.ok) throw new Error()
 
        const ecs          = await resEcs.json()
        const enseignants  = await resEnseignants.json()
 
        // Dictionnaire id → "Prénom Nom"
        const dicoEnseignants = {}
        enseignants.forEach(e => {
            dicoEnseignants[e.id] = `${e.prenom} ${e.nom}`
        })
        

        if (ecs.length === 0) {
            modulesList.innerHTML = '<p>Aucun module trouvé pour cette classe.</p>';
            return;
        }

        modulesList.innerHTML = ''; 
        
        ecs.forEach(ec => {
            const div = document.createElement('div');
            div.className = 'module-card';
            div.innerHTML = `
                <h3>${ec.nom}</h3>
                <p><strong>Enseignant :</strong> ${dicoEnseignants[ec.enseignant_id] || 'Non assigné'}</p>
                <p><strong>Volume horaire :</strong> ${ec.volume_horaire} heures</p>
            `;
            modulesList.appendChild(div);
        });
    } catch (error) {
        console.error("Erreur API :", error);
        modulesList.innerHTML = '<p>Erreur de connexion au serveur.</p>';
    }
});
