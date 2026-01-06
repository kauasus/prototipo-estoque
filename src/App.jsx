import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';
import Agendamentos from './pages/Agendamentos';
import Pacientes from './pages/Pacientes';
import Financeiro from './pages/Financeiro';
import Prontuario from './pages/Prontuario';
import Anamnese from './pages/Anamnese';
import Convenios from './pages/Convenios'
import Funcionarios from './pages/Funcionarios'

import Layout from './layout/Layout';

function PrivateRoute({ children }) {
  const isLogged = localStorage.getItem('logged') === 'true';
  return isLogged ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>

      <Route path="/" element={<Login />} />

      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/agendamentos" element={<Agendamentos />} />
        <Route path="/pacientes" element={<Pacientes />} />
        <Route path="/financeiro" element={<Financeiro />} />
        <Route path="/prontuario" element={<Prontuario />} />
        <Route path="/anamnese" element={<Anamnese />} />
        <Route path="/convenios" element={<Convenios />} />
        <Route path="/funcionarios" element={<Funcionarios />} />

      </Route>

      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}
