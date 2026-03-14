// SUGARFREE — Glucemia JS


requireAuth();
initSidebar();

let pacienteActivo = null;

// Cargar select de pacientes en todos los controles
async function cargarSelectPacientes() {
  try {
    const pacientes = await api('/pacientes');
    const selects = ['pacienteSelect', 'glucPaciente'];
    selects.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const current = el.value;
      el.innerHTML = `<option value="">Seleccionar paciente...</option>`;
      (pacientes || []).forEach(p => {
        const opt = document.createElement('option');
        opt.value = p._id;
        opt.textContent = p.nombre;
        opt.dataset.min = p.glucemiaRango?.min || 70;
        opt.dataset.max = p.glucemiaRango?.max || 180;
        el.appendChild(opt);
      });
      if (current) el.value = current;
    });
  } catch (e) {
    console.warn('Error cargando pacientes:', e);
  }
}

// Cargar historial y renderizar linea de tiempo
async function cargarHistorial() {
  const selectEl = document.getElementById('pacienteSelect');
  const pacId = selectEl?.value;
  if (!pacId) {
    document.getElementById('timelineCard').style.display = 'none';
    document.getElementById('statsGluc').style.display = 'none';
    return;
  }

  // Obtener rango del paciente
  const opt = selectEl.options[selectEl.selectedIndex];
  pacienteActivo = { min: +opt.dataset.min || 70, max: +opt.dataset.max || 180 };

  const desde = document.getElementById('fechaDesde')?.value;
  const hasta = document.getElementById('fechaHasta')?.value;

  let url = `/glucemia/paciente/${pacId}`;
  const params = [];
  if (desde) params.push(`desde=${desde}`);
  if (hasta) params.push(`hasta=${hasta}`);
  if (params.length) url += `?${params.join('&')}`;

  try {
    const registros = await api(url);
    renderTimeline(registros || []);
    renderStats(registros || []);
    document.getElementById('timelineCard').style.display = 'block';
    document.getElementById('statsGluc').style.display = 'grid';
  } catch (e) {
    showToast('Error al cargar historial', 'error');
  }
}

// Renderizar la línea de tiempo agrupada por día
function renderTimeline(registros) {
  const timeline = document.getElementById('timeline');
  const alertas = document.getElementById('zonaAlertas');

  if (registros.length === 0) {
    timeline.innerHTML = `<p class="empty-state">Sin registros en el período seleccionado.</p>`;
    alertas.innerHTML = '';
    return;
  }

  // Detectar alertas (últimos registros fuera de rango)
  const recientes = registros.slice(0, 3);
  const alertasHTML = recientes
    .filter(r => r.valor < pacienteActivo.min || r.valor > pacienteActivo.max)
    .map(r => {
      const st = glucoseStatus(r.valor, pacienteActivo);
      return `
        <div class="alert-banner ${st.key}">
          <span class="alert-icon">${st.icon}</span>
          <div>
            <strong>${st.alertTitle} — ${r.valor} mg/dL</strong>
            <p>${st.alertMsg} Registrado ${formatTime(r.fecha)}.</p>
          </div>
        </div>
      `;
    }).join('');
  alertas.innerHTML = alertasHTML;

  // Agrupar por fecha
  const grupos = {};
  registros.forEach(r => {
    const d = new Date(r.fecha);
    const key = d.toLocaleDateString('es-HN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(r);
  });

  timeline.innerHTML = Object.entries(grupos).map(([fecha, items]) => `
    <div class="timeline-date-group">
      <div class="timeline-date-label">📅 ${capitalize(fecha)}</div>
      ${items.map(r => renderEntry(r)).join('')}
    </div>
  `).join('');
}

// Renderizar una entrada de timeline
function renderEntry(r) {
  const st = glucoseStatus(r.valor, pacienteActivo);
  const hora = new Date(r.fecha).toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' });
  return `
    <div class="timeline-entry">
      <div class="timeline-dot ${st.key}"></div>
      <div class="timeline-card status-${st.key}">
        <div class="tc-header">
          <span class="tc-valor ${st.key}">${r.valor} <small style="font-size:.6em;font-weight:500">mg/dL</small></span>
          <div class="tc-right">
            <span class="badge badge-${st.badgeColor}">${st.icon} ${st.label}</span>
            <span class="tc-hora">🕐 ${hora}</span>
          </div>
        </div>
        <div class="tc-body">
          ${r.momento ? `<span class="tc-momento">${momentoLabel(r.momento)}</span>` : ''}
          ${r.notas ? `<span class="tc-notas">"${r.notas}"</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

// Calcular estadísticas del día
function renderStats(registros) {
  if (!registros.length) return;
  const valores = registros.map(r => r.valor);
  const promedio = Math.round(valores.reduce((a, b) => a + b, 0) / valores.length);
  const min = Math.min(...valores);
  const max = Math.max(...valores);

  document.getElementById('statPromedio').textContent = promedio;
  document.getElementById('statMin').textContent = min;
  document.getElementById('statMax').textContent = max;
  document.getElementById('statTotal').textContent = registros.length;
}

// Preview en tiempo real al escribir el valor
document.getElementById('glucValor')?.addEventListener('input', function () {
  const val = +this.value;
  if (!val) { document.getElementById('glucPreview').innerHTML = ''; return; }

  // Obtener rango del paciente seleccionado 
  const sel = document.getElementById('glucPaciente');
  const opt = sel?.options[sel.selectedIndex];
  const rango = opt ? { min: +opt.dataset.min || 70, max: +opt.dataset.max || 180 } : { min: 70, max: 180 };
  const st = glucoseStatus(val, rango);

  document.getElementById('glucPreview').innerHTML = `
    <div class="preview-result ${st.key}">
      ${st.icon} ${st.label} — ${st.alertMsg || 'Valor dentro del rango esperado.'}
    </div>
  `;
});

// Abrir/cerrar modal
function abrirModalGluc() {
  const now = new Date();
  document.getElementById('glucFecha').value = now.toISOString().split('T')[0];
  document.getElementById('glucHora').value = now.toTimeString().slice(0, 5);
  // Preseleccionar paciente si ya hay uno elegido
  const sel = document.getElementById('pacienteSelect');
  if (sel?.value) document.getElementById('glucPaciente').value = sel.value;
  document.getElementById('modalGluc').classList.add('open');
}

function cerrarModalGluc() {
  document.getElementById('modalGluc').classList.remove('open');
  document.getElementById('glucForm').reset();
  document.getElementById('glucPreview').innerHTML = '';
}

document.getElementById('modalGluc')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) cerrarModalGluc();
});

// Guardar lectura
document.getElementById('glucForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const pacId = document.getElementById('glucPaciente').value;
  const valor = +document.getElementById('glucValor').value;
  const fecha = document.getElementById('glucFecha').value;
  const hora  = document.getElementById('glucHora').value;
  const momento = document.getElementById('glucMomento').value;
  const notas = document.getElementById('glucNotas').value;

  const fechaCompleta = new Date(`${fecha}T${hora}:00`).toISOString();

  try {
    await api('/glucemia', 'POST', {
      paciente: pacId,
      valor,
      fecha: fechaCompleta,
      momento,
      notas
    });
    showToast('Lectura registrada correctamente ✓', 'success');
    cerrarModalGluc();
    // Actualizar el select del historial
    document.getElementById('pacienteSelect').value = pacId;
    cargarHistorial();
  } catch (err) {
    showToast(err.message || 'Error al guardar la lectura', 'error');
  }
});

function limpiarFiltros() {
  document.getElementById('fechaDesde').value = '';
  document.getElementById('fechaHasta').value = '';
  cargarHistorial();
}

function momentoLabel(m) {
  const map = {
    ayunas: '🌅 Ayunas',
    preprandial: '🍽️ Antes de comer',
    postprandial: '🍴 Después de comer',
    noche: '🌙 Antes de dormir',
    otro: '⏱ Otro momento'
  };
  return map[m] || m;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Inicializar
(async () => {
  await cargarSelectPacientes();
  // Prellenar fechas: última semana
  const hoy = new Date();
  const semana = new Date(hoy);
  semana.setDate(hoy.getDate() - 7);
  document.getElementById('fechaHasta').value = hoy.toISOString().split('T')[0];
  document.getElementById('fechaDesde').value = semana.toISOString().split('T')[0];
})();
