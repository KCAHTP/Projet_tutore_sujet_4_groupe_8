//import './Dashboard.css'
import { useState } from 'react'

export default function Dashboard () {


    const [classeChoisie, setClasseChoisie] = useState('')
    const [afficherOptionsLicence, setAfficherOptionsLicence] = useState(false)
     const [afficherOptionsMaster, setAfficherOptionsMaster] = useState(false)
    
    


   function choixLicence(classe){
    setClasseChoisie(classe)
    setAfficherOptionsLicence(true)
                        }
   
    function choixMaster(classe){
    setClasseChoisie(classe)
    setAfficherOptionsMaster(true)
                        }                     
   








                        


  
return(
<div>

      <div className="barre_class" >
            <div className="cadre"> Licence1  </div>
           <div  className="cadre"> Licence2   </div>
           <div  className="cadre" onClick={() =>choixLicence ('Licence 3')}> Licence3  </div>
           <div  className="cadre" onClick={ () =>choixMaster ('Master 1')}> Master1   </div>
            <div  className="cadre">Master2  </div>


                { afficherOptionsLicence && (
                      <div className="options-panneau">
                   <p>Choisir une option pour {classeChoisie}</p>
                   <div className="option">ISI</div>
                   <div className="option">IRS</div>
                      </div>
                                     )
                }

                { afficherOptionsMaster && (
                      <div className="options-panneau">
                   <p>Choisir une option pour {classeChoisie}</p>
                   <div className="option">SIDSAD</div>
                   <div className="option">Cybersecurite</div>
                      </div>
                                     )
                }





       </div>

</div>
      );
                                       }