form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Test temporaire sans backend
    if (username && password) {
        window.location.href = "accueil.html";
        return;
    }

    errorMessage.textContent = "Veuillez remplir tous les champs";
});