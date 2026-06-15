import './App.css';
import {BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Login';
import Dashboard from './Dashboard';
import Emploi from './EmploiTemps';
import Planning from './Emploi1'
import Planningg from './Emploi2'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/emploi" element={<Emploi />} />
        <Route path="/Emploi1" element={< Planning />}/>
        <Route path="/Emploi2" element={< Planningg />}/>
      </Routes>
    </BrowserRouter>
  )
}



                 
export default App

