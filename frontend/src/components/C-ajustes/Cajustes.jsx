import { useEffect, useMemo, useState } from 'react';
import './Cajustes.css';

const STORAGE_KEY = 'asignacionesDisponibilidad';

const activosDisponibles = [
  { id: 1, nombre: 'Cámara IP', estado: 'Activo' },
  { id: 2, nombre: 'Laptop Dell', estado: 'Activo' },
  { id: 3, nombre: 'Proyector', estado: 'Activo' },
  { id: 4, nombre: 'Impresora Láser', estado: 'Activo' },
  { id: 5, nombre: 'Router Wi‑Fi', estado: 'Activo' },
];

const getAsignacionesGuardadas = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

function Cajustes() {
  const initialUsuarios = [
    { id: 1, nombre: 'Juan Pérez', correo: 'juan@empresa.com', estado: 'Activo', documento: '1023456789', tipoDocumento: 'Cédula de ciudadanía' },
    { id: 2, nombre: 'María Gómez', correo: 'maria@empresa.com', estado: 'Inactivo', documento: '1098765432', tipoDocumento: 'Cédula de ciudadanía' },
    { id: 3, nombre: 'Carlos Ruiz', correo: 'carlos@empresa.com', estado: 'Activo', documento: '1122334455', tipoDocumento: 'Tarjeta de identidad' },
    { id: 4, nombre: 'Ana Torres', correo: 'ana@empresa.com', estado: 'Activo', documento: '1002233445', tipoDocumento: 'Cédula de ciudadanía' },
    { id: 5, nombre: 'Luis Morales', correo: 'luis@empresa.com', estado: 'Inactivo', documento: '1034567890', tipoDocumento: 'Cédula de ciudadanía' },
    { id: 6, nombre: 'Sofía Díaz', correo: 'sofia@empresa.com', estado: 'Activo', documento: '1045678901', tipoDocumento: 'Tarjeta de identidad' },
  ];

  const [usuarios, setUsuarios] = useState(initialUsuarios);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEdicion, setMostrarEdicion] = useState(false);
  const [mostrarAsignacion, setMostrarAsignacion] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    documento: '',
    rol: 'Usuario',
  });
  const [formEdicion, setFormEdicion] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    estado: 'Activo',
  });
  const [formAsignacion, setFormAsignacion] = useState({
    elementoId: activosDisponibles[0]?.id || '',
  });
  const [mesAsignacion, setMesAsignacion] = useState(new Date());
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState([]);
  const usuariosPorPagina = 4;

  const usuariosFiltrados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return usuarios.filter((usuario) => {
      const coincideBusqueda =
        !term ||
        usuario.nombre.toLowerCase().includes(term) ||
        usuario.documento.toLowerCase().includes(term);

      const coincideEstado =
        filtroEstado === 'Todos' ||
        (filtroEstado === 'Activos' && usuario.estado === 'Activo') ||
        (filtroEstado === 'Inactivos' && usuario.estado === 'Inactivo');

      return coincideBusqueda && coincideEstado;
    });
  }, [usuarios, searchTerm, filtroEstado]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filtroEstado]);

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

  const separarNombreCompleto = (nombreCompleto = '') => {
    const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);

    if (partes.length === 0) {
      return { nombre: '', apellido: '' };
    }

    if (partes.length === 1) {
      return { nombre: partes[0], apellido: '' };
    }

    return {
      nombre: partes.slice(0, -1).join(' '),
      apellido: partes[partes.length - 1],
    };
  };

  const handleEditarClick = (usuario) => {
    const { nombre, apellido } = separarNombreCompleto(usuario.nombre);

    setUsuarioEditando(usuario);
    setFormEdicion({
      nombre,
      apellido,
      correo: usuario.correo,
      estado: usuario.estado || 'Activo',
    });
    setMostrarEdicion(true);
  };

  const handleEditarSubmit = (event) => {
    event.preventDefault();

    if (!usuarioEditando) return;

    setUsuarios((prev) =>
      prev.map((usuario) =>
        usuario.id === usuarioEditando.id
          ? {
              ...usuario,
              nombre: `${formEdicion.nombre} ${formEdicion.apellido}`.trim(),
              correo: formEdicion.correo,
              estado: formEdicion.estado,
            }
          : usuario,
      ),
    );

    setMostrarEdicion(false);
    setUsuarioEditando(null);
    setFormEdicion({ nombre: '', apellido: '', correo: '', estado: 'Activo' });
  };

  const formatearFechaClave = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const obtenerDiasCalendario = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const dayOfWeek = (firstDay.getDay() + 1) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const cells = [];

    for (let i = dayOfWeek - 1; i >= 0; i -= 1) {
      cells.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        currentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ date: new Date(year, month, day), currentMonth: true });
    }

    while (cells.length % 7 !== 0) {
      const nextDay = cells.length - daysInMonth - dayOfWeek + 1;
      cells.push({ date: new Date(year, month + 1, nextDay), currentMonth: false });
    }

    return cells;
  };

  const obtenerDatosFechaElemento = (fecha) => {
    const elementoId = Number(formAsignacion.elementoId);

    if (!elementoId || !usuarioSeleccionado) {
      return { ocupadaPorOtro: false, ocupadaPorMi: false, usuarioAsignado: null };
    }

    const asignaciones = getAsignacionesGuardadas().filter(
      (asignacion) =>
        Number(asignacion.elementoId) === elementoId &&
        asignacion.fecha === fecha,
    );

    const asignacionOtraPersona = asignaciones.find(
      (asignacion) => Number(asignacion.usuarioId) !== Number(usuarioSeleccionado.id),
    );

    const asignacionPropia = asignaciones.find(
      (asignacion) => Number(asignacion.usuarioId) === Number(usuarioSeleccionado.id),
    );

    return {
      ocupadaPorOtro: Boolean(asignacionOtraPersona),
      ocupadaPorMi: Boolean(asignacionPropia),
      usuarioAsignado: asignacionOtraPersona ? asignacionOtraPersona.usuarioNombre : null,
    };
  };

  const toggleFechaAsignacion = (fecha) => {
    setFechasSeleccionadas((prev) => {
      if (prev.includes(fecha)) {
        return prev.filter((item) => item !== fecha);
      }

      return [...prev, fecha].sort();
    });
  };

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragMode, setDragMode] = useState(null);

  const seleccionarRango = (fechaInicial, fechaFinal, mode) => {
    const fechaInicio = new Date(`${fechaInicial}T00:00:00`);
    const fechaFin = new Date(`${fechaFinal}T00:00:00`);

    const [inicio, fin] = fechaInicio <= fechaFin ? [fechaInicio, fechaFin] : [fechaFin, fechaInicio];
    const rango = [];

    for (let date = new Date(inicio); date <= fin; date.setDate(date.getDate() + 1)) {
      rango.push(formatearFechaClave(date));
    }

    const rangoNoOcupado = rango.filter((dia) => !obtenerDatosFechaElemento(dia).ocupadaPorOtro);

    setFechasSeleccionadas((prev) => {
      const conjunto = new Set(prev);

      if (mode === 'deselect') {
        rangoNoOcupado.forEach((dia) => conjunto.delete(dia));
      } else {
        rangoNoOcupado.forEach((dia) => conjunto.add(dia));
      }

      return [...conjunto].sort();
    });
  };

  useEffect(() => {
    const handlePointerUp = () => {
      setIsMouseDown(false);
      setDragStart(null);
      setDragMode(null);
    };

    window.addEventListener('pointerup', handlePointerUp);
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, []);

  const handleCalendarMouseDown = (fecha) => {
    const estado = obtenerDatosFechaElemento(fecha);
    if (estado.ocupadaPorOtro && !estado.ocupadaPorMi) {
      return;
    }

    const isSelected = fechasSeleccionadas.includes(fecha);
    setIsMouseDown(true);
    setDragStart(fecha);
    setDragMode(isSelected ? 'deselect' : 'select');

    if (isSelected) {
      setFechasSeleccionadas((prev) => prev.filter((item) => item !== fecha));
      return;
    }

    setFechasSeleccionadas((prev) => [...new Set([...prev, fecha])].sort());
  };

  const handleCalendarMouseEnter = (fecha) => {
    if (!isMouseDown || !dragStart || !dragMode) return;

    const estado = obtenerDatosFechaElemento(fecha);
    if (estado.ocupadaPorOtro && !estado.ocupadaPorMi) {
      return;
    }

    seleccionarRango(dragStart, fecha, dragMode);
  };

  const handleCalendarMouseUp = () => {
    setIsMouseDown(false);
    setDragStart(null);
    setDragMode(null);
  };

  const handleAsignacion = (event) => {
    event.preventDefault();

    if (!usuarioSeleccionado || fechasSeleccionadas.length === 0) return;

    const elemento = activosDisponibles.find((item) => item.id === Number(formAsignacion.elementoId));
    if (!elemento) return;

    const guardadas = getAsignacionesGuardadas();
    const asignaciones = fechasSeleccionadas.map((fecha) => ({
      id: `${Date.now()}-${fecha}`,
      usuarioId: usuarioSeleccionado.id,
      usuarioNombre: usuarioSeleccionado.nombre,
      elementoId: elemento.id,
      elementoNombre: elemento.nombre,
      fecha,
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify([...guardadas, ...asignaciones]));
    window.dispatchEvent(new CustomEvent('assignmentsUpdated'));

    setMostrarAsignacion(false);
    setUsuarioSeleccionado(null);
    setFechasSeleccionadas([]);
    setMesAsignacion(new Date());
    setFormAsignacion({
      elementoId: activosDisponibles[0]?.id || '',
    });
  };

  return (
    <div className="ajustes-container">
      <div className="ajustes-header">
        <div className="titulo-filtro">
          <h1 className="TituloC">Usuarios</h1>
        </div>

        <label className="filter-select-wrapper" htmlFor="filtro-estado-usuarios">
          <select
            id="filtro-estado-usuarios"
            value={filtroEstado}
            onChange={(event) => setFiltroEstado(event.target.value)}
            aria-label="Filtrar usuarios por estado"
          >
            <option value="Todos">Todos</option>
            <option value="Activos">Activos</option>
            <option value="Inactivos">Inactivos</option>
          </select>
        </label>

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
              <span
                className={`estado-indicador ${usuario.estado === 'Activo' ? 'activo' : 'inactivo'}`}
                aria-label={usuario.estado}
                title={usuario.estado}
              />

              <div className="usuario-info1">
                <strong>{usuario.nombre}</strong>
                <span>{usuario.correo}</span>
              </div>

              <div className="usuario-documento">
                <span className="documento-numero">{usuario.documento}</span>
              </div>

              <div className="usuario-actions">
                <button type="button" className="btn-accion btn-editar" onClick={() => handleEditarClick(usuario)}>
                  Editar
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

      {mostrarEdicion && usuarioEditando && (
        <div className="modal-overlay" onClick={() => setMostrarEdicion(false)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar usuario</h2>
              <button type="button" className="modal-close" onClick={() => setMostrarEdicion(false)}>
                ×
              </button>
            </div>

            <form className="modal-form" onSubmit={handleEditarSubmit}>
              <label>
                Nombres
                <input
                  type="text"
                  value={formEdicion.nombre}
                  onChange={(event) => setFormEdicion({ ...formEdicion, nombre: event.target.value })}
                  required
                />
              </label>

              <label>
                Apellidos
                <input
                  type="text"
                  value={formEdicion.apellido}
                  onChange={(event) => setFormEdicion({ ...formEdicion, apellido: event.target.value })}
                  required
                />
              </label>

              <label>
                Correo
                <input
                  type="email"
                  value={formEdicion.correo}
                  onChange={(event) => setFormEdicion({ ...formEdicion, correo: event.target.value })}
                  required
                />
              </label>

              <label>
                Tipo de documento
                <input type="text" value={usuarioEditando.tipoDocumento || 'Cédula de ciudadanía'} readOnly />
              </label>

              <label>
                Número de documento
                <input type="text" value={usuarioEditando.documento} readOnly />
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

      {mostrarAsignacion && usuarioSeleccionado && (
        <div className="modal-overlay" onClick={() => setMostrarAsignacion(false)}>
          <div className="modal-content asignar-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Asignar elemento</h2>
              <button type="button" className="modal-close" onClick={() => setMostrarAsignacion(false)}>
                ×
              </button>
            </div>

            <form className="modal-form" onSubmit={handleAsignacion}>
              <label>
                Persona
                <input type="text" value={usuarioSeleccionado.nombre} readOnly />
              </label>

              <label>
                Elemento activo
                <select
                  value={formAsignacion.elementoId}
                  onChange={(event) => setFormAsignacion((prev) => ({ ...prev, elementoId: event.target.value }))}
                >
                  {activosDisponibles.map((elemento) => (
                    <option key={elemento.id} value={elemento.id}>
                      {elemento.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <div className="calendar-assignment-picker">
                <div className="calendar-picker-header">
                  <button
                    type="button"
                    className="calendar-nav-btn"
                    onClick={() => setMesAsignacion((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                  >
                    ←
                  </button>
                  <span>{mesAsignacion.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                  <button
                    type="button"
                    className="calendar-nav-btn"
                    onClick={() => setMesAsignacion((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                  >
                    →
                  </button>
                </div>

                <div className="date-picker-grid">
                  {['Sáb', 'Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie'].map((day) => (
                    <span key={day} className="date-picker-weekday">{day}</span>
                  ))}

                  {obtenerDiasCalendario(mesAsignacion).map((cell) => {
                    const fecha = formatearFechaClave(cell.date);
                    const isSelected = fechasSeleccionadas.includes(fecha);
                    const estadoFecha = cell.currentMonth ? obtenerDatosFechaElemento(fecha) : null;
                    const isOccupiedByOther = estadoFecha ? estadoFecha.ocupadaPorOtro : false;
                    const isOccupiedByMe = estadoFecha ? estadoFecha.ocupadaPorMi : false;

                    return (
                      <button
                        key={`${fecha}-${cell.currentMonth ? 'month' : 'other'}`}
                        type="button"
                        className={
                          isSelected
                            ? 'date-picker-day selected'
                            : isOccupiedByOther
                              ? 'date-picker-day occupied'
                              : isOccupiedByMe
                                ? 'date-picker-day mine'
                                : 'date-picker-day'
                        }
                        style={{ visibility: cell.currentMonth ? 'visible' : 'hidden' }}
                        onMouseDown={() => cell.currentMonth && handleCalendarMouseDown(fecha)}
                        onMouseEnter={() => cell.currentMonth && handleCalendarMouseEnter(fecha)}
                        onMouseUp={handleCalendarMouseUp}
                        title={
                          isOccupiedByOther
                            ? `Ocupado por ${estadoFecha.usuarioAsignado}`
                            : isOccupiedByMe
                              ? 'Ya tienes esta fecha asignada para este elemento'
                              : ''
                        }
                        disabled={!cell.currentMonth}
                      >
                        {cell.date.getDate()}
                      </button>
                    );
                  })}
                </div>

                <div className="selection-summary">
                  <span>Fechas seleccionadas</span>
                  {fechasSeleccionadas.length > 0 ? (
                    <div className="selection-chips">
                      {fechasSeleccionadas.map((fecha) => (
                        <button
                          key={fecha}
                          type="button"
                          className="date-chip"
                          onClick={() => toggleFechaAsignacion(fecha)}
                        >
                          {new Date(`${fecha}T00:00:00`).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="selection-empty">Selecciona uno o varios días del calendario.</p>
                  )}
                </div>

                <div className="date-legend">
                  <span><i className="legend-dot free" /> Disponible</span>
                  <span><i className="legend-dot mine" /> Tu asignación</span>
                  <span><i className="legend-dot occupied" /> Ocupado por otra persona</span>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={() => setMostrarAsignacion(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar" disabled={fechasSeleccionadas.length === 0}>
                  Guardar asignación
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