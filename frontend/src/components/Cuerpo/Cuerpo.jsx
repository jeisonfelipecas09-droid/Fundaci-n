import { useMemo, useState } from 'react';
import './Cuerpo.css';

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
  const [memoEntries, setMemoEntries] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [entryTime, setEntryTime] = useState('09:00');
  const [entryType, setEntryType] = useState('RQ');
  const [entryNumber, setEntryNumber] = useState('');
  const [entryText, setEntryText] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [selectedEntry, setSelectedEntry] = useState(null);

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
      kind: 'bitacora',
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

                return (
                  <button
                    key={`${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`}
                    type="button"
                    className={cell.currentMonth ? (isSelected ? 'day-cell selected' : 'day-cell') : 'day-cell muted'}
                    onClick={() => changeDate(cell.date)}
                  >
                    <span className={isToday ? 'day-number today' : 'day-number'}>{cell.date.getDate()}</span>
                    {hasEvent && <span className="event-dot" />}
                  </button>
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
                        <p><strong>Descripción:</strong> {selectedEntry.kind === 'entry' ? (selectedEntry.description || selectedEntry.title) : selectedEntry.title}</p>
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
          <div className="mini-calendar-panel">
            <div className="mini-calendar-header">
              <div className="mini-nav-row">
                <button type="button" className="mini-nav-btn" onClick={() => changeMonth(-1)}>←</button>
                <div>
                  <p className="eyebrow">Calendario</p>
                  <h3>{currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h3>
                </div>
                <button type="button" className="mini-nav-btn" onClick={() => changeMonth(1)}>→</button>
              </div>
            </div>

            <div className="mini-calendar-grid">
              {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day) => (
                <span key={day} className="mini-weekday">{day}</span>
              ))}
              {getMonthCells(currentDate).map((cell, index) => {
                const isToday = cell.date.toDateString() === new Date().toDateString();
                const isSelected = cell.date.toDateString() === selectedDate.toDateString();
                return (
                  <button
                    key={`${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}-${index}`}
                    type="button"
                    className={cell.currentMonth ? (isSelected ? 'mini-day selected' : isToday ? 'mini-day active' : 'mini-day') : 'mini-day muted'}
                    onClick={() => changeDate(cell.date)}
                  >
                    {cell.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mini-events-panel">
            <h4>Hoy</h4>
            {miniItems.length > 0 ? miniItems.map((item) => (
              <div key={item.id} className={`mini-event ${item.kind === 'bitacora' ? 'mini-event-log' : ''}`}>
                <span>{item.time}</span>
                <strong>{item.title}</strong>
                <small>{item.kind === 'bitacora' ? 'Bitácora' : 'Agenda'}</small>
              </div>
            )) : <p className="empty-state">Sin eventos</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cuerpo;