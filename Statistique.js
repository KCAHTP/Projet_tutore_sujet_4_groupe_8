document.addEventListener("DOMContentLoaded", chargerStatistiques);

async function chargerStatistiques() {

    try {

        const res= await fetch(`${API_URL}/api/statistiques`)

        if(!res.ok) throw new Error()
        const data = await res.json()

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


        if (!data.statistiques_par_classe || data.statistiques_par_classe.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Aucune donnée disponible.</td></tr>`
            return
        }
        
        

        data.statistiques_par_classe.forEach(classe => {
            const ligne = document.createElement('tr')
            ligne.innerHTML = `
             
                    <td>${classe.classe}</td>
                    <td>${classe.total_evaluations}</td>
                    <td>${classe.terminées}</td>
                    <td>${classe.avancement}</td>
               
            `;

            tbody.appendChild(ligne)
        });

    } catch(error) {

        console.error("Erreur API statistiques :",error);

        alert(
            "Impossible de charger les statistiques")
        
    }
}
