import { BrowserRouter, Routes, Route } from 'react-router-dom'; // outils de navigation
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // gère le cache des données API
import { EquipmentListPage } from './features/equipment/EquipmentListPage'; // notre page créée avant

const queryClient = new QueryClient(); // créé une seule fois pour toute l'application

function App() {
  return (
    <QueryClientProvider client={queryClient}> {/* active react-query pour toute l'app */}
      <BrowserRouter> {/* active la navigation par URL */}
        <Routes>
          <Route path="/equipment" element={<EquipmentListPage />} /> {/* /equipment affiche notre page */}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;