document.addEventListener("DOMContentLoaded", function() {
    // 1. Injecter le CSS
    if (!document.querySelector('link[href="Sidebar.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'Sidebar.css';
        document.head.appendChild(link);
    }

    // 2. Créer le conteneur s'il n'existe pas
    let sidebarDiv = document.getElementById('sidebar-container');
    if (!sidebarDiv) {
        sidebarDiv = document.createElement('div');
        sidebarDiv.id = 'sidebar-container';
        document.body.prepend(sidebarDiv);
    }

    // 3. Charger le HTML
    fetch('Sidebar.html')
        .then(response => response.text())
        .then(data => {
            sidebarDiv.innerHTML = data;
        });
});