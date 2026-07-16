import { useEffect, useState } from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header({ onSelectView }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSettingsToggle = () => {
    setShowSettingsMenu((prev) => !prev);
  };

  const handleCloseMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOpen(false);
  };

  return (
    <>
      <div className="todo">
        <Navbar expand="xxl" className="CONTAINER">
          <div>
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="Header">
                <div className="SubHeader1">
                  <button
                    type="button"
                    className="BotonesHeader"
                    onClick={() => navigate('/Disponibilidad')}
                  >
                    Horario
                  </button>
                  <div className="settings-dropdown">
                    <button
                      type="button"
                      className="BotonesHeader settings-toggle"
                      onClick={handleSettingsToggle}
                      aria-expanded={showSettingsMenu}
                    >
                      Ajustes
                    </button>
                    {showSettingsMenu && (
                      <div className="settings-menu">
                        <button
                          type="button"
                          className="settings-menu-item"
                          onClick={() => {
                            setShowSettingsMenu(false);
                            navigate('/Ajustes');
                          }}
                        >
                          Usuarios
                        </button>
                        <button
                          type="button"
                          className="settings-menu-item"
                          onClick={() => {
                            setShowSettingsMenu(false);
                            navigate('/Ajustes');
                          }}
                        >
                          Elementos
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="SubHeader2">
                  <h1 className="H1">DISPONIBILIDAD</h1>
                </div>
                <div className="SubHeader3">
                  <div className="user-dropdown">
                    <button
                      type="button"
                      id="user-menu-toggle"
                      className="user-toggle"
                      onClick={handleToggle}
                      aria-expanded={isOpen}
                      aria-controls="user-profile-modal"
                    >
                      <div className="user-toggle-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.31 0-6 1.79-6 4v1h12v-1c0-2.21-2.69-4-6-4Z" />
                        </svg>
                      </div>
                      <span className="user-toggle-label">Mi cuenta</span>
                    </button>

                    {isOpen && (
                      <div className="user-modal-overlay" onClick={handleCloseMenu}>
                        <div
                          id="user-profile-modal"
                          className="user-modal"
                          role="dialog"
                          aria-modal="true"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="user-menu-header">
                            <button
                              type="button"
                              className="user-menu-close"
                              aria-label="Cerrar menú"
                              onClick={handleCloseMenu}
                            >
                              ×
                            </button>
                          </div>
                          <div className="user-menu-card">
                            <div className="user-menu-header-left">
                              <div className="user-menu-image-box" aria-hidden="true">
                                <div className="user-menu-avatar" aria-hidden="true">
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.31 0-6 1.79-6 4v1h12v-1c0-2.21-2.69-4-6-4Z" />
                                  </svg>
                                </div>
                              </div>
                            </div>

                            <div className="user-menu-info">
                              <strong>Juan Pérez</strong>
                              <span>juan.perez@email.com</span>
                            </div>
                            <div className="user-menu-actions">
                              <button type="button" className="user-menu-action primary">Perfil</button>
                              <button type="button" className="user-menu-action secondary">Cerrar sesión</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Nav>
              
            </Navbar.Collapse>
          </div>
        </Navbar>
      </div>
    </>
  );
}

export default Header;