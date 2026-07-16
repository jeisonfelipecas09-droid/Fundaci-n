import { useState } from 'react';
import Cajustes from '../../components/C-ajustes/Cajustes.jsx';
import Header from '../../components/Header/Header.jsx';
import './Ajustes.css';

function Ajustes() {
  const [view, setView] = useState('mes');

  return (
    <div className="App">
      <Header onSelectView={setView} />
      <Cajustes onSelectView={setView} />
      
    </div>
  );
}

export default Ajustes;