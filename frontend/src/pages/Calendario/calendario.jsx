import { useState } from 'react';
import Cuerpo from '../../components/Cuerpo/Cuerpo.jsx';
import Header from '../../components/Header/Header.jsx';
import './calendario.css';

function Calendario() {
  const [view, setView] = useState('mes');

  return (
    <div className="App">
      <Header onSelectView={setView} />
      <Cuerpo view={view} setView={setView} />
    </div>
  );
}

export default Calendario;