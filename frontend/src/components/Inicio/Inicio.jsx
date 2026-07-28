import { useState } from 'react';
import './Inicio.css';

function Inicio() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim() || !validateEmail(email)) {
      setError('Ingresa un correo válido. Debe incluir @ y un dominio.');
      setSuccess('');
      return;
    }

    if (!password.trim()) {
      setError('La contraseña es obligatoria.');
      setSuccess('');
      return;
    }

    setError('');
    setSuccess('¡Inicio de sesión listo!');
  };

  return (
    <div className="Center">
      
      <div className="cards">
        <div className="CardI">
          
          <img
            className="login-side-image"
            src="/Imagenes/LoginI/fsfb1.png"
            alt="Logo Fundación Santa Fe"
          />
            <h1 className='TituloIn'>Bienvenido</h1>
            <p className="subtitle">Ingresa tus datos para continuar</p>

            <form className="login-form" onSubmit={handleSubmit}>
              <label className="field">
                <span className='espn'>Correo</span>
                <input
                  className="input"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span className='espn'>Contraseña</span>
                <div className="password-wrapper">
                  <input
                    className="input password-input"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? '👁' : '-'}
                  </button>
                </div>
              </label>

              {error && <p className="error-text">{error}</p>}
              {success && <p className="success-text">{success}</p>}

              <button type="submit" className="submit-btn">Ingresar</button>
            </form>
        </div>
       
      </div>
       <div className="Izquierda">
            <img
              className="login-logo"
              src="/Imagenes/LoginP/PantallaInicioLogoFSFB_old-1170x658.png"
              alt="Logo Fundación Santa Fe"
            />
      </div>
    </div>
  );
}

export default Inicio;