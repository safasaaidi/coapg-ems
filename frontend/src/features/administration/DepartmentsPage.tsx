import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { Language } from '../../shared/components/Layout';
import './DepartmentsPage.css';

export interface Department {
  id?: string | number;
  name: string;
  site: string;
  manager: string;
  equipmentCount: number;
}

const COPY = {
  FR: { title: 'Départements', subtitle: 'Organisez les équipes et les équipements', add: 'Ajouter un département', department: 'Département', site: 'Site', manager: 'Responsable', equipment: 'Équipements', cancel: 'Annuler', loading: 'Chargement...', error: 'Erreur lors du chargement des départements.' },
  EN: { title: 'Departments', subtitle: 'Organize teams and equipment', add: 'Add department', department: 'Department', site: 'Site', manager: 'Manager', equipment: 'Equipment', cancel: 'Cancel', loading: 'Loading...', error: 'Error loading departments.' },
  AR: { title: 'الأقسام', subtitle: 'تنظيم الفرق والمعدات', add: 'إضافة قسم', department: 'القسم', site: 'الموقع', manager: 'المسؤول', equipment: 'المعدات', cancel: 'إلغاء', loading: 'جاري التحميل...', error: 'خطأ في تحميل الأقسام.' },
} as const;

export function DepartmentsPage({ language }: { language: Language }) {
  const copy = COPY[language];
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [site, setSite] = useState('');
  const [loading, setLoading] = useState(true);

  // Charger la liste des départements depuis le backend API
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/departments');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDepartments(data);
    } catch {
      // Fallback de secours si l'API n'est pas encore connectée
      setDepartments([
        { id: 1, name: 'Agriculture', site: 'Ferme Nord', manager: 'Youssef Alami', equipmentCount: 18 },
        { id: 2, name: 'Production', site: 'Laiterie Centrale', manager: 'Hassan Mehdi', equipmentCount: 31 },
        { id: 3, name: 'Conditionnement', site: 'Usine Biadna', manager: 'Karim Tazi', equipmentCount: 12 },
        { id: 4, name: 'Maintenance', site: 'Ferme Est', manager: 'Nadia Amrani', equipmentCount: 9 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  async function addDepartment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !site.trim()) return;

    const newDeptPayload = { name: name.trim(), site: site.trim(), manager: '-', equipmentCount: 0 };

    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeptPayload),
      });

      if (res.ok) {
        const createdDept = await res.json();
        setDepartments((current) => [...current, createdDept]);
      } else {
        setDepartments((current) => [...current, { ...newDeptPayload, id: Date.now() }]);
      }
    } catch {
      setDepartments((current) => [...current, { ...newDeptPayload, id: Date.now() }]);
    }

    setName('');
    setSite('');
    setIsFormOpen(false);
  }

  return (
    <div className="departments-page" dir={language === 'AR' ? 'rtl' : 'ltr'}>
      <div className="departments-header">
        <div>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
        <button className="departments-add-button" type="button" onClick={() => setIsFormOpen(true)}>
          + {copy.add}
        </button>
      </div>

      {isFormOpen && (
        <div className="department-form-panel">
          <form onSubmit={addDepartment}>
            <label>
              {copy.department}
              <input value={name} onChange={(event) => setName(event.target.value)} required autoFocus />
            </label>
            <label>
              {copy.site}
              <input value={site} onChange={(event) => setSite(event.target.value)} required />
            </label>
            <div className="department-form-actions">
              <button type="button" className="department-cancel-button" onClick={() => setIsFormOpen(false)}>
                {copy.cancel}
              </button>
              <button type="submit" className="departments-add-button">
                {copy.add}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="departments-table-card">
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>{copy.loading}</div>
        ) : (
          <table className="departments-table">
            <thead>
              <tr>
                <th>{copy.department}</th>
                <th>{copy.site}</th>
                <th>{copy.manager}</th>
                <th>{copy.equipment}</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => (
                <tr key={department.id || `${department.name}-${department.site}`}>
                  <td className="department-name">{department.name}</td>
                  <td>{department.site}</td>
                  <td>{department.manager}</td>
                  <td>{department.equipmentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}