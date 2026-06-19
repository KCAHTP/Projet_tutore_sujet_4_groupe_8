document.addEventListener('DOMContentLoaded', async () => {
    const classId = localStorage.getItem('classId');
    const modulesList = document.getElementById('modulesList');

    if (!classId) {
        modulesList.innerHTML = '<p>Aucune classe trouvée. Veuillez vous connecter.</p>';
        return;
    }

    try {
        // Remplacez '/api/ec' par l'URL réelle de votre backend
        const response = await fetch(`/api/ec?classe_id=${classId}`);
        const ecs = await response.json();

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
                <p><strong>Enseignant :</strong> ${ec.enseignant.nom} ${ec.enseignant.prenom}</p>
                <p><strong>Volume horaire :</strong> ${ec.vol_horaire} heures</p>
            `;
            modulesList.appendChild(div);
        });
    } catch (error) {
        console.error("Erreur API :", error);
        modulesList.innerHTML = '<p>Erreur de connexion au serveur.</p>';
    }
});