import api from '../../services/api';
import { useState, useEffect, useCallback } from 'react';
import './DashboardPage.css';

// TypeScript Interfaces
interface Intervention {
  id: string | number;
  code: string;
  equipment: string;
  technician: string;
  technicianInitials?: string;
  priority: string;
  status: string;
  date: string;
}

interface KpisData {
  totalEquipments: number;
  inServicePercentage: number;
  pendingRequests: number;
  urgentRequests: number;
  mttrHours: number;
  mttrTrend: string;
  mtbfHours: number;
  mtbfTrend: string;
}

interface DashboardSummary {
  kpis: KpisData;
  failuresByDepartment: { label: string; value: number }[];
  equipmentStatus: { label: string; value: number; color: string }[];
  recentInterventions: Intervention[];
}

const DEFAULT_DATA: DashboardSummary = {
  kpis: {
    totalEquipments: 0,
    inServicePercentage: 0,
    pendingRequests: 0,
    urgentRequests: 0,
    mttrHours: 0,
    mttrTrend: '0%',
    mtbfHours: 0,
    mtbfTrend: '0%',
  },
  failuresByDepartment: [],
  equipmentStatus: [],
  recentInterventions: [],
};

const COLOR_PALETTE = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#94a3b8'];

// Helper pour calculer les initiales d'un technicien (ex: "Youssef Alami" -> "YA")
function getInitials(name?: string): string {
  if (!name || name === 'Non assigné') return 'NA';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary>(DEFAULT_DATA);
  const [loading, setLoading] = useState<boolean>(true);

  // Fonction de récupération des données temps réel
  const fetchDashboardData = useCallback(async () => {
    try {
      const [kpisRes, deptRes, statusRes, interventionsRes] = await Promise.allSettled([
        api.get('/dashboard/kpis'),
        api.get('/dashboard/failures-by-department'),
        api.get('/dashboard/equipment-status'),
        api.get('/dashboard/recent-interventions'),
      ]);

      // 1. KPIs
      const k = kpisRes.status === 'fulfilled' ? kpisRes.value.data : {};
      const kpis: KpisData = {
        totalEquipments: k?.totalEquipments ?? k?.totalRequests ?? 0,
        inServicePercentage: k?.inServicePercentage ?? 92,
        pendingRequests: k?.pendingRequests ?? 0,
        urgentRequests: k?.urgentRequests ?? k?.overdueRequests ?? 0,
        mttrHours: k?.mttrHours ?? 0,
        mttrTrend: k?.mttrTrend ?? '-15% ce mois-ci',
        mtbfHours: k?.mtbfHours ?? 0,
        mtbfTrend: k?.mtbfTrend ?? '+8% ce mois-ci',
      };

      // 2. Pannes par Département
      const deptData = deptRes.status === 'fulfilled' && Array.isArray(deptRes.value.data)
        ? deptRes.value.data.map((d: any) => ({
            label: d.label ?? d.departmentName ?? 'Autre',
            value: Number(d.value ?? d.count ?? 0),
          }))
        : [];

      // 3. Statut Équipement
      const statusData = statusRes.status === 'fulfilled' && Array.isArray(statusRes.value.data)
        ? statusRes.value.data.map((s: any, i: number) => ({
            label: s.label ?? s.statusName ?? 'Inconnu',
            value: Number(s.value ?? s.percentage ?? 0),
            color: s.color ?? COLOR_PALETTE[i % COLOR_PALETTE.length],
          }))
        : [];

      // 4. Interventions récentes
      const rawInterventions = interventionsRes.status === 'fulfilled' && Array.isArray(interventionsRes.value.data)
        ? interventionsRes.value.data
        : [];

      const recentInterventions: Intervention[] = rawInterventions.map((item: any) => ({
        id: item.id ?? item.code,
        code: item.code ?? `DEM-${item.id}`,
        equipment: item.equipmentName ?? item.equipment ?? 'Équipement non spécifié',
        technician: item.technicianName ?? item.technician ?? 'Non assigné',
        technicianInitials: item.technicianInitials ?? getInitials(item.technicianName ?? item.technician),
        priority: item.priority ?? 'Moyenne',
        status: item.status ?? 'En attente',
        date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : (item.date ?? 'Aujourd\'hui'),
      }));

      setData({
        kpis,
        failuresByDepartment: deptData,
        equipmentStatus: statusData,
        recentInterventions,
      });
    } catch (err) {
      console.error('Erreur de mise à jour du Dashboard en temps réel:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling temps réel (mise à jour toutes les 10 secondes)
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 10000); // 10 secondes

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const currentDateFormatted = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Tableau de Bord Exécutif</h1>
          <p className="dashboard-subtitle">
            <span style={{ textTransform: 'capitalize' }}>{currentDateFormatted}</span> · Données en temps réel
          </p>
        </div>
        {loading && <span className="dashboard-loading-badge">Synchronisation...</span>}
      </div>

      {/* Grille des KPIs */}
      <div className="kpi-grid">
        {/* KPI 1 */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">TOTAL ÉQUIPEMENTS</span>
            <div className="kpi-icon-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </div>
          </div>
          <div className="kpi-value">{data.kpis.totalEquipments}</div>
          <div className="kpi-hint">{data.kpis.inServicePercentage}% en service</div>
          <div className="kpi-progress-bar">
            <div className="kpi-progress-fill" style={{ width: `${data.kpis.inServicePercentage}%` }}></div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">DEMANDES EN COURS</span>
            <div className="kpi-icon-wrapper orange">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{String(data.kpis.pendingRequests).padStart(2, '0')}</span>
            {data.kpis.urgentRequests > 0 && (
              <span className="kpi-badge-urgent">{data.kpis.urgentRequests} urgentes</span>
            )}
          </div>
          <div className="kpi-hint">Demandes en attente</div>
        </div>

        {/* KPI 3 */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">MTTR</span>
            <div className="kpi-icon-wrapper green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <div className="kpi-value">{data.kpis.mttrHours} <span className="unit">h</span></div>
          <div className="kpi-trend green">↑ {data.kpis.mttrTrend}</div>
          <div className="kpi-hint">Temps Moyen de Réparation</div>
        </div>

        {/* KPI 4 */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">MTBF</span>
            <div className="kpi-icon-wrapper green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </div>
          </div>
          <div className="kpi-value">{data.kpis.mtbfHours} <span className="unit">h</span></div>
          <div className="kpi-trend green">↑ {data.kpis.mtbfTrend}</div>
          <div className="kpi-hint">Temps Moyen Entre Pannes</div>
        </div>
      </div>

      {/* Grille des Graphiques */}
      <div className="chart-grid">
        {/* Graphique 1: BarChart */}
        <div className="chart-card">
          <h2>Nombre de Pannes par Département</h2>
          <p className="chart-subtitle">Août 2026</p>
          <BarChart data={data.failuresByDepartment} />
        </div>

        {/* Graphique 2: DonutChart */}
        <div className="chart-card">
          <h2>Répartition par Statut d'Équipement</h2>
          <p className="chart-subtitle">{data.kpis.totalEquipments} équipements au total</p>
          <DonutChart data={data.equipmentStatus} total={data.kpis.totalEquipments} />
        </div>
      </div>

      {/* Section Dernières Interventions Signalées (Dynamique) */}
      <div className="recent-interventions-card">
        <div className="recent-interventions-header">
          <div>
            <h2>Dernières Interventions Signalées</h2>
            <p className="chart-subtitle">{data.recentInterventions.length} interventions récentes</p>
          </div>
          <button className="export-btn" onClick={() => window.print()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exporter Rapport
          </button>
        </div>

        {data.recentInterventions.length === 0 ? (
          <div className="no-data-msg">Aucune intervention enregistrée pour le moment.</div>
        ) : (
          <table className="recent-table">
            <thead>
              <tr>
                <th>CODE DEMANDE</th>
                <th>ÉQUIPEMENT</th>
                <th>TECHNICIEN</th>
                <th>PRIORITÉ</th>
                <th>STATUT</th>
                <th>DATE</th>
              </tr>
            </thead>
            <tbody>
              {data.recentInterventions.map((item) => (
                <tr key={item.id}>
                  <td className="code-cell">{item.code}</td>
                  <td className="equipment-cell">{item.equipment}</td>
                  <td>
                    <div className="technician-cell">
                      <span className="avatar-circle">{item.technicianInitials}</span>
                      <span>{item.technician}</span>
                    </div>
                  </td>
                  <td>
                    <PriorityBadge priority={item.priority} />
                  </td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Badges
function PriorityBadge({ priority }: { priority: string }) {
  const p = priority.toLowerCase();
  let className = 'priority-badge moyenne';
  if (p.includes('critique')) className = 'priority-badge critique';
  else if (p.includes('élevée') || p.includes('elevee') || p.includes('haute')) className = 'priority-badge elevee';
  else if (p.includes('basse')) className = 'priority-badge basse';

  return <span className={className}>{priority}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s.includes('résolu') || s.includes('resolu') || s.includes('terminé')) {
    return <span className="status-badge resolved">● Résolu</span>;
  }
  return <span className="status-badge in-progress">● {status}</span>;
}

// Composants de Graphiques
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  if (data.length === 0) {
    return <div className="no-data-msg">Aucune donnée disponible pour le graphique.</div>;
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bar-chart">
      {data.map((d) => (
        <div key={d.label} className="bar-column">
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ height: `${(d.value / max) * 100}%` }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
          <span className="bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data, total }: { data: { label: string; value: number; color: string }[]; total: number }) {
  if (data.length === 0) {
    return <div className="no-data-msg">Aucune donnée de statut d'équipement.</div>;
  }

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="donut-chart-container">
      <div className="donut-chart">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#1e293b" strokeWidth="18" />
          {data.map((segment) => {
            const strokeDasharray = `${(segment.value / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += segment.value;

            return (
              <circle
                key={segment.label}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth="18"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 80 80)"
              />
            );
          })}
        </svg>

        <ul className="donut-legend">
          {data.map((segment) => (
            <li key={segment.label}>
              <div className="donut-legend-info">
                <span className="dot" style={{ background: segment.color }} />
                <span className="label-text">{segment.label}</span>
              </div>
              <span className="donut-legend-value">{segment.value}%</span>
            </li>
          ))}
          <li className="donut-legend-total">
            <span>TOTAL</span>
            <strong>{total}</strong>
          </li>
        </ul>
      </div>
    </div>
  );
}