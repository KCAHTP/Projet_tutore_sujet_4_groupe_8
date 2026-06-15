import { useState, useEffect } from 'react';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import frLocale from '@fullcalendar/core/locales/fr';

export default function Planningg() {
    // États pour le calendrier et les événements
    const [events, setEvents] = useState([]);
    const [modalOuvert, setModalOuvert] = useState(false);

    // États pour les listes d'options (Clés étrangères)
    const [listeModules, setListeModules] = useState([]);
    const [listeEnseignants, setListeEnseignants] = useState([]);
    const [listeClasses, setListeClasses] = useState([]);

    // États pour les valeurs sélectionnées dans le formulaire
    const [dateSelectionnee, setDateSelectionnee] = useState('');
    const [moduleChoisi, setModuleChoisi] = useState('');
    const [enseignantChoisi, setEnseignantChoisi] = useState('');
    const [classeChoisie, setClasseChoisie] = useState('');
    const [heureDebut, setHeureDebut] = useState('08:00');
    const [heureFin, setHeureFin] = useState('10:00');

    // 1. Charger les événements du planning
    const chargerPlanning = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/planning");
            const formattedEvents = res.data.map(cours => ({
                id: cours.id, // ID de l'emploi du temps
                title: `${cours.nomMatiere || cours.matiere} - ${cours.nomEnseignant}`,
                start: `${cours.date}T${cours.heureDebut}`,
                end: `${cours.date}T${cours.heureFin}`,
                extendedProps: {
                    classe_id: cours.classe_id,
                    ec_id: cours.ec_id
                }
            }));
            setEvents(formattedEvents);
        } catch (err) {
            console.error("Erreur lors du chargement du planning :", err);
        }
    };

    // 2. Charger les données requises pour les formulaires (Modules, Enseignants, Classes)
    const chargerDonneesFormulaire = async () => {
        try {
            // Adapte les URLs selon tes routes backend réelles
            const [resModules, resEnseignants, resClasses] = await Promise.all([
                axios.get("http://localhost:8080/api/modules"),
                axios.get("http://localhost:8080/api/enseignants"),
                axios.get("http://localhost:8080/api/classes")
            ]);
            
            setListeModules(resModules.data);
            setListeEnseignants(resEnseignants.data);
            setListeClasses(resClasses.data);
        } catch (err) {
            console.error("Erreur lors du chargement des données initiales :", err);
        }
    };

    // Charger les données au montage du composant
    useEffect(() => {
        chargerPlanning();
        chargerDonneesFormulaire();
    }, []);

    // Action lors du clic sur une case du calendrier
    const handleDateClick = (info) => {
        setDateSelectionnee(info.dateStr);
        // Réinitialisation des sélections à l'ouverture
        setModuleChoisi("");
        setEnseignantChoisi("");
        setClasseChoisie("");
        setModalOuvert(true);
    };

    // Soumission du formulaire au backend
    const enregistrer = async () => {
        // Validation simple
        if (!moduleChoisi || !enseignantChoisi || !classeChoisie || !dateSelectionnee) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        const nouveauCours = {
            ec_id: parseInt(moduleChoisi),          // ID du module/élément constitutif
            classe_id: parseInt(classeChoisie),    // ID de la classe
            nomEnseignant: enseignantChoisi,        // Tu peux envoyer l'ID ou le nom selon ton backend (ici géré par ID si ta table stocke l'id)
            date: dateSelectionnee,
            heureDebut: heureDebut,
            heureFin: heureFin
        };

        try {
            await axios.post("http://localhost:8080/api/planning", nouveauCours);
            setModalOuvert(false);
            chargerPlanning(); // Recharger le calendrier mis à jour
        } catch (err) {
            console.error("Erreur lors de l'enregistrement du cours :", err);
            alert("Impossible d'enregistrer le cours.");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Emploi Du Temps</h2>

            {modalOuvert && (
                <div style={{ border: "1px solid #ccc", padding: "20px", marginBottom: "20px", borderRadius: "5px", backgroundColor: "#f9f9f9" }}>
                    <h3>Ajouter un cours</h3>
                    <p><strong>Date sélectionnée :</strong> {dateSelectionnee}</p>

                    <div style={{ marginBottom: "10px" }}>
                        <label style={{ display: "block" }}>Classe :</label>
                        <select value={classeChoisie} onChange={e => setClasseChoisie(e.target.value)}>
                            <option value="">-- Choisir une classe --</option>
                            {listeClasses.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.nomClasse || cls.nom}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <label style={{ display: "block" }}>Module (EC) :</label>
                        <select value={moduleChoisi} onChange={e => setModuleChoisi(e.target.value)}>
                            <option value="">-- Choisir un module --</option>
                            {listeModules.map(mod => (
                                <option key={mod.id} value={mod.id}>{mod.nomMatiere || mod.nom}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <label style={{ display: "block" }}>Enseignant :</label>
                        <select value={enseignantChoisi} onChange={e => setEnseignantChoisi(e.target.value)}>
                            <option value="">-- Choisir un enseignant --</option>
                            {listeEnseignants.map(ens => (
                                // Si ton backend attend l'ID de l'enseignant, passe ens.id dans value
                                <option key={ens.id} value={ens.nom}>{ens.nom} {ens.prenom}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <label style={{ display: "block" }}>Heure début :</label>
                        <input type="time" value={heureDebut} onChange={e => setHeureDebut(e.target.value)} />
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <label style={{ display: "block" }}>Heure Fin :</label>
                        <input type="time" value={heureFin} onChange={e => setHeureFin(e.target.value)} />
                    </div>

                    <div style={{ marginTop: "15px" }}>
                        <button onClick={enregistrer} style={{ marginRight: "10px" }}>Enregistrer</button>
                        <button onClick={() => setModalOuvert(false)}>Annuler</button>
                    </div>
                </div>
            )}

            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                slotMinTime="07:00:00"
                slotMaxTime="20:00:00"
                locale={frLocale}
                initialView="timeGridWeek"
                editable={true}
                selectable={true}
                events={events}
                dateClick={handleDateClick}
            />
        </div>
    );
}