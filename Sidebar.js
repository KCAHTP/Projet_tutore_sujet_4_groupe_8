document.addEventListener("DOMContentLoaded", function () {

    // CSS
    if (!document.querySelector('link[href="Sidebar.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'Sidebar.css';
        document.head.appendChild(link);
    }

    // Conteneur
    let container = document.getElementById('sidebar-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'sidebar-container';
        document.body.prepend(container);
    }

    // Chargement HTML
    fetch('Sidebar.html')
        .then(r => r.text())
        .then(html => {
            container.innerHTML = html;

            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebar-overlay');
            const btn = document.getElementById('hamburger-btn');

            // Lien actif
            const links = sidebar.querySelectorAll('nav a');
            links.forEach(link => {
                if (link.href === location.href) {
                    link.classList.add('active');
                }
            });

            // Toggle hamburger
            btn.addEventListener('click', () => {
                const isOpen = sidebar.classList.toggle('open');
                overlay.classList.toggle('visible', isOpen);
                btn.classList.toggle('open', isOpen);
            });

            // Fermer en cliquant sur l'overlay
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('visible');
                btn.classList.remove('open');
            });
        });
});