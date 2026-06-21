form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        errorMessage.textContent = "Veuillez remplir tous les champs";
        return;
    }

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.success) {
            window.location.href = "accueil.html";
        } else {
            errorMessage.textContent = data.message;
        }
    } catch (err) {
        errorMessage.textContent = "Erreur de connexion au serveur";
    }
});