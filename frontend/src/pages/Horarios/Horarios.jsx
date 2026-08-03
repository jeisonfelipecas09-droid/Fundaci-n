import { useMemo, useState } from 'react';
import Header from '../../components/Header/Header.jsx';
import './Horarios.css';

const STORAGE_KEY = 'asignacionesDisponibilidad';

const usuarios = [
  { id: 1, nombre: 'Juan Pérez' },
  { id: 2, nombre: 'María Gómez' },
  { id: 3, nombre: 'Carlos Ruiz' },
  { id: 4, nombre: 'Ana Torres' },
  { id: 5, nombre: 'Luis Morales' },
  { id: 6, nombre: 'Sofía Díaz' },
];

const elementos = [
  { id: 1, nombre: 'Cámara IP' },
  { id: 2, nombre: 'Laptop Dell' },
  { id: 3, nombre: 'Proyector' },
  { id: 4, nombre: 'Impresora Láser' },
  { id: 5, nombre: 'Router Wi‑Fi' },
];

const getAsignacionesGuardadas = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
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
  const offset = (firstDay.getDay() + 1) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = offset - 1; i >= 0; i -= 1) {
    cells.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      currentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: new Date(year, month, day), currentMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const nextDay = cells.length - daysInMonth - offset + 1;
    cells.push({ date: new Date(year, month + 1, nextDay), currentMonth: false });
  }

  return cells;
};

function Horarios() {
  const [mesActual, setMesActual] = useState(new Date());
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(usuarios[0]?.id ?? 1);
  const [elementoSeleccionado, setElementoSeleccionado] = useState(elementos[0]?.id ?? 1);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [fechaInicioEliminar, setFechaInicioEliminar] = useState(formatearFechaClave(new Date()));
  const [fechaFinEliminar, setFechaFinEliminar] = useState(formatearFechaClave(new Date()));

  const usuarioActual = usuarios.find((usuario) => Number(usuario.id) === Number(usuarioSeleccionado));
  const elementoActual = elementos.find((elemento) => Number(elemento.id) === Number(elementoSeleccionado));

  const asignaciones = useMemo(() => {
    return getAsignacionesGuardadas().filter(
      (asignacion) => Number(asignacion.usuarioId) === Number(usuarioSeleccionado),
    );
  }, [usuarioSeleccionado]);

  const asignacionesElemento = useMemo(() => {
    return asignaciones.filter(
      (asignacion) => Number(asignacion.elementoId) === Number(elementoSeleccionado),
    );
  }, [asignaciones, elementoSeleccionado]);

  const fechasAsignadas = useMemo(() => {
    return new Set(asignacionesElemento.map((asignacion) => asignacion.fecha));
  }, [asignacionesElemento]);

  const cambiarMes = (incremento) => {
    setMesActual((prev) => new Date(prev.getFullYear(), prev.getMonth() + incremento, 1));
  };

  const eliminarAsignacionesEnRango = () => {
    const fechaInicial = new Date(`${fechaInicioEliminar}T00:00:00`);
    const fechaFinal = new Date(`${fechaFinEliminar}T00:00:00`);

    if (Number.isNaN(fechaInicial.getTime()) || Number.isNaN(fechaFinal.getTime())) {
      return;
    }

    const inicio = fechaInicial <= fechaFinal ? fechaInicial : fechaFinal;
    const fin = fechaInicial <= fechaFinal ? fechaFinal : fechaInicial;
    const rango = [];

    for (let dia = new Date(inicio); dia <= fin; dia.setDate(dia.getDate() + 1)) {
      rango.push(formatearFechaClave(dia));
    }

    const guardadas = getAsignacionesGuardadas();
    const restantes = guardadas.filter((asignacion) => {
      const coincideUsuario = Number(asignacion.usuarioId) === Number(usuarioSeleccionado);
      const coincideElemento = Number(asignacion.elementoId) === Number(elementoSeleccionado);
      const coincideFecha = rango.includes(asignacion.fecha);
      return !(coincideUsuario && coincideElemento && coincideFecha);
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(restantes));
    window.dispatchEvent(new CustomEvent('assignmentsUpdated'));
    setMostrarModalEliminar(false);
  };

  return (
    <div className="App">
      <Header />

      <div className="horarios-page">
        <main className="horarios-content">
          <div className="horarios-topbar">
            <div>
              <p className="horarios-eyebrow">Disponibilidad</p>
              <h3>{usuarioActual?.nombre || 'Persona'}</h3>
            </div>

            <div className="horarios-actions">
              <label className="horarios-element-selector">
                <span>Elemento</span>
                <select
                  value={elementoSeleccionado}
                  onChange={(event) => setElementoSeleccionado(event.target.value)}
                >
                  {elementos.map((elemento) => (
                    <option key={elemento.id} value={elemento.id}>
                      {elemento.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className="horarios-delete-button"
                onClick={() => setMostrarModalEliminar(true)}
              >
                Eliminar
              </button>
            </div>
          </div>

          <div className="horarios-calendar-panel">
            <div className="horarios-calendar-header">
              <button type="button" onClick={() => cambiarMes(-1)} aria-label="Mes anterior">←</button>
              <span>{mesActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
              <button type="button" onClick={() => cambiarMes(1)} aria-label="Mes siguiente">→</button>
            </div>

            <div className="horarios-calendar-grid">
              {['Sáb', 'Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie'].map((dia) => (
                <span key={dia} className="horarios-weekday">{dia}</span>
              ))}

              {obtenerDiasCalendario(mesActual).map((cell) => {
                const fecha = formatearFechaClave(cell.date);
                const estaAsignado = cell.currentMonth && fechasAsignadas.has(fecha);

                return (
                  <button
                    key={`${fecha}-${cell.currentMonth ? 'month' : 'other'}`}
                    type="button"
                    className={
                      estaAsignado
                        ? 'horario-day assigned'
                        : cell.currentMonth
                          ? 'horario-day'
                          : 'horario-day muted'
                    }
                    style={{ visibility: cell.currentMonth ? 'visible' : 'hidden' }}
                    title={estaAsignado ? `Asignado el ${new Date(`${fecha}T00:00:00`).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}
                  >
                    {cell.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

        </main>

        <aside className="horarios-sidebar">
          <div className="horarios-sidebar-header">
            <h2>Personas</h2>
            <span>{usuarios.length} personas</span>
          </div>

          <div className="horarios-user-list">
            {usuarios.map((usuario) => (
              <button
                key={usuario.id}
                type="button"
                className={
                  Number(usuarioSeleccionado) === Number(usuario.id)
                    ? 'horario-user-item active'
                    : 'horario-user-item'
                }
                onClick={() => setUsuarioSeleccionado(usuario.id)}
              >
                <span className="horario-user-avatar">{usuario.nombre.charAt(0)}</span>
                <span>{usuario.nombre}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>

      {mostrarModalEliminar && (
        <div className="horarios-delete-modal-overlay" onClick={() => setMostrarModalEliminar(false)}>
          <div className="horarios-delete-modal" onClick={(event) => event.stopPropagation()}>
            <div className="horarios-delete-modal-header">
              <h3>Eliminar asignaciones</h3>
              <button type="button" className="horarios-close-modal" onClick={() => setMostrarModalEliminar(false)}>
                ×
              </button>
            </div>

            <div className="horarios-delete-form">
              <label>
                <span>Fecha de inicio</span>
                <input
                  type="date"
                  value={fechaInicioEliminar}
                  onChange={(event) => setFechaInicioEliminar(event.target.value)}
                />
              </label>

              <label>
                <span>Fecha de fin</span>
                <input
                  type="date"
                  value={fechaFinEliminar}
                  onChange={(event) => setFechaFinEliminar(event.target.value)}
                />
              </label>
            </div>

            <p className="horarios-delete-confirmation">
              ¿Desea eliminar las asignaciones de <strong>{usuarioActual?.nombre}</strong> para <strong>{elementoActual?.nombre}</strong> en el rango seleccionado?
            </p>

            <div className="horarios-delete-actions">
              <button type="button" className="horarios-cancel-button" onClick={() => setMostrarModalEliminar(false)}>
                Cancelar
              </button>
              <button type="button" className="horarios-confirm-delete-button" onClick={eliminarAsignacionesEnRango}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Horarios;
