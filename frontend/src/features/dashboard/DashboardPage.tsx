import api from '../../services/api';
import { useState, useEffect } from 'react';
import './DashboardPage.css';

interface DashboardSummary {
  kpis: {
    totalEquipment: { value: string; hint: string };
    pendingRequests: { value: string; hint: string };
    mttr: { value: string; trend: string };
    mtbf: { value: string; trend: string };
  };
  failuresByDepartment: { label: string; value: number }[];
  equipmentStatus: { label: string; value: number; color: string }[];
}

const DEFAULT_DATA: DashboardSummary = {
  kpis: {
    totalEquipment: { value: '142', hint: '92% en service' },
    pendingRequests: { value: '08', hint: '2 urgentes' },
    mttr: { value: '2.4 h', trend: '-8% ce mois-ci' },
    mtbf: { value: '185 h', trend: '+5% ce mois-ci' },
  }
};

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary>(DEFAULT_DATA);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
  async function fetchDashboardSummary() {
    try {
      const [kpisRes, deptRes, statusRes] = await Promise.all([
        api.get('/dashboard/kpis'),
        api.get('/dashboard/failures-by-department'),
        api.get('/dashboard/equipment-status'),
      ]);
      const k = kpisRes.data;
      setData({
        kpis: {
          totalEquipment: { value: String(k.totalRequests), hint: `${k.pendingRequests} en attente` },
          pendingRequests: { value: String(k.pendingRequests), hint: `${k.overdueRequests} en retard` },
          mttr: { value: `${k.mttrHours} h`, trend: '' },
          mtbf: { value: `${k.mtbfHours} h`, trend: '' },
        },
        failuresByDepartment: deptRes.data.map((d: any) => ({ label: d.label, value: d.value })),
        equipmentStatus: statusRes.data.map((s: any, i: number) => ({
          label: s.label, value: s.value,
          color: ['#22c55e', '#f59e0b', '#ef4444', '#94a3b8'][i % 4],
        })),
      });
    } catch {
      // conserve les données par défaut si le backend est injoignable
    } finally {
      setLoading(false);
    }
  }
  fetchDashboardSummary();
}, []);
  const kpiList = [
    { label: 'Total équipements', value: data.kpis.totalEquipment.value, hint: data.kpis.totalEquipment.hint, trend: null },
    { label: 'Demandes en cours', value: data.kpis.pendingRequests.value, hint: data.kpis.pendingRequests.hint, trend: null },
    { label: 'MTTR', value: data.kpis.mttr.value, hint: 'Temps moyen de réparation', trend: data.kpis.mttr.trend },
    { label: 'MTBF', value: data.kpis.mtbf.value, hint: 'Temps moyen entre pannes', trend: data.kpis.mtbf.trend },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Tableau de Bord Exécutif</h1>
          <p>Données et indicateurs de performance en temps réel</p>
        </div>
        {loading && <span className="dashboard-loading-badge">Mise à jour...</span>}
      </div>

      <div className="kpi-grid">
        {kpiList.map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
            <div className={`kpi-hint${kpi.trend ? ' with-trend' : ''}`}>
              {kpi.trend && <span className="kpi-trend">{kpi.trend}</span>}
              {kpi.hint}
            </div>
          </div>
        ))}
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h2>Nombre de Pannes par Département</h2>
          <BarChart data={data.failuresByDepartment} />
        </div>

        <div className="chart-card">
          <h2>Répartition par Statut d'Équipement</h2>
          <DonutChart data={data.equipmentStatus} total={parseInt(data.kpis.totalEquipment.value, 10) || 142} />
        </div>
      </div>
    </div>
  );
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="bar-chart">
      {data.map((d) => (
        <div key={d.label} className="bar-column">
          <div className="bar-value-tooltip">{d.value}</div>
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

function DonutChart({
  data,
  total,
}: {
  data: { label: string; value: number; color: string }[];
  total: number;
}) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="donut-chart-container">
      <div className="donut-chart">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--navy-700, #1e293b)" strokeWidth="18" />
          {data.map((segment) => {
            const length = (segment.value / 100) * circumference;
            const dasharray = `${length} ${circumference - length}`;
            const circle = (
              <circle
                key={segment.label}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth="18"
                strokeDasharray={dasharray}
                strokeDashoffset={-offset}
                transform="rotate(-90 80 80)"
                strokeLinecap="butt"
              />
            );
            offset += length;
            return circle;
          })}
          <text x="80" y="74" textAnchor="middle" className="donut-total-value">
            {total}
          </text>
          <text x="80" y="94" textAnchor="middle" className="donut-total-label">
            Total
          </text>
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
        </ul>
      </div>
    </div>
  );
}