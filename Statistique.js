document.addEventListener("DOMContentLoaded", chargerStatistiques);

async function chargerStatistiques() {

    try {

        const response = await fetch(
            "http://localhost:8080/statistiques"
        );

        const data = await response.json();

        document.getElementById("total").textContent =
            data.total_evaluations;

        document.getElementById("terminees").textContent =
            data.terminées;

        document.getElementById("planifiees").textContent =
            data.planifiées;

        document.getElementById("encours").textContent =
            data.en_cours;

        document.getElementById("retard").textContent =
            data.en_retard;

        document.getElementById("pourcentage").textContent =
            data.avancement_global;

        document.getElementById("progress-bar").style.width =
            data.avancement_global;

        const tbody =
            document.getElementById("table-classes");

        tbody.innerHTML = "";

        data.statistiques_par_classe.forEach(classe => {

            const ligne = `
                <tr>
                    <td>${classe.classe}</td>
                    <td>${classe.total_evaluations}</td>
                    <td>${classe.terminées}</td>
                    <td>${classe.avancement}</td>
                </tr>
            `;

            tbody.innerHTML += ligne;
        });

    } catch(error) {

        console.error(error);

        alert(
            "Impossible de charger les statistiques"
        );
    }
}