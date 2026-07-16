import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Calendario from './pages/Calendario/calendario.jsx'
import Ajustes from './pages/Ajustes/Ajustes.jsx'

function Home() {
  return <h1>Inicio</h1>
}

function Login() {
  return <h1>Login</h1>
}

function Register() {
  return <h1>Registro</h1>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Disponibilidad" element={<Calendario />} />
        <Route path="/Ajustes" element={<Ajustes />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
