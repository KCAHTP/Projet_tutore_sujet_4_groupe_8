import {useState } from 'react'
import{ useNavigate} from 'react-router-dom'
export default function Login() {


const [username,setusername] = useState('')
const [password, setpassword] = useState('')
const navigate = useNavigate()

   // adresse du Login'BACK'
   async function Connexion() {
      const reponse = await fetch('http://localhost:8000/login' , {
       method: 'POST' ,

       headers: {
         'Content-Type': 'application/json'
                },

       body: JSON.stringify({
         username: username,
         password: password
                           })

                                                           })
                                 
      


     const retour = await reponse.json()
      if(retour.success){navigate('/Dashboard')}
      else{ } 

                                                         }

return (
<div>
     <div>       
       <input type="text" id="username"  placeholder="Username" value={username} onChange={e => setusername(e.target.value) }/>
    </div>
     <div>      
       <input type="text" id="password" value={password} onChange={e => setpassword(e.target.value)} placeholder="Password"/> 
     </div>
     <div>
       <button type="submit" onClick={Connexion}>Connexion</button>
     </div>
                               
                                 
</div >
        );
                    

                                }