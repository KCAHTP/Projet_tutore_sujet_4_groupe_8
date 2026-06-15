import { useState, useEffect } from 'react';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import frLocale from '@fullcalendar/core/locales/fr';

export default function Planning({ classeId }) { // classeId transmis depuis le Dashboard
  const [events, setEvents] = useState([]);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [dateSelectionnee, setDateSelectionnee] = useState('');
  const [moduleChoisi, setModuleChoisi] = useState('');
  const [enseignantChoisi, setEnseignantChoisi] = useState('');
  const [heureDebut, setHeureDebut] = useState('08:00');
  const [heureFin, setHeureFin] = useState('10:00');
  const [modules, setModules] = useState([]);
  const [enseignants, setEnseignants] = useState([]);

  // Charger les cours existants
  const chargerPlanning = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/planning");
      const formattedEvents = res.data.map(cours => ({
        id: cours.id,
        title: `${cours.matiere} - ${cours.enseignant}`,
        start: `${cours.date}T${cours.debut}`,
        end: `${cours.date}T${cours.fin}`
      }));
      setEvents(formattedEvents);
    } catch (err) {
      console.error(err);
    }
  };

  // Charger modules et enseignants
  useEffect(() => {
    chargerPlanning();

    axios.get(`http://localhost:8080/api/modules?classeId=${classeId}`)
         .then(res => setModules(res.data))
         .catch(err => console.error(err));

    axios.get("http://localhost:8080/api/enseignants")
         .then(res => setEnseignants(res.data))
         .catch(err => console.error(err));
  }, [classeId]);

  // Clic sur une date → ouvre la modale
  const handleDateClick = (info) => {
    setDateSelectionnee(info.dateStr);
    setModuleChoisi("");
    setEnseignantChoisi("");
    setModalOuvert(true);
  };

  // Enregistrer un cours
  const enregistrer = async () => {
    if (!moduleChoisi || !enseignantChoisi) {
      alert("Merci de remplir tous les champs !");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/planning", {
        ec_id: moduleChoisi,
        classe_id: classeId,
        enseignant_id: enseignantChoisi,
        date: dateSelectionnee,
        debut: heureDebut,
        fin: heureFin
      });
      setModalOuvert(false);
      chargerPlanning();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Emploi De Temps</h2>

      {modalOuvert && (
        <div style={{ border: "1px solid black", padding:"20px", marginBottom:"20px"}}>
          <h3>Ajouter un cours</h3>
          <p>Date : {dateSelectionnee}</p>

          <div>
            <label>Module :</label>
            <select value={moduleChoisi} onChange={(e) => setModuleChoisi(e.target.value)}>
              <option value="">-- Choisir un module --</option>
              {modules.map(m => (
                <option key={m.id} value={m.id}>{m.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Enseignant :</label>
            <select value={enseignantChoisi} onChange={(e) => setEnseignantChoisi(e.target.value)}>
              <option value="">-- Choisir un enseignant --</option>
              {enseignants.map(e => (
                <option key={e.id} value={e.id}>{e.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Heure début :</label>
            <input 
              type="time"  
              value={heureDebut}  
              onChange={(e) => setHeureDebut(e.target.value)} 
            />
          </div>

          <div>
            <label>Heure fin :</label>
            <input 
              type="time" 
              value={heureFin} 
              onChange={(e) => setHeureFin(e.target.value)} 
            />
          </div>

          <div>
            <button onClick={enregistrer}>Enregistrer</button>
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
