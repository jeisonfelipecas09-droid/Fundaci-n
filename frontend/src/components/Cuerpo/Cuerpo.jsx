import { useEffect, useMemo, useState } from 'react';
import './Cuerpo.css';
import '../C-ajustes/Cajustes.css';

const STORAGE_KEY = 'asignacionesDisponibilidad';

const activosDisponibles = [
  { id: 1, nombre: 'Cámara IP', estado: 'Activo' },
  { id: 2, nombre: 'Laptop Dell', estado: 'Activo' },
  { id: 3, nombre: 'Proyector', estado: 'Activo' },
  { id: 4, nombre: 'Impresora Láser', estado: 'Activo' },
  { id: 5, nombre: 'Router Wi‑Fi', estado: 'Activo' },
];

const usuariosAsignables = [
  { id: 1, nombre: 'Juan Pérez' },
  { id: 2, nombre: 'María Gómez' },
  { id: 3, nombre: 'Carlos Ruiz' },
  { id: 4, nombre: 'Ana Torres' },
  { id: 5, nombre: 'Luis Morales' },
  { id: 6, nombre: 'Sofía Díaz' },
];

const getAssignmentsFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
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
  const dayOfWeek = (firstDay.getDay() + 6) % 7;
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

const agenda = [
  { day: 3, title: 'Revisión de proyecto', time: '09:00' },
  { day: 6, title: 'Llamada con cliente', time: '11:30' },
  { day: 10, title: 'Entrega de informe', time: '15:00' },
  { day: 15, title: 'Taller de diseño', time: '16:30' },
  { day: 22, title: 'Planificación', time: '10:00' },
  { day: 28, title: 'Sprint review', time: '14:00' },
];

function getMonthCells(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startingDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = startingDay - 1; i >= 0; i -= 1) {
    cells.push({ date: new Date(year, month - 1, prevMonthDays - i), currentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: new Date(year, month, day), currentMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const nextDay = cells.length - daysInMonth - startingDay + 1;
    cells.push({ date: new Date(year, month + 1, nextDay), currentMonth: false });
  }

  return cells;
}

function getWeekDays(date) {
  const start = new Date(date);
  const day = start.getDay();
  const mondayOffset = (day + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    return current;
  });
}

function Cuerpo({ view, setView }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [assignments, setAssignments] = useState(getAssignmentsFromStorage);
  const [memoEntries, setMemoEntries] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [entryTime, setEntryTime] = useState('09:00');
  const [entryType, setEntryType] = useState('RQ');
  const [entryNumber, setEntryNumber] = useState('');
  const [entryText, setEntryText] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [mostrarAsignacion, setMostrarAsignacion] = useState(false);
  const [usuarioAsignacion, setUsuarioAsignacion] = useState(usuariosAsignables[0]?.id || '');
  const [elementoAsignacion, setElementoAsignacion] = useState(activosDisponibles[0]?.id || '');
  const [mesAsignacion, setMesAsignacion] = useState(new Date());
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState([]);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragMode, setDragMode] = useState(null);

  useEffect(() => {
    const syncAssignments = () => setAssignments(getAssignmentsFromStorage());
    syncAssignments();
    window.addEventListener('assignmentsUpdated', syncAssignments);

    return () => {
      window.removeEventListener('assignmentsUpdated', syncAssignments);
    };
  }, []);

  const toggleFechaAsignacion = (fecha) => {
    setFechasSeleccionadas((prev) => {
      if (prev.includes(fecha)) {
        return prev.filter((item) => item !== fecha);
      }

      return [...prev, fecha].sort();
    });
  };

  const obtenerDatosFechaElemento = (fecha) => {
    const elementoId = Number(elementoAsignacion);
    const usuarioId = Number(usuarioAsignacion);

    if (!elementoId || !usuarioId) {
      return { ocupadaPorOtro: false, ocupadaPorMi: false, usuarioAsignado: null };
    }

    const asignaciones = getAssignmentsFromStorage().filter(
      (asignacion) => Number(asignacion.elementoId) === elementoId && asignacion.fecha === fecha,
    );

    const asignacionOtraPersona = asignaciones.find(
      (asignacion) => Number(asignacion.usuarioId) !== usuarioId,
    );

    const asignacionPropia = asignaciones.find(
      (asignacion) => Number(asignacion.usuarioId) === usuarioId,
    );

    return {
      ocupadaPorOtro: Boolean(asignacionOtraPersona),
      ocupadaPorMi: Boolean(asignacionPropia),
      usuarioAsignado: asignacionOtraPersona ? asignacionOtraPersona.usuarioNombre : null,
    };
  };

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

  const openAssignModal = (date) => {
    setMesAsignacion(new Date(date));
    setFechasSeleccionadas([]);
    setMostrarAsignacion(true);
  };

  const handleAsignacion = (event) => {
    event.preventDefault();

    if (!usuarioAsignacion || fechasSeleccionadas.length === 0) return;

    const usuario = usuariosAsignables.find((item) => Number(item.id) === Number(usuarioAsignacion));
    const elemento = activosDisponibles.find((item) => item.id === Number(elementoAsignacion));

    if (!usuario || !elemento) return;

    const guardadas = getAssignmentsFromStorage();
    const nuevasAsignaciones = fechasSeleccionadas.map((fecha) => ({
      id: `${Date.now()}-${fecha}`,
      usuarioId: usuario.id,
      usuarioNombre: usuario.nombre,
      elementoId: elemento.id,
      elementoNombre: elemento.nombre,
      fecha,
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify([...guardadas, ...nuevasAsignaciones]));
    window.dispatchEvent(new CustomEvent('assignmentsUpdated'));

    setMostrarAsignacion(false);
    setFechasSeleccionadas([]);
    setMesAsignacion(new Date());
    setUsuarioAsignacion(usuariosAsignables[0]?.id || '');
    setElementoAsignacion(activosDisponibles[0]?.id || '');
  };

  const monthCells = useMemo(() => getMonthCells(currentDate), [currentDate]);
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const monthLabel = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const dayLabel = currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const weekLabel = `${weekDays[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${weekDays[6].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
  const currentDayEntries = memoEntries.filter((entry) => entry.date === currentDate.toDateString());

  const createEntry = () => {
    if (!entryText.trim()) return;
    if ((entryType === 'RQ' || entryType === 'IC') && !entryNumber.trim()) return;

    const category = entryType === 'Otros' ? 'Otros' : entryType;
    const formattedText = entryType === 'Otros'
      ? `Otros: ${entryText.trim()}`
      : `${entryType} ${entryNumber.trim()}: ${entryText.trim()}`;

    setMemoEntries((prev) => [
      ...prev,
      {
        date: currentDate.toDateString(),
        time: entryTime,
        text: formattedText,
        category,
        description: entryText.trim(),
        number: (entryType === 'RQ' || entryType === 'IC') ? entryNumber.trim() : '',
      },
    ]);
    setEntryText('');
    setEntryTime('09:00');
    setEntryType('RQ');
    setEntryNumber('');
    setShowCreateForm(false);
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
    setEntryText('');
    setEntryTime('09:00');
    setEntryType('RQ');
    setEntryNumber('');
  };

  const closeEntryModal = () => {
    setSelectedEntry(null);
  };

  const nextDate = () => {
    if (view === 'mes') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (view === 'semana') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1));
    }
  };

  const prevDate = () => {
    if (view === 'mes') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (view === 'semana') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1));
    }
  };

  const changeDate = (date, nextView = null) => {
    setCurrentDate(date);
    setSelectedDate(date);
    if (nextView) {
      setView(nextView);
    }
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    setView('mes');
  };

  const todayEvents = agenda.filter((event) => event.day === currentDate.getDate());
  const dayItems = [
    ...todayEvents.map((event) => ({
      id: `${event.day}-${event.time}-agenda`,
      time: event.time,
      title: event.title,
      kind: 'agenda',
      category: 'agenda',
    })),
    ...currentDayEntries.map((entry, index) => ({
      id: `${entry.date}-${entry.time}-${index}-log`,
      time: entry.time,
      title: entry.text,
      kind: 'entry',
      category: entry.category || 'Otros',
      description: entry.description || '',
    })),
  ].sort((left, right) => left.time.localeCompare(right.time));
  const filteredDayItems = activeFilter === 'todos'
    ? dayItems
    : dayItems.filter((item) => item.kind === 'entry' && item.category === activeFilter);
  const miniItems = [
    ...todayEvents.map((event) => ({
      id: `${event.day}-${event.time}-mini-agenda`,
      time: event.time,
      title: event.title,
      kind: 'agenda',
    })),
    ...currentDayEntries.map((entry, index) => ({
      id: `${entry.date}-${entry.time}-${index}-mini-log`,
      time: entry.time,
      title: entry.text,
      kind: 'entry',
      category: entry.category || 'Otros',
      number: entry.number || '',
      description: entry.description || '',
    })),
  ].sort((left, right) => left.time.localeCompare(right.time));

  return (
    <div className="cuerpo">
      <div className="SubCuerp" id="subcuerpo1">
        <div className="calendar-shell">
          <div className="calendar-header">
            <div>
              <p className="eyebrow">Agenda inteligente</p>
              <h2>{view === 'mes' ? monthLabel : view === 'semana' ? `Semana ${weekLabel}` : dayLabel}</h2>
            </div>
            <div className="view-switcher">
              {['mes', 'semana', 'dia'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={view === option ? 'view-btn active' : 'view-btn'}
                  onClick={() => setView(option)}
                >
                  {option === 'mes' ? 'Mes' : option === 'semana' ? 'Semana' : 'Día'}
                </button>
              ))}
            </div>
          </div>

          <div className="calendar-controls">
            <button type="button" className="nav-btn" onClick={prevDate}>←</button>
            <span>{view === 'mes' ? monthLabel : view === 'semana' ? weekLabel : dayLabel}</span>
            <button type="button" className="nav-btn" onClick={nextDate}>→</button>
          </div>

          {view === 'mes' && (
            <div className="calendar-grid">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dayName) => (
                <div key={dayName} className="weekday-name">{dayName}</div>
              ))}
              {monthCells.map((cell) => {
                const isToday = cell.date.toDateString() === new Date().toDateString();
                const isSelected = cell.date.toDateString() === selectedDate.toDateString();
                const hasEvent = agenda.some((event) => event.day === cell.date.getDate());
                const dayAssignments = assignments.filter(
                  (assignment) => assignment.fecha === cell.date.toISOString().slice(0, 10)
                );

                return (
                  <div
                    key={`${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`}
                    className={cell.currentMonth ? (isSelected ? 'day-cell selected' : 'day-cell') : 'day-cell muted'}
                    onClick={() => changeDate(cell.date)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        changeDate(cell.date);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <span className={isToday ? 'day-number today' : 'day-number'}>{cell.date.getDate()}</span>
                    {hasEvent && <span className="event-dot" />}
                    {dayAssignments.length > 0 && (
                      <div className="day-assignment-list">
                        {dayAssignments.slice(0, 2).map((assignment) => (
                          <span key={`${assignment.id}-${assignment.usuarioNombre}`} className="day-assignment-tag">
                            {assignment.usuarioNombre.split(' ')[0]}
                          </span>
                        ))}
                        {dayAssignments.length > 2 && (
                          <span className="day-assignment-more">+{dayAssignments.length - 2}</span>
                        )}
                      </div>
                    )}
                    {cell.currentMonth && (
                      <button
                        type="button"
                        className="day-cell-assign"
                        onClick={(event) => {
                          event.stopPropagation();
                          openAssignModal(cell.date);
                        }}
                      >
                        Asignar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {view === 'semana' && (
            <div className="week-view">
              {weekDays.map((day) => {
                const dayEvents = agenda.filter((event) => event.day === day.getDate());
                return (
                  <div key={day.toISOString()} className="week-day-card">
                    <h4>{day.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}</h4>
                    {dayEvents.length > 0 ? dayEvents.map((event) => (
                      <p key={`${event.day}-${event.time}`} className="event-pill">{event.time} · {event.title}</p>
                    )) : <p className="empty-state">Sin citas</p>}
                  </div>
                );
              })}
            </div>
          )}

          {view === 'dia' && (
            <div className="day-view">
              <div className="day-summary">
                <div className="day-summary-top">
                  <div>
                    <h3>{currentDate.toLocaleDateString('es-ES', { weekday: 'long' })}</h3>
                    <p>{todayEvents.length > 0 ? 'Tienes actividades programadas' : 'Tu día está libre'}</p>
                  </div>
                  <button
                    type="button"
                    className="create-btn"
                    onClick={() => setShowCreateForm(true)}
                  >
                    Crear
                  </button>
                </div>
                {showCreateForm && (
                  <div className="create-modal-backdrop" onClick={closeCreateForm}>
                    <div
                      className="create-modal"
                      role="dialog"
                      aria-modal="true"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="create-modal-header">
                        <h4>Crear registro</h4>
                        <button type="button" className="create-modal-close" onClick={closeCreateForm}>
                          ×
                        </button>
                      </div>
                      <div className="create-form">
                        <label>
                          Hora
                          <input
                            type="time"
                            value={entryTime}
                            onChange={(e) => setEntryTime(e.target.value)}
                          />
                        </label>
                        <label>
                          Tipo
                          <select
                            value={entryType}
                            onChange={(e) => setEntryType(e.target.value)}
                          >
                            <option value="RQ">RQ</option>
                            <option value="IC">IC</option>
                            <option value="Otros">Otros</option>
                          </select>
                        </label>
                        {(entryType === 'RQ' || entryType === 'IC') && (
                          <label>
                            Número de RQ/IC
                            <input
                              type="text"
                              value={entryNumber}
                              onChange={(e) => setEntryNumber(e.target.value)}
                              placeholder="Ej: 12345"
                            />
                          </label>
                        )}
                        <label>
                          Bitácora
                          <textarea
                            value={entryText}
                            onChange={(e) => setEntryText(e.target.value)}
                            placeholder="Describe la actividad..."
                          />
                        </label>
                        <button type="button" className="submit-create" onClick={createEntry}>
                          Guardar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="day-log-list">
                <h5>Agenda y bitácora del día</h5>
               
                <div className="filter-row">
                 <button type="button" className={activeFilter === 'todos' ? 'filter-btn active' : 'filter-btn'} onClick={() => setActiveFilter('todos')}>
                    Todo
                  </button>
                  <button type="button" className={activeFilter === 'RQ' ? 'filter-btn active' : 'filter-btn'} onClick={() => setActiveFilter('RQ')}>
                    RQ
                  </button>
                  <button type="button" className={activeFilter === 'IC' ? 'filter-btn active' : 'filter-btn'} onClick={() => setActiveFilter('IC')}>
                    IC
                  </button>
                </div>
                <div className="time-list">
                  {filteredDayItems.length > 0 ? filteredDayItems.map((item) => (
                    <div key={item.id} className={`time-item ${item.kind === 'entry' ? 'log-item' : 'agenda-item'}`}>
                      <span>{item.time}</span>
                      <button
                        type="button"
                        className="filter-btn"
                        onClick={() => setSelectedEntry(item)}
                      >
                        Abrir {item.kind === 'entry' ? item.category : 'Agenda'}
                      </button>
                    </div>
                  )) : <div className="time-item empty">Sin registros para este día</div>}
                </div>

                {selectedEntry && (
                  <div className="create-modal-backdrop" onClick={closeEntryModal}>
                    <div
                      className="create-modal"
                      role="dialog"
                      aria-modal="true"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="create-modal-header">
                        <h4>{selectedEntry.category}</h4>
                        <button type="button" className="create-modal-close" onClick={closeEntryModal}>
                          ×
                        </button>
                      </div>
                      <div className="create-form">
                        <label>
                          Descripción
                          <div className="description-box">
                            {selectedEntry.kind === 'entry' ? (selectedEntry.description || selectedEntry.title) : selectedEntry.title}
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="SubCuerp" id="subcuerpo2">
        <div className="side-panel">
          <div className="mini-events-panel">
            <div className="mini-events-header">
              <p className="eyebrow">Eventos</p>
              <h3>{dayLabel}</h3>
            </div>

            {miniItems.length > 0 ? miniItems.map((item) => {
              const category = item.category || 'agenda';
              const categoryLabel = item.kind === 'entry'
                ? (category === 'RQ' || category === 'IC' ? category : 'OTRO')
                : 'Agenda';

              return (
                <div
                  key={item.id}
                  className={`mini-event ${item.kind === 'entry' ? 'mini-event-log' : 'mini-event-agenda'} ${category === 'RQ' ? 'rq' : category === 'IC' ? 'ic' : ''}`}
                >
                  <div className="mini-event-main">
                    <span className="mini-event-time">{item.time}</span>
                    <div className="mini-event-copy">
                      
                      <small>{ item.description || 'Sin descripción'}</small>
                    </div>
                  </div>
                  <span className="mini-event-number">
                    {item.kind === 'entry' && (item.category === 'RQ' || item.category === 'IC')
                      ? `${item.category} ${item.number}`
                      : (item.number || '')}
                  </span>
                </div>
              );
            }) : <p className="empty-state">Sin eventos</p>}
          </div>
        </div>
      </div>

      {mostrarAsignacion && (
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
                <select
                  value={usuarioAsignacion}
                  onChange={(event) => setUsuarioAsignacion(event.target.value)}
                >
                  {usuariosAsignables.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Elemento activo
                <select
                  value={elementoAsignacion}
                  onChange={(event) => setElementoAsignacion(event.target.value)}
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
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                    <span key={day} className="date-picker-weekday">{day}</span>
                  ))}

                  {obtenerDiasCalendario(mesAsignacion).map((cell) => {
                    const fecha = formatearFechaClave(cell.date);
                    const isSelected = fechasSeleccionadas.includes(fecha);
                    const estadoFecha = !cell.currentMonth ? null : obtenerDatosFechaElemento(fecha);
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

export default Cuerpo;