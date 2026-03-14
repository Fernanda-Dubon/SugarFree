// SUGARFREE — api.js

const API_BASE = 'http://localhost:3000/api';

/**
 * Función principal para llamar al backend.
 * @param {string} endpoint  - Ruta, ej: '/pacientes'
 * @param {string} method    - GET, POST, PUT, DELETE
 * @param {object} body      - Cuerpo de la solicitud
 */
async function api(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('sf_token');

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Error ${res.status}`);
  }

  return data;
}
