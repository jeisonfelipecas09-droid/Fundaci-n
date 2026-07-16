import { useEffect, useState } from 'react';
import './Cajustes.css';

function Cajustes() {
  const initialUsuarios = [
    { id: 1, nombre: 'Juan Pérez', correo: 'juan@empresa.com', estado: 'Activo', documento: '1023456789' },
    { id: 2, nombre: 'María Gómez', correo: 'maria@empresa.com', estado: 'Inactivo', documento: '1098765432' },
    { id: 3, nombre: 'Carlos Ruiz', correo: 'carlos@empresa.com', estado: 'Activo', documento: '1122334455' },
    { id: 4, nombre: 'Ana Torres', correo: 'ana@empresa.com', estado: 'Activo', documento: '1002233445' },
    { id: 5, nombre: 'Luis Morales', correo: 'luis@empresa.com', estado: 'Inactivo', documento: '1034567890' },
    { id: 6, nombre: 'Sofía Díaz', correo: 'sofia@empresa.com', estado: 'Activo', documento: '1045678901' },
  ];

  const [usuarios, setUsuarios] = useState(initialUsuarios);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    documento: '',
    rol: 'Usuario',
  });
  const usuariosPorPagina = 5;

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    return (
      usuario.nombre.toLowerCase().includes(term) ||
      usuario.documento.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(usuariosFiltrados.length / usuariosPorPagina));
  const paginaActual = Math.min(currentPage, totalPages);
  const indiceInicio = (paginaActual - 1) * usuariosPorPagina;
  const usuariosPagina = usuariosFiltrados.slice(indiceInicio, indiceInicio + usuariosPorPagina);

  const handleSubmit = (event) => {
    event.preventDefault();

    const nuevoUsuario = {
      id: Date.now(),
      nombre: `${formData.nombre} ${formData.apellido}`.trim(),
      correo: formData.correo,
      estado: 'Activo',
      documento: formData.documento,
    };

    setUsuarios((prev) => [nuevoUsuario, ...prev]);
    setFormData({ nombre: '', apellido: '', correo: '', documento: '', rol: 'Usuario' });
    setMostrarModal(false);
  };

  return (
    <div className="ajustes-container">
      <div className="ajustes-header">
        <h1 className="TituloC">Usuarios</h1>
        <button type="button" className="btn-agregar" onClick={() => setMostrarModal(true)}>
          + Agregar usuario
        </button>
      </div>

      <div className="search-bar-container">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por nombre o documento"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="lista-usuarios">
        {usuariosPagina.length > 0 ? (
          usuariosPagina.map((usuario) => (
            <div className="usuario-item" key={usuario.id}>
              <div className="usuario-info1">
                <strong>{usuario.nombre}</strong>
                <span>{usuario.correo}</span>
                <small>{usuario.estado}</small>
              </div>
              <div className="lista-usuariosa">
                <span className="documento-numero">{usuario.documento}</span>
              </div>
              <div className="usuario-actions">
                <button type="button" className="btn-accion btn-editar">
                  Editar
                </button>
                <button type="button" className="btn-accion btn-desactivar">
                  Desactivar
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="sin-resultados">No se encontraron usuarios con ese criterio.</div>
        )}
      </div>

      {usuariosFiltrados.length > usuariosPorPagina && (
        <div className="paginacion">
          <button
            type="button"
            className="btn-paginacion"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={paginaActual === 1}
          >
            Anterior
          </button>

          <span className="pagina-info">Página {paginaActual} de {totalPages}</span>

          <button
            type="button"
            className="btn-paginacion"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={paginaActual === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}

      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Agregar usuario</h2>
              <button type="button" className="modal-close" onClick={() => setMostrarModal(false)}>
                ×
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <label>
                Nombres
                <input
                  type="text"
                  value={formData.nombre}
                  placeholder="Ej: María"
                  onChange={(event) => setFormData({ ...formData, nombre: event.target.value })}
                  required
                />
              </label>

              <label>
                Apellidos
                <input
                  type="text"
                  value={formData.apellido}
                  placeholder="Ej: López"
                  onChange={(event) => setFormData({ ...formData, apellido: event.target.value })}
                  required
                />
              </label>

              <label>
                Correo
                <input
                  type="email"
                  value={formData.correo}
                  placeholder="Ej: maria@empresa.com"
                  onChange={(event) => setFormData({ ...formData, correo: event.target.value })}
                  required
                />
              </label>

              <label>
                Número de documento
                <input
                  type="text"
                  value={formData.documento}
                  placeholder="Ej: 1023456789"
                  onChange={(event) => setFormData({ ...formData, documento: event.target.value })}
                  required
                />
              </label>

              <label>
                Rol
                <input
                  type="text"
                  value={formData.rol}
                  placeholder="Ej: Administrador"
                  onChange={(event) => setFormData({ ...formData, rol: event.target.value })}
                  required
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cajustes;