import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { Language } from '../../shared/components/Layout';
import './SitesPage.css';

export type SiteStatus = 'Actif' | 'Maintenance';

export interface Site {
  id?: string | number;
  name: string;
  city: string;
  departmentsCount: number;
  equipmentCount: number;
  status: SiteStatus;
}

const COPY = {
  FR: { title: 'Sites', subtitle: 'Gérez les sites et leurs équipements', add: 'Ajouter un site', site: 'Site', city: 'Ville', departments: 'Départements', equipment: 'Équipements', status: 'Statut', active: 'Actif', maintenance: 'Maintenance', cancel: 'Annuler', loading: 'Chargement...', error: 'Erreur de chargement.' },
  EN: { title: 'Sites', subtitle: 'Manage sites and their equipment', add: 'Add a site', site: 'Site', city: 'City', departments: 'Departments', equipment: 'Equipment', status: 'Status', active: 'Active', maintenance: 'Maintenance', cancel: 'Cancel', loading: 'Loading...', error: 'Loading error.' },
  AR: { title: 'المواقع', subtitle: 'إدارة المواقع والمعدات التابعة لها', add: 'إضافة موقع', site: 'الموقع', city: 'المدينة', departments: 'الأقسام', equipment: 'المعدات', status: 'الحالة', active: 'نشط', maintenance: 'صيانة', cancel: 'إلغاء', loading: 'جاري التحميل...', error: 'خطأ في التحميل.' },
} as const;

export function SitesPage({ language }: { language: Language }) {
  const copy = COPY[language];
  const [sites, setSites] = useState<Site[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sites');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSites(data);
    } catch {
      // Données de secours
      setSites([
        { id: 1, name: 'Ferme Nord', city: 'Taroudant', departmentsCount: 3, equipmentCount: 38, status: 'Actif' },
        { id: 2, name: 'Laiterie Centrale', city: 'Agadir', departmentsCount: 5, equipmentCount: 64, status: 'Actif' },
        { id: 3, name: 'Usine Biadna', city: 'Marrakech', departmentsCount: 2, equipmentCount: 27, status: 'Actif' },
        { id: 4, name: 'Ferme Est', city: 'Oujda', departmentsCount: 2, equipmentCount: 13, status: 'Maintenance' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  async function addSite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedCity = city.trim();
    if (!trimmedName || !trimmedCity) return;

    const newSitePayload = { name: trimmedName, city: trimmedCity, departmentsCount: 0, equipmentCount: 0, status: 'Actif' as SiteStatus };

    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSitePayload),
      });

      if (res.ok) {
        const createdSite = await res.json();
        setSites((current) => [...current, createdSite]);
      } else {
        setSites((current) => [...current, { ...newSitePayload, id: Date.now() }]);
      }
    } catch {
      setSites((current) => [...current, { ...newSitePayload, id: Date.now() }]);
    }

    setName('');
    setCity('');
    setIsFormOpen(false);
  }

  return (
    <div className="sites-page" dir={language === 'AR' ? 'rtl' : 'ltr'}>
      <div className="sites-header">
        <div>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
        <button className="sites-add-button" type="button" onClick={() => setIsFormOpen(true)}>
          + {copy.add}
        </button>
      </div>

      {isFormOpen && (
        <div className="site-form-panel">
          <form onSubmit={addSite}>
            <label>
              {copy.site}
              <input value={name} onChange={(event) => setName(event.target.value)} required autoFocus />
            </label>
            <label>
              {copy.city}
              <input value={city} onChange={(event) => setCity(event.target.value)} required />
            </label>
            <div className="site-form-actions">
              {/* Correction de la traduction du bouton annuler ici */}
              <button type="button" className="site-cancel-button" onClick={() => setIsFormOpen(false)}>
                {copy.cancel}
              </button>
              <button type="submit" className="sites-add-button">
                {copy.add}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="sites-table-card">
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>{copy.loading}</div>
        ) : (
          <table className="sites-table">
            <thead>
              <tr>
                <th>{copy.site}</th>
                <th>{copy.city}</th>
                <th>{copy.departments}</th>
                <th>{copy.equipment}</th>
                <th>{copy.status}</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr key={site.id || site.name}>
                  <td className="site-name">{site.name}</td>
                  <td>{site.city}</td>
                  <td>{site.departmentsCount}</td>
                  <td>{site.equipmentCount}</td>
                  <td>
                    <span className={`site-status ${site.status === 'Actif' ? 'active' : 'maintenance'}`}>
                      {site.status === 'Actif' ? copy.active : copy.maintenance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}