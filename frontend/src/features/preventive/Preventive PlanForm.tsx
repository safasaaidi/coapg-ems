import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schéma de validation Zod du formulaire
const preventivePlanSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  equipmentId: z.string().uuid('Veuillez sélectionner un équipement valide'),
  frequencyDays: z.coerce.number().min(1, 'La fréquence doit être d\'au moins 1 jour'),
  nextDueDate: z.string().min(1, 'Veuillez sélectionner la date de première échéance'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
});

type PreventivePlanFormData = z.infer<typeof preventivePlanSchema>;

interface EquipmentOption {
  id: string;
  name: string;
  code?: string;
}

interface PreventivePlanFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PreventivePlanForm: React.FC<PreventivePlanFormProps> = ({ onSuccess, onCancel }) => {
  const [equipments, setEquipments] = useState<EquipmentOption[]>([]);
  const [loadingEquipments, setLoadingEquipments] = useState<boolean>(true);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PreventivePlanFormData>({
    resolver: zodResolver(preventivePlanSchema),
    defaultValues: {
      priority: 'Medium',
      frequencyDays: 30,
    },
  });

  // Chargement de la liste des équipements pour le select
  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/equipments', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setEquipments(data);
        } else {
          setServerError('Impossible de charger la liste des équipements.');
        }
      } catch (err) {
        setServerError('Erreur réseau lors du chargement des équipements.');
      } finally {
        setLoadingEquipments(false);
      }
    };

    fetchEquipments();
  }, []);

  const onSubmit = async (data: PreventivePlanFormData) => {
    setServerError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/preventive-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création du plan préventif.');
      }

      reset();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setServerError(err.message || 'Une erreur est survenue.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">
        Créer un Plan de Maintenance Préventive
      </h2>

      {serverError && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
          {serverError}
        </div>
      )}

      {/* Titre du plan */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Titre du plan *</label>
        <input
          type="text"
          {...register('title')}
          placeholder="Ex: Vidange et contrôle mensuel des filtres"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>

      {/* Équipement concerné */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Équipement concerné *</label>
        <select
          {...register('equipmentId')}
          disabled={loadingEquipments}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white"
        >
          <option value="">-- Sélectionner un équipement --</option>
          {equipments.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.name} {eq.code ? `(${eq.code})` : ''}
            </option>
          ))}
        </select>
        {errors.equipmentId && <p className="text-red-500 text-xs mt-1">{errors.equipmentId.message}</p>}
      </div>

      {/* Fréquence en jours & Date de première échéance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Fréquence (en jours) *</label>
          <input
            type="number"
            {...register('frequencyDays')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
          />
          {errors.frequencyDays && <p className="text-red-500 text-xs mt-1">{errors.frequencyDays.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Première échéance *</label>
          <input
            type="date"
            {...register('nextDueDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
          />
          {errors.nextDueDate && <p className="text-red-500 text-xs mt-1">{errors.nextDueDate.message}</p>}
        </div>
      </div>

      {/* Priorité */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Priorité *</label>
        <select
          {...register('priority')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white"
        >
          <option value="Low">Basse</option>
          <option value="Medium">Moyenne</option>
          <option value="High">Haute</option>
          <option value="Critical">Critique</option>
        </select>
        {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority.message}</p>}
      </div>

      {/* Description / Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Description / Gamme opératoire</label>
        <textarea
          rows={3}
          {...register('description')}
          placeholder="Détails des tâches préventives à réaliser..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
        />
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Enregistrement...' : 'Créer le plan'}
        </button>
      </div>
    </form>
  );
};