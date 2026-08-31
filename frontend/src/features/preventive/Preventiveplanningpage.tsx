import { useEffect, useMemo, useState, useCallback } from 'react';
import api from '../../services/api';
//import { PreventivePlanForm } from './PreventivePlanForm'; // Importation du formulaire dans le même dossier
import './PreventivePlanningPage.css';

type EventType = 'Mecanique' | 'Electrique' | 'Inspection' | 'Lubrification';

interface PlanEvent {
  id: string;
  day: number;
  label: string;
  type: EventType;
}

const TYPE_COLORS: Record<EventType, string> = {
  Mecanique: '#60a5fa',
  Electrique: '#fbbf24',
  Inspection: '#a78bfa',
  Lubrification: '#4ade80',
};

const TYPE_LABELS: Record<EventType, string> = {
  Mecanique: 'Mécanique',
  Electrique: 'Électrique',
  Inspection: 'Inspection',
  Lubrification: 'Lubrification',
};

const FALLBACK_EVENTS: PlanEvent[] = [
  { id: 'demo-1', day: 3, label: 'Graissage pont arrière (Tracteur A)', type: 'Lubrification' },
  { id: 'demo-2', day: 10, label: 'Vérification hydraulique (M.F.)', type: 'Mecanique' },
  { id: 'demo-3', day: 12, label: 'Remplacement courroie…', type: 'Mecanique' },
  { id: 'demo-4', day: 18, label: 'Vidange moteur (Youssef A.)', type: 'Mecanique' },
  { id: 'demo-5', day: 20, label: 'Test Groupe Électrogène (Hassan M.)', type: 'Electrique' },
  { id: 'demo-6', day: 24, label: 'Calibration capteurs IoT', type: 'Inspection' },
  { id: 'demo-7', day: 25, label: 'Inspection Chaîne Jaouda (Youssef A.)', type: 'Inspection' },
  { id: 'demo-8', day: 29, label: 'Vidange hydraulique (Youssef A.)', type: 'Lubrification' },
];

const WEEKDAYS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

function inferType(planName: string): EventType {
  const key = planName.toLowerCase();
  if (key.includes('électr') || key.includes('electr')) return 'Electrique';
  if (key.includes('inspect')) return 'Inspection';
  if (key.includes('lubrif') || key.includes('graiss') || key.includes('vidange')) return 'Lubrification';
  return 'Mecanique';
}

export function PreventivePlanningPage() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [events, setEvents] = useState<PlanEvent[]>(FALLBACK_EVENTS);
  const [usingFallback, setUsingFallback] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fonction pour charger et rafraîchir la liste des tâches
  const fetchUpcomingTasks = useCallback(() => {
    api.get('/preventive-plans/upcoming-tasks')
      .then((res) => {
        const tasks = res.data as { id: string; dueDate: string; planName: string; equipmentName: string }[];
        if (tasks.length === 0) return;
        const mapped: PlanEvent[] = tasks.map((t) => ({
          id: t.id,
          day: new Date(t.dueDate).getDate(),
          label: `${t.planName} (${t.equipmentName})`,
          type: inferType(t.planName),
        }));
        setEvents(mapped);
        setUsingFallback(false);
      })
      .catch(() => {
        // En cas d'erreur backend, on garde le fallback
      });
  }, []);

  useEffect(() => {
    fetchUpcomingTasks();
  }, [fetchUpcomingTasks]);

  const { label, weeks } = useMemo(() => buildMonth(monthOffset), [monthOffset]);

  const upcoming = useMemo(
    () => [...events].sort((a, b) => a.day - b.day).slice(0, 5),
    [events]
  );

  return (
    <div className="planning-page">
      <div className="planning-main">
        <div className="planning-header">
          <div>
            <h1>Planning Préventif &amp; Calendrier des Révisions</h1>
            <p>
              {events.length} tâches planifiées
              {usingFallback && ' (données de démonstration)'}
            </p>
          </div>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            + Programmer Maintenance
          </button>
        </div>

        <div className="planning-toolbar">
          <div className="month-nav">
            <button onClick={() => setMonthOffset((m) => m - 1)} aria-label="Mois précédent">‹</button>
            <span>{label}</span>
            <button onClick={() => setMonthOffset((m) => m + 1)} aria-label="Mois suivant">›</button>
            <button className="today-btn" onClick={() => setMonthOffset(0)}>Aujourd'hui</button>
          </div>
          <div className="legend">
            {(Object.keys(TYPE_LABELS) as EventType[]).map((t) => (
              <span key={t} className="legend-item">
                <span className="legend-dot" style={{ background: TYPE_COLORS[t] }} />
                {TYPE_LABELS[t]}
              </span>
            ))}
          </div>
        </div>

        <div className="calendar">
          <div className="calendar-weekdays">
            {WEEKDAYS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div className="calendar-week" key={wi}>
              {week.map((day, di) => (
                <div className={`calendar-cell${day === null ? ' empty' : ''}`} key={di}>
                  {day !== null && (
                    <>
                      <span className="calendar-day-number">{day}</span>
                      <div className="calendar-events">
                        {events.filter((e) => e.day === day).map((e) => (
                          <span
                            key={e.id}
                            className="calendar-event"
                            style={{ background: `${TYPE_COLORS[e.type]}22`, color: TYPE_COLORS[e.type] }}
                            title={e.label}
                          >
                            {e.label}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <aside className="upcoming-panel">
        <h2>Prochaines Maintenances</h2>
        <p className="upcoming-sub">À partir du mois en cours</p>
        <ul className="upcoming-list">
          {upcoming.map((e) => (
            <li key={e.id}>
              <span className="upcoming-dot" style={{ background: TYPE_COLORS[e.type] }} />
              <div>
                <div className="upcoming-date">{e.day} {label.split(' ')[0]}</div>
                <div className="upcoming-label">{e.label}</div>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Modal pour afficher le formulaire de création */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-xl w-full">
            <PreventivePlanForm
              onSuccess={() => {
                setIsModalOpen(false);
                fetchUpcomingTasks(); // Rafraîchit les données du calendrier après enregistrement
              }}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function buildMonth(offset: number) {
  const base = new Date();
  const target = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  const year = target.getFullYear();
  const month = target.getMonth();

  const label = target
    .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, (c) => c.toUpperCase());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return { label, weeks };
}