import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface EquipmentType {
  id: string;
  code: string;
  label: string;
  description?: string;
}

export function EquipmentTypesPage({ language }: { language: 'FR' | 'AR' | 'EN' }) {
  const [types, setTypes] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [labelInput, setLabelInput] = useState('');
  const [codeInput, setCodeInput] = useState('');

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/equipment-types');
      setTypes(res.data);
    } catch {
      // Données de secours / Fallback
      setTypes([
        { id: '1', code: 'POMP', label: 'Pompes & Hydraulique', description: 'Pompes de transfert et surpresseurs' },
        { id: '2', code: 'MOT', label: 'Moteurs Électriques', description: 'Moteurs asynchrones et variateurs' },
        { id: '3', code: 'CPT', label: 'Capteurs & Mesure', description: 'Capteurs de pression, température, débit' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labelInput || !codeInput) return;

    try {
      await api.post('/equipment-types', { code: codeInput, label: labelInput });
      setCodeInput('');
      setLabelInput('');
      fetchTypes();
    } catch {
      alert("Erreur lors de la création du type d'équipement.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Types d'Équipements</h1>
        <p className="text-sm text-gray-500">Gérez les catégories et classifications des équipements COPAG.</p>
      </div>

      <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg border shadow-sm flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Code (ex: MOT)"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm w-full md:w-32"
          required
        />
        <input
          type="text"
          placeholder="Libellé du type (ex: Moteurs Électriques)"
          value={labelInput}
          onChange={(e) => setLabelInput(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm flex-1"
          required
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
          + Ajouter
        </button>
      </form>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Chargement...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b text-gray-600 font-semibold">
              <tr>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Libellé</th>
                <th className="px-6 py-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {types.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{t.code}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{t.label}</td>
                  <td className="px-6 py-4 text-gray-500">{t.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}