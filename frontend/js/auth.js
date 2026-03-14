// SUGARFREE — auth.js


/**
 * Inicia sesión del cuidador.
 */
async function login(email, password) {
  const data = await api('/auth/login', 'POST', { email, password });
  localStorage.setItem('sf_token', data.token);
  localStorage.setItem('sf_user', JSON.stringify(data.usuario));
  return data;
}

/**
 * Registra un nuevo cuidador.
 */
async function register(nombre, email, password) {
  const data = await api('/auth/register', 'POST', { nombre, email, password });
  localStorage.setItem('sf_token', data.token);
  localStorage.setItem('sf_user', JSON.stringify(data.usuario));
  return data;
}

/**
 * Cierra sesión y redirige al login.
 */
function logout() {
  localStorage.removeItem('sf_token');
  localStorage.removeItem('sf_user');
  window.location.href = getLoginPath();
}

/**
 * Obtiene los datos del usuario en sesión.
 */
function getUser() {
  try {
    return JSON.parse(localStorage.getItem('sf_user'));
  } catch {
    return null;
  }
}

/**
 * Redirige al login si no hay sesión activa.
 */
function requireAuth() {
  const token = localStorage.getItem('sf_token');
  if (!token) {
    window.location.href = getLoginPath();
  }
}

/**
 * Calcula la ruta al login según la profundidad de la página actual.
 */
function getLoginPath() {
  // Si estamos en pages/ necesitamos subir un nivel
  if (window.location.pathname.includes('/pages/')) {
    return '../index.html';
  }
  return 'index.html';
}

/**
 * Inicializa el sidebar con los datos del usuario.
 * Llamar en cada página que tenga sidebar.
 */
function initSidebar() {
  const user = getUser();
  if (!user) return;

  const nameEl = document.getElementById('sidebarName');
  const avatarEl = document.getElementById('sidebarAvatar');

  if (nameEl) nameEl.textContent = user.nombre;
  if (avatarEl) avatarEl.textContent = user.nombre?.charAt(0)?.toUpperCase() || 'C';
}
