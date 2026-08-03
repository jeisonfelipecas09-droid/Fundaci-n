import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AjustesEle from '../../components/AjustesEle/AjustesEle.jsx';
import Cajustes from '../../components/C-ajustes/Cajustes.jsx';
import Header from '../../components/Header/Header.jsx';
import './Ajustes.css';

function Ajustes() {
  const location = useLocation();
  const [view, setView] = useState(location.state?.view === 'elementos' ? 'elementos' : 'usuarios');

  useEffect(() => {
    if (location.state?.view === 'elementos') {
      setView('elementos');
    } else {
      setView('usuarios');
    }
  }, [location.state]);

  return (
    <div className="App">
      <Header onSelectView={setView} />
      {view === 'elementos' ? <AjustesEle /> : <Cajustes />}
    </div>
  );
}

export default Ajustes;