import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';

export interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Admin' | 'ResponsableMaintenance' | 'Technicien' | 'Demandeur';
  isActive: boolean;
  createdAt?: string;
}

const ROLE_LABELS: Record<UserItem['role'], string> = {
  Admin: 'Administrateur',
  ResponsableMaintenance: 'Responsable Maintenance',
  Technicien: 'Technicien',
  Demandeur: 'Demandeur / Utilisateur',
};

const ROLE_BADGES: Record<UserItem['role'], string> = {
  Admin: 'bg-purple-100 text-purple-800 border-purple-200',
  ResponsableMaintenance: 'bg-blue-100 text-blue-800 border-blue-200',
  Technicien: 'bg-green-100 text-green-800 border-green-200',
  Demandeur: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  // Modal Création
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Technicien' as UserItem['role'],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Charger la liste des utilisateurs
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrage local des utilisateurs
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        `${user.firstName} ${user.lastName} ${user.email}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRole]);

  // Création d'un utilisateur
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      await api.post('/users', formData);
      setIsCreateModalOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'Technicien',
      });
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Erreur lors de la création de l\'utilisateur.');
    } finally {
      setSubmitting(false);
    }
  };

  // Basculer l'état Actif/Inactif
  const handleToggleStatus = async (user: UserItem) => {
    try {
      await api.patch(`/users/${user.id}/status`, { isActive: !user.isActive });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
      );
    } catch (err: any) {
      alert('Impossible de modifier le statut de cet utilisateur.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-sm text-gray-500">
            Gérez les comptes, les rôles et les accès à la plateforme COPAG EMS.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition shadow-sm self-start md:self-auto"
        >
          + Ajouter un Utilisateur
        </button>
      </div>

      {/* Barre de filtres et recherche */}
      <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tous les rôles</option>
            <option value="Admin">Administrateurs</option>
            <option value="ResponsableMaintenance">Responsables Maintenance</option>
            <option value="Technicien">Techniciens</option>
            <option value="Demandeur">Demandeurs</option>
          </select>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md">
          {error}
        </div>
      )}

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement des utilisateurs...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucun utilisateur ne correspond à vos critères de recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-gray-600 font-semibold">
                <tr>
                  <th className="px-6 py-3">Utilisateur</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Rôle</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-semibold border rounded-full ${
                          ROLE_BADGES[u.role]
                        }`}
                      >
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full font-medium ${
                          u.isActive
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                        {u.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`text-xs font-medium px-2.5 py-1 rounded border transition ${
                          u.isActive
                            ? 'text-red-600 hover:bg-red-50 border-red-200'
                            : 'text-green-600 hover:bg-green-50 border-green-200'
                        }`}
                      >
                        {u.isActive ? 'Désactiver' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de création d'utilisateur */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2">
              Ajouter un Nouvel Utilisateur
            </h2>

            {formError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded text-sm focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded text-sm focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded text-sm focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mot de passe *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded text-sm focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rôle *</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as UserItem['role'] })
                  }
                  className="w-full px-3 py-1.5 border rounded text-sm bg-white focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Demandeur">Demandeur / Utilisateur</option>
                  <option value="Technicien">Technicien</option>
                  <option value="ResponsableMaintenance">Responsable Maintenance</option>
                  <option value="Admin">Administrateur</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border text-gray-600 rounded text-sm hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}