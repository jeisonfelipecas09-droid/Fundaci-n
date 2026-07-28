import { useState } from 'react';
import Inicio from '../../components/Inicio/Inicio.jsx';
import './Login.css';

function Login() {
  const [view, setView] = useState('mes');

  return (
    <div className="App">
      <Inicio view={view} setView={setView} />
    </div>
  );
}

export default Login;