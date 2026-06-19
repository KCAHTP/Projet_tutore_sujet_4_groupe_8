// Lecture de la classe choisie depuis localStorage (comme emploi.js)
const CLASSE_ID = localStorage.getItem('classe_id');
const CLASSE_NOM = localStorage.getItem('classe_choisie');

document.addEventListener('DOMContentLoaded', () => {
  // Sécurité — si pas de classe choisie, retour à l'accueil
  if (!CLASSE_ID || !CLASSE_NOM) {
    window.location.href = 'accueil.html';
    return;
  }

  document.getElementById('semaine-selectionnee').valueAsDate = new Date();
  document.getElementById('nom-classe').textContent = CLASSE_NOM;
  rafraichirDonneesSemaine();
});

function rafraichirDonneesSemaine() {
  chargerPrevisionsSemaine();
  chargerDevoirsSemaine();
}

// =========================================================================
// PARTIE 1 : SUIVI DES HEURES
// =========================================================================
async function chargerPrevisionsSemaine() {
  const dateChoisie = document.getElementById('semaine-selectionnee').value;
  try {
    const res = await fetch(`http://localhost:5000/api/suivi/semaine?classeId=${CLASSE_ID}&date=${dateChoisie}`);
    if (!res.ok) throw new Error();
    afficherLignesSuivi(await res.json());
  } catch (err) {
    console.warn("Impossible de charger les cours.");
    afficherLignesSuivi([]);
  }
}

function afficherLignesSuivi(listeCours) {
  const tbody = document.getElementById('liste-suivi-cours');
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!listeCours || listeCours.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Aucun cours cette semaine.</td></tr>`;
    return;
  }

  listeCours.forEach(cours => {
    const [hDeb, mDeb] = cours.heure_debut.split(':').map(Number);
    const [hFin, mFin] = cours.heure_fin.split(':').map(Number);
    const heuresPrevues = (hFin + mFin/60) - (hDeb + mDeb/60);
    const heuresFaitesInitiales = cours.heures_faites !== null ? cours.heures_faites : heuresPrevues;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${formaterDate(cours.date)}</strong><br><small>${cours.heure_debut} - ${cours.heure_fin}</small></td>
      <td>${cours.matiere}</td>
      <td>${cours.enseignant}</td>
      <td><span>${heuresPrevues} h</span></td>
      <td>
        <input type="number" step="0.5" min="0" class="input-heures-faites" id="fait-${cours.id}" value="${heuresFaitesInitiales}" oninput="calculerEcart(${cours.id}, ${heuresPrevues})" /> h
      </td>
      <td><span id="badge-${cours.id}" class="status-badge status-ok">Conforme</span></td>
    `;
    tbody.appendChild(tr);
    calculerEcart(cours.id, heuresPrevues);
  });
}

function calculerEcart(id, prevu) {
  const fait = parseFloat(document.getElementById(`fait-${id}`).value) || 0;
  const badge = document.getElementById(`badge-${id}`);
  if (!badge) return;

  if (fait === prevu) {
    badge.textContent = "Conforme";
    badge.className = "status-badge status-ok";
  } else {
    const diff = fait - prevu;
    badge.textContent = diff > 0 ? `+${diff} h (Sup)` : `${diff} h (Sous-effectué)`;
    badge.className = "status-badge status-alert";
  }
}

async function enregistrerSuiviSemaine() {
  const inputs = document.querySelectorAll('.input-heures-faites');
  const donneesSuivi = Array.from(inputs).map(input => ({
    planning_id: parseInt(input.id.split('-')[1]),
    heures_realisees: parseFloat(input.value) || 0
  }));

  try {
    const res = await fetch('http://localhost:5000/api/suivi/valider', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suivi: donneesSuivi })
    });
    if (res.ok) alert("Rapport enregistré !");
    else alert("Erreur lors de l'enregistrement.");
  } catch (err) {
    console.error("Impossible de contacter le serveur.", err);
  }
}

// =========================================================================
// PARTIE 2 : GESTION DES DEVOIRS
// =========================================================================
async function chargerDevoirsSemaine() {
  const dateChoisie = document.getElementById('semaine-selectionnee').value;
  try {
    const res = await fetch(`http://localhost:5000/api/devoirs?classeId=${CLASSE_ID}&date=${dateChoisie}`);
    if (!res.ok) throw new Error();
    afficherDevoirs(await res.json());
  } catch (err) {
    console.warn("Impossible de charger les devoirs.");
    afficherDevoirs([]);
  }
}

function afficherDevoirs(listeDevoirs) {
  const conteneur = document.getElementById('liste-devoirs');
  if (!conteneur) return;
  conteneur.innerHTML = "";

  if (!listeDevoirs || listeDevoirs.length === 0) {
    conteneur.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#64748b;">Aucun devoir programmé.</p>`;
    return;
  }

  listeDevoirs.forEach(devoir => {
    const card = document.createElement('div');
    card.className = `devoir-card ${devoir.statut === 'Fait' ? 'card-confirmee' : devoir.statut === 'Non fait' ? 'card-annulee' : ''}`;

    let boutonsHTML = devoir.statut === "En attente"
      ? `<div class="card-actions">
          <button onclick="validerDevoir(${devoir.id}, 'Fait')" class="btn-confirm">✔️ Confirmer</button>
          <button onclick="validerDevoir(${devoir.id}, 'Non fait')" class="btn-reject">❌ Non fait</button>
         </div>`
      : `<span class="status-final">${devoir.statut === 'Fait' ? '🟢 Effectué' : '🔴 Non fait'}</span>`;

    card.innerHTML = `
      <h3>${devoir.matiere}</h3>
      <p class="devoir-prof">Enseignant : <strong>${devoir.enseignant}</strong></p>
      <p class="devoir-date" style="font-size: 0.9em; color: #64748b; margin-top: -10px; margin-bottom: 10px;">
        📅 Date : <strong>${formaterDate(devoir.date)}</strong>
      </p>
      ${boutonsHTML}
    `;
    conteneur.appendChild(card);
  });
}

async function validerDevoir(devoirId, statutChoisi) {
  try {
    const res = await fetch('http://localhost:5000/api/devoirs/valider', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ devoir_id: devoirId, statut: statutChoisi })
    });
    if (res.ok) chargerDevoirsSemaine();
    else alert("Erreur lors de la validation.");
  } catch (err) {
    console.error("Impossible de contacter le serveur.", err);
  }
}

function formaterDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'short'
  });
}