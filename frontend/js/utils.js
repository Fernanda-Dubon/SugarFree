// SUGARFREE — utils.js
// Funciones de utilidad compartidas


/**
 * Determina el estado de glucemia y retorna
 * label, color, icono y mensajes de alerta.
 * El rango puede ser global o del paciente.
 *
 * @param {number} valor  - mg/dL
 * @param {object} rango  - { min, max } del paciente
 */
function glucoseStatus(valor, rango = { min: 70, max: 180 }) {
  if (valor < 54) {
    return {
      key: 'danger',
      label: 'Hipoglucemia grave',
      badgeColor: 'red',
      color: 'red',
      icon: '🆘',
      alertTitle: 'Hipoglucemia grave',
      alertMsg: 'Glucosa críticamente baja. Actúa de inmediato: 15g de carbohidratos y llama al médico.'
    };
  }
  if (valor < rango.min) {
    return {
      key: 'low',
      label: 'Glucosa baja',
      badgeColor: 'blue',
      color: 'blue',
      icon: '⬇️',
      alertTitle: 'Glucosa por debajo del rango',
      alertMsg: 'El valor está por debajo del rango objetivo. Administra un snack de 15g de carbohidratos.'
    };
  }
  if (valor <= rango.max) {
    return {
      key: 'normal',
      label: 'En rango',
      badgeColor: 'green',
      color: 'green',
      icon: '✅',
      alertTitle: null,
      alertMsg: 'Valor dentro del rango objetivo.'
    };
  }
  if (valor <= 250) {
    return {
      key: 'high',
      label: 'Glucosa alta',
      badgeColor: 'amber',
      color: 'amber',
      icon: '⬆️',
      alertTitle: 'Glucosa sobre el rango',
      alertMsg: 'El valor supera el rango objetivo. Revisa la dieta reciente y la medicación.'
    };
  }
  return {
    key: 'danger',
    label: 'Hiperglucemia',
    badgeColor: 'red',
    color: 'red',
    icon: '🚨',
    alertTitle: 'Hiperglucemia severa',
    alertMsg: 'Glucosa críticamente alta. Verifica cetosis y contacta al médico de inmediato.'
  };
}

/**
 * Formatea una fecha ISO a hora legible.
 * @param {string} isoDate
 */
function formatTime(isoDate) {
  return new Date(isoDate).toLocaleTimeString('es-HN', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formatea una fecha ISO a fecha + hora legible.
 */
function formatDateTime(isoDate) {
  return new Date(isoDate).toLocaleString('es-HN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Muestra un toast de notificación.
 * @param {string} msg     - Mensaje
 * @param {string} type    - 'success' | 'error' | 'warning'
 * @param {number} duration - ms (default 3500)
 */
function showToast(msg, type = 'success', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✅', error: '❌', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '💬'}</span> ${msg}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all .3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
