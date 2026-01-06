import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Agendamentos from './pages/Agendamentos';
import Layout from './layout/Layout';
import Financeiro from './pages/Financeiro';

function PrivateRoute({ children }) {
  const isLogged = localStorage.getItem('logged') === 'true';

  return isLogged
    ? children
    : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>

      {/* LOGIN */}
      <Route path="/" element={<Login />} />

      {/* ROTAS PROTEGIDAS */}
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/agendamentos" element={<Agendamentos />} />
      </Route>

    </Routes>
  );
}
