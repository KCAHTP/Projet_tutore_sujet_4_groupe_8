import { useState, useEffect } from 'react';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import frLocale from '@fullcalendar/core/locales/fr'





export default function Planning(){

   const [events, setEvents] = useState([]);
    const [modalOuvert, setModalOuvert] = useState(false)
    const [dateSelectionnee, setDateSelectionnee] = useState ('')
    const [moduleChoisi, setModuleChoisi] = useState('')
    const [enseignantChoisi, setEnseignantChoisi] = useState('')
    const [heureDebut, setHeureDebut] = useState('08:00')
    const [heureFin, setHeureFin] = useState('10:00')
   const chargerPlanning = async () => {
        try{
          const res = await axios.get( "http://localhost:8080/api/planning");
          const formattedEvents = res.data.map(cours => ({
            id: cours.id,
            title: `${cours.matiere} - ${cours.enseignant}`,
            start: `${cours.date}T${cours.heureDebut}`,
            end: `${cours.date}T${cours.heureFin}`
                                                        })
                                    );
         setEvents(formattedEvents);
        }
        catch (err) {
            console.error(err);
        }
    };


      useEffect(() =>{
        chargerPlanning();
                    },  []
      );



            const handleDateClick = async (info) => {

                setDateSelectionnee(info.dateStr);
                setModuleChoisi("");
                setEnseignantChoisi("");
                setModalOuvert(true);

               const matiere = prompt ("Nom du module");
               const enseignant = prompt ("Nom de l'enseignant")
               
               if (!matiere) return;
                 try{
                    await axios.post("http://localhost:8080/api/planning",
                      {
                      matiere: moduleChoisi,
                      date: dateSelectionnee,
                      heureDebut: heureDebut,
                      heureFin: heureFin
                  } );
                   setModalOuvert(false)
                   chargerPlanning();
                }  catch (err) {
                    console.error(err);
                
                   }

            };
                      const enregistrer = async () => {
                             try{
                                await axios.post("http://localhost:8080/api/planning",
                                    {
                                        matiere: moduleChoisi,
                                        enseignant: enseignantChoisi,
                                        date: dateSelectionnee,
                                        heureDebut,
                                        heureFin
                                    }
                                );
                                setModalOuvert(false);
                                  chargerPlanning();

                             } catch (err) {
                                  console.error(err);
                
                                }

                             };


                      




                 return (
                        <div style={{ padding: "20px" }}>
                         <h2> Emploi De Temps </h2>

                         
                          {modalOuvert &&(
                            <div style={{ border: "1px solid black", padding:"20px", marginBottom:"20px"}}>
                               <h3>Ajouter un cours</h3>                              
                                 <p>Date : {dateSelectionnee}</p>

                                   <div>
                                      <label>Module:</label>
                                      <input type="text" value={moduleChoisi} onChange={e => setModuleChoisi(e.target.value)}/>
                                      
                                      </div>

                            
                           



                               <div>
                                  <label>Enseignant :</label>
                                  <input type="text" value={enseignantChoisi} onChange={(e) => setEnseignantChoisi(e.target.value)}/>                             
                                
                                
                                </div>


                                  <div>
                                     <label>Heure début :</label>    
                                    <input type="time"  value={heureDebut}  onChange={e => setHeureDebut(e.target.value)}/>
                                 </div>
                               



                                <div>
                                    <label>Heure Fin :</label>
                                       <input type="time" value={heureFin} onChange={(e) =>setHeureFin(e.target.value)}/>

                                </div>


                                <div>
                                    <button onClick={enregistrer}>Enregistrer</button>
                                    <button onClick={() => setModalOuvert(false)}>Annuler</button>
                                </div>
                          </div>
                            
                          )}





                         <FullCalendar
                         plugins={[
                          dayGridPlugin,
                          timeGridPlugin,
                          interactionPlugin
                         
                         ]}
                          slotMinTime="07:00:00"
                          slotMaxTime="20:00:00"
                          locale= {frLocale}
                         initialView="timeGridWeek"
                         editable={true}
                         selectable={true}
                         events={events}
                         dateClick={handleDateClick}
                         />

                         </div>
                        );
                        
                    }
