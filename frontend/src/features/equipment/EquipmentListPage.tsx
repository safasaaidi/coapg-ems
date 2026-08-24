import { useEquipmentList } from './useEquipmentList'; // on récupère notre hook créé avant

export function EquipmentListPage() {
  const { data, isLoading, error } = useEquipmentList(); // on utilise le hook : data=résultat, isLoading=en cours, error=si échec

  if (isLoading) return <p>Chargement...</p>;       // affiché pendant que ça charge
  if (error) return <p>Erreur de chargement.</p>;   // affiché si l'appel API échoue

  return (
    <div>
      <h1>Liste des équipements</h1>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Nom</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {data.map((equipment: any) => (
            <tr key={equipment.id}>
              <td>{equipment.code}</td>
              <td>{equipment.name}</td>
              <td>{equipment.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
