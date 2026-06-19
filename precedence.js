document.addEventListener('DOMContentLoaded', async () => {
    const moduleSelect = document.getElementById('moduleSelect');
    const predSelect = document.getElementById('predecesseurSelect');

    // 1. Récupérer tous les EC pour remplir les menus
    const response = await fetch('/api/ec'); 
    const ecs = await response.json();

    ecs.forEach(ec => {
        // On affiche le nom, mais on stocke l'ID dans la valeur
        const option1 = `<option value="${ec.id}">${ec.nom}</option>`;
        const option2 = `<option value="${ec.id}">${ec.nom}</option>`;
        moduleSelect.innerHTML += option1;
        predSelect.innerHTML += option2;
    });
});

// 2. Envoi du formulaire (envoi des IDs)
document.getElementById('precedenceForm').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
        ec_id: document.getElementById('moduleSelect').value,
        ec_avant_id: document.getElementById('predecesseurSelect').value
    };
    
    await fetch('/api/precedence', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    alert("Précédence ajoutée !");
};