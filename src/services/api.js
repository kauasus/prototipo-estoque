// src/services/api.js

const API_URL = 'http://localhost/api-login';

/**
 * Função genérica para chamadas à API
 * @param {string} endpoint - ex: 'login.php', 'medicos.php'
 * @param {object} options - fetch options
 */
export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : null
  });

  // Se der erro HTTP
  if (!response.ok) {
    throw new Error(`Erro HTTP: ${response.status}`);
  }

  return response.json();
}

/* ===============================
   FUNÇÕES ESPECÍFICAS DO SISTEMA
   =============================== */

/* LOGIN */
export function login(username, password) {
  return apiFetch('login.php', {
    method: 'POST',
    body: { username, password }
  });
}

/* MÉDICOS */
export function getMedicos() {
  return apiFetch('medicos.php');
}

/* PACIENTES */
export function getPacientes() {
  return apiFetch('pacientes.php');
}

/* AGENDAR CONSULTA */
export function criarAgendamento(dados) {
  return apiFetch('agendamentos.php', {
    method: 'POST',
    body: dados
  });
}

/* FINANCEIRO */
export function getFinanceiro() {
  return apiFetch('financeiro.php');
}

/* LOGOUT */
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('logged');
}
