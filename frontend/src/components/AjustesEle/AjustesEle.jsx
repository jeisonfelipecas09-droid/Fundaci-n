import { useEffect, useMemo, useState } from 'react';
import './AjustesEle.css';

const initialElementos = [
  { id: 1, nombre: 'Cámara IP', categoria: 'Seguridad', codigo: 'ELE-101', estado: 'Activo', icono: '📷' },
  { id: 2, nombre: 'Laptop Dell', categoria: 'Tecnología', codigo: 'ELE-204', estado: 'Activo', icono: '💻' },
  { id: 3, nombre: 'Silla Ejecutiva', categoria: 'Mobiliario', codigo: 'ELE-305', estado: 'Inactivo', icono: '🪑' },
  { id: 4, nombre: 'Proyector', categoria: 'Audiovisual', codigo: 'ELE-412', estado: 'Activo', icono: '📽️' },
  { id: 5, nombre: 'Impresora Láser', categoria: 'Oficina', codigo: 'ELE-520', estado: 'Activo', icono: '🖨️' },
  { id: 6, nombre: 'Router Wi‑Fi', categoria: 'Redes', codigo: 'ELE-608', estado: 'Inactivo', icono: '📡' },
];

function AjustesEle() {
  const [elementos, setElementos] = useState(initialElementos);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEdicion, setMostrarEdicion] = useState(false);
  const [elementoEditando, setElementoEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'Tecnología',
    codigo: '',
    estado: 'Activo',
  });
  const [formEdicion, setFormEdicion] = useState({
    nombre: '',
    categoria: 'Tecnología',
    codigo: '',
    estado: 'Activo',
  });

  const elementosFiltrados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return elementos.filter((elemento) => {
      const coincideBusqueda =
        !term ||
        elemento.nombre.toLowerCase().includes(term) ||
        elemento.codigo.toLowerCase().includes(term);

      const coincideCategoria =
        filtroCategoria === 'Todos' ||
        elemento.categoria === filtroCategoria;

      const coincideEstado =
        filtroCategoria === 'Todos' ||
        (filtroCategoria === 'Activos' && elemento.estado === 'Activo') ||
        (filtroCategoria === 'Inactivos' && elemento.estado === 'Inactivo');

      return coincideBusqueda && (coincideCategoria || coincideEstado);
    });
  }, [elementos, searchTerm, filtroCategoria]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filtroCategoria]);

  const elementosPorPagina = 6;
  const totalPages = Math.max(1, Math.ceil(elementosFiltrados.length / elementosPorPagina));
  const paginaActual = Math.min(currentPage, totalPages);
  const indiceInicio = (paginaActual - 1) * elementosPorPagina;
  const elementosPagina = elementosFiltrados.slice(indiceInicio, indiceInicio + elementosPorPagina);

  const handleSubmit = (event) => {
    event.preventDefault();

    const nuevoElemento = {
      id: Date.now(),
      nombre: formData.nombre,
      categoria: formData.categoria,
      codigo: formData.codigo,
      estado: formData.estado,
      icono: '✨',
    };

    setElementos((prev) => [nuevoElemento, ...prev]);
    setFormData({ nombre: '', categoria: 'Tecnología', codigo: '', estado: 'Activo' });
    setMostrarModal(false);
  };

  const handleEditarClick = (elemento) => {
    setElementoEditando(elemento);
    setFormEdicion({
      nombre: elemento.nombre,
      categoria: elemento.categoria,
      codigo: elemento.codigo,
      estado: elemento.estado,
    });
    setMostrarEdicion(true);
  };

  const handleEditarSubmit = (event) => {
    event.preventDefault();

    if (!elementoEditando) return;

    setElementos((prev) =>
      prev.map((elemento) =>
        elemento.id === elementoEditando.id
          ? {
              ...elemento,
              nombre: formEdicion.nombre,
              categoria: formEdicion.categoria,
              codigo: formEdicion.codigo,
              estado: formEdicion.estado,
            }
          : elemento,
      ),
    );

    setMostrarEdicion(false);
    setElementoEditando(null);
    setFormEdicion({ nombre: '', categoria: 'Tecnología', codigo: '', estado: 'Activo' });
  };

  return (
    <div className="ajustes-ele-container">
      <div className="ajustes-header">
        <div className="titulo-filtro">
          <h1 className="TituloC">Elementos</h1>
        </div>

        <label className="filter-select-wrapper" htmlFor="filtro-elementos">
          <select
            id="filtro-elementos"
            value={filtroCategoria}
            onChange={(event) => setFiltroCategoria(event.target.value)}
            aria-label="Filtrar elementos"
          >
            <option value="Todos">Todos</option>
            <option value="Activos">Activo</option>
            <option value="Inactivos">Inactivo</option>
          </select>
        </label>

        <button type="button" className="btn-agregar" onClick={() => setMostrarModal(true)}>
          + Agregar elemento
        </button>
      </div>

      <div className="search-bar-container">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por nombre o código"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="elementos-grid">
        {elementosPagina.length > 0 ? (
          elementosPagina.map((elemento) => (
            <article className="elemento-card" key={elemento.id}>
              <div className="elemento-info">
                <div className="elemento-topline">
                  <span className={`estado-chip ${elemento.estado === 'Activo' ? 'activo' : 'inactivo'}`} aria-label={elemento.estado} title={elemento.estado}>
                    <span className="estado-punto" />
                  </span>
                </div>

                <h3>{elemento.nombre}</h3>
                <p>{elemento.categoria}</p>

                <div className="elemento-meta">
                  <span>Código</span>
                  <strong>{elemento.codigo}</strong>
                </div>
              </div>

              <div className="elemento-actions">
                <button type="button" className="btn-accion btn-editar" onClick={() => handleEditarClick(elemento)}>
                  Editar
                </button>
                <button type="button" className="btn-accion btn-desactivar">
                  Eliminar
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="sin-resultados">No se encontraron elementos con ese criterio.</div>
        )}
      </div>

      {elementosFiltrados.length > elementosPorPagina && (
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
              <h2>Agregar elemento</h2>
              <button type="button" className="modal-close" onClick={() => setMostrarModal(false)}>
                ×
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <label>
                Nombre
                <input
                  type="text"
                  value={formData.nombre}
                  placeholder="Ej: Tablet Samsung"
                  onChange={(event) => setFormData({ ...formData, nombre: event.target.value })}
                  required
                />
              </label>

              <label>
                Categoría
                <select
                  value={formData.categoria}
                  onChange={(event) => setFormData({ ...formData, categoria: event.target.value })}
                >
                  <option value="Tecnología">Tecnología</option>
                  <option value="Seguridad">Seguridad</option>
                  <option value="Mobiliario">Mobiliario</option>
                  <option value="Audiovisual">Audiovisual</option>
                  <option value="Oficina">Oficina</option>
                  <option value="Redes">Redes</option>
                </select>
              </label>

              <label>
                Código
                <input
                  type="text"
                  value={formData.codigo}
                  placeholder="Ej: ELE-999"
                  onChange={(event) => setFormData({ ...formData, codigo: event.target.value })}
                  required
                />
              </label>

              <label>
                Estado
                <select
                  value={formData.estado}
                  onChange={(event) => setFormData({ ...formData, estado: event.target.value })}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
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

      {mostrarEdicion && elementoEditando && (
        <div className="modal-overlay" onClick={() => setMostrarEdicion(false)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar elemento</h2>
              <button type="button" className="modal-close" onClick={() => setMostrarEdicion(false)}>
                ×
              </button>
            </div>

            <form className="modal-form" onSubmit={handleEditarSubmit}>
              <label>
                Nombre
                <input
                  type="text"
                  value={formEdicion.nombre}
                  onChange={(event) => setFormEdicion({ ...formEdicion, nombre: event.target.value })}
                  required
                />
              </label>

              <label>
                Categoría
                <select
                  value={formEdicion.categoria}
                  onChange={(event) => setFormEdicion({ ...formEdicion, categoria: event.target.value })}
                >
                  <option value="Tecnología">Tecnología</option>
                  <option value="Seguridad">Seguridad</option>
                  <option value="Mobiliario">Mobiliario</option>
                  <option value="Audiovisual">Audiovisual</option>
                  <option value="Oficina">Oficina</option>
                  <option value="Redes">Redes</option>
                </select>
              </label>

              <label>
                Código
                <input
                  type="text"
                  value={formEdicion.codigo}
                  onChange={(event) => setFormEdicion({ ...formEdicion, codigo: event.target.value })}
                  required
                />
              </label>

              <label>
                Estado
                <select
                  value={formEdicion.estado}
                  onChange={(event) => setFormEdicion({ ...formEdicion, estado: event.target.value })}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={() => setMostrarEdicion(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AjustesEle;