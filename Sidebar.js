(function() {
    "use strict"; // Active le mode strict pour éviter les erreurs courantes

    const initSidebar = () => {
        //  Injection sécurisée du CSS
        if (!document.querySelector('link[href="Sidebar.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'Sidebar.css';
            document.head.appendChild(link);
        }

        // Vérification de l'existence du conteneur
        let container = document.getElementById('sidebar-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'sidebar-container';
            // On insère le conteneur en tout début de body
            document.body.prepend(container);
        }

        // Fetch sécurisé
        fetch('Sidebar.html')
            .then(response => {
                if (!response.ok) throw new Error('Erreur chargement Sidebar.html');
                return response.text();
            })
            .then(data => {
                container.innerHTML = data;

                const hamburger = document.getElementById('hamburger-btn');
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('sidebar-overlay');

                hamburger.addEventListener('click', () => {
                    sidebar.classList.toggle('open');
                    hamburger.classList.toggle('open');
                    overlay.classList.toggle('visible');
                });

                overlay.addEventListener('click', () => {
                    sidebar.classList.remove('open');
                hamburger.classList.remove('open');
                    overlay.classList.remove('visible');
                });
            })
            .catch(err => console.warn("Sidebar non chargée :", err.message));
    };

    // Lancement une fois que le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSidebar);
    } else {
        initSidebar();
    }
})();