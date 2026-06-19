document.getElementById('validerBtn').addEventListener('click', () => {
    const select = document.getElementById('classeSelect');
    const valeur = select.value;

    if (!valeur) {
        alert("Veuillez choisir une classe.");
        return;
    }

    // La valeur est au format "id|nom" ex: "3|L3 - ISI"
    const [id, nom] = valeur.split('|');

    // Stockage avec les mêmes clés que emploi.js, suivi.js, etc.
    localStorage.setItem('classe_id', id);
    localStorage.setItem('classe_choisie', nom);

    // Redirection vers le tableau de bord
    window.location.href = 'tableau_bord.html';
});