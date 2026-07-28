import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Calendario from './pages/Calendario/calendario.jsx'
import Ajustes from './pages/Ajustes/Ajustes.jsx'
import Login from './pages/Login/Login.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/Disponibilidad" element={<Calendario />} />
        <Route path="/Ajustes" element={<Ajustes />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
