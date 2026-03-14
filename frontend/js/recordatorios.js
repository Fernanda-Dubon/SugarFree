// SUGARFREE — Recordatorios JS


requireAuth();
initSidebar();

const DIAS = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
const DIAS_LABEL = { lun: 'Lun', mar: 'Mar', mie: 'Mié', jue: 'Jue', vie: 'Vie', sab: 'Sáb', dom: 'Dom' };

async function cargarSelectPacientes() {
  const pacientes = await api('/pacientes');
  ['pacienteSelect', 'recPaciente'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const extra = id === 'pacienteSelect' ? '<option value="">Todos los pacientes</option>' : '<option value="">Seleccionar...</option>';
    el.innerHTML = extra;
    (pacientes || []).forEach(p => {
      el.innerHTML += `<option value="${p._id}">${p.nombre}</option>`;
    });
  });
}

async function cargarMeds() {
  const pacId = document.getElementById('recPaciente').value;
  const sel = document.getElementById('recMedicamento');
  sel.innerHTML = '<option value="">Cargando...</option>';
  if (!pacId) { sel.innerHTML = '<option value="">Primero selecciona paciente</option>'; return; }
  const meds = await api(`/medicamentos/paciente/${pacId}`);
  sel.innerHTML = '<option value="">Seleccionar medicamento...</option>';
  (meds || []).forEach(m => {
    sel.innerHTML += `<option value="${m._id}">${m.nombre} — ${m.dosis}</option>`;
  });
}

async function cargarRecordatorios() {
  const pacId = document.getElementById('pacienteSelect').value;
  const grid = document.getElementById('recordatoriosGrid');
  grid.innerHTML = '<p class="empty-state" style="grid-column:1/-1">Cargando...</p>';

  const url = pacId ? `/recordatorios/paciente/${pacId}` : '/recordatorios';
  try {
    const recs = await api(url);
    if (!recs || recs.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px">
        <p style="font-size:3rem;margin-bottom:12px">🔔</p>
        <p style="font-weight:600">Sin recordatorios configurados</p>
        <p style="color:var(--text-muted);font-size:.875rem">Agrega el primer recordatorio con el botón de arriba.</p>
      </div>`;
      return;
    }

    grid.innerHTML = recs.map(r => {
      const dias = DIAS.map(d => `
        <span class="dia-pill ${r.dias?.includes(d) ? '' : 'inactive'}">${DIAS_LABEL[d]}</span>
      `).join('');

      return `
        <div class="rec-card ${r.activo === false ? 'inactivo' : ''}">
          <div class="rec-header">
            <div class="rec-hora">⏰ ${r.hora}</div>
            <label class="rec-toggle" title="${r.activo !== false ? 'Activo' : 'Inactivo'}">
              <input type="checkbox" ${r.activo !== false ? 'checked' : ''}
                onchange="toggleRecordatorio('${r._id}', this.checked)">
              <span class="rec-toggle-slider"></span>
            </label>
          </div>
          <div class="rec-med">💊 ${r.medicamento?.nombre || 'Medicamento'}</div>
          <div class="rec-paciente">👤 ${r.paciente?.nombre || 'Paciente'} · ${r.medicamento?.dosis || ''}</div>
          <div class="rec-dias">${dias}</div>
          ${r.mensaje ? `<div class="rec-mensaje">"${r.mensaje}"</div>` : ''}
          <div class="rec-actions">
            <button class="btn btn-icon btn-sm" onclick="editarRec('${r._id}')">✏️</button>
            <button class="btn btn-icon btn-sm" onclick="eliminarRec('${r._id}')" style="color:var(--brand-red)">🗑️</button>
          </div>
        </div>
      `;
    }).join('');

    // Programar notificaciones del navegador
    programarNotificaciones(recs);
  } catch (e) {
    grid.innerHTML = `<p class="empty-state" style="grid-column:1/-1;color:var(--brand-red)">Error al cargar recordatorios.</p>`;
  }
}

async function toggleRecordatorio(id, activo) {
  try {
    await api(`/recordatorios/${id}`, 'PUT', { activo });
    showToast(activo ? 'Recordatorio activado' : 'Recordatorio desactivado', 'success');
    cargarRecordatorios();
  } catch (e) {
    showToast('Error al actualizar recordatorio', 'error');
  }
}

async function eliminarRec(id) {
  if (!confirm('¿Eliminar este recordatorio?')) return;
  await api(`/recordatorios/${id}`, 'DELETE');
  showToast('Recordatorio eliminado', 'success');
  cargarRecordatorios();
}

async function editarRec(id) {
  const r = await api(`/recordatorios/${id}`);
  document.getElementById('recId').value = r._id;
  await cargarSelectPacientes();
  document.getElementById('recPaciente').value = r.paciente?._id || r.paciente;
  await cargarMeds();
  document.getElementById('recMedicamento').value = r.medicamento?._id || r.medicamento;
  document.getElementById('recHora').value = r.hora;
  document.getElementById('recMensaje').value = r.mensaje || '';
  // Marcar días
  document.querySelectorAll('#diasSelector input[type="checkbox"]').forEach(cb => {
    cb.checked = r.dias?.includes(cb.value);
  });
  document.getElementById('modalTitle').textContent = 'Editar recordatorio';
  document.getElementById('modalOverlay').classList.add('open');
}

function abrirModal() {
  document.getElementById('recForm').reset();
  document.getElementById('recId').value = '';
  document.getElementById('modalTitle').textContent = 'Nuevo recordatorio';
  // Preseleccionar paciente
  const pac = document.getElementById('pacienteSelect')?.value;
  if (pac) {
    document.getElementById('recPaciente').value = pac;
    cargarMeds();
  }
  document.getElementById('modalOverlay').classList.add('open');
}

function cerrarModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

document.getElementById('recForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('recId').value;
  const dias = Array.from(
    document.querySelectorAll('#diasSelector input[type="checkbox"]:checked')
  ).map(cb => cb.value);

  const payload = {
    paciente:     document.getElementById('recPaciente').value,
    medicamento:  document.getElementById('recMedicamento').value,
    hora:         document.getElementById('recHora').value,
    dias,
    mensaje:      document.getElementById('recMensaje').value,
    activo:       true
  };

  try {
    if (id) {
      await api(`/recordatorios/${id}`, 'PUT', payload);
      showToast('Recordatorio actualizado', 'success');
    } else {
      await api('/recordatorios', 'POST', payload);
      showToast('Recordatorio creado', 'success');
    }
    cerrarModal();
    cargarRecordatorios();
  } catch (err) {
    showToast(err.message || 'Error al guardar', 'error');
  }
});

document.getElementById('modalOverlay')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) cerrarModal();
});

// Notificaciones del navegador
async function programarNotificaciones(recs) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') {
    await Notification.requestPermission();
  }
  if (Notification.permission !== 'granted') return;

  recs.filter(r => r.activo !== false).forEach(r => {
    const [hh, mm] = r.hora.split(':').map(Number);
    const ahora = new Date();
    const objetivo = new Date();
    objetivo.setHours(hh, mm, 0, 0);
    if (objetivo <= ahora) return; // Ya pasó hoy

    const diff = objetivo - ahora;
    setTimeout(() => {
      new Notification(`🔔 SugarFree — ${r.paciente?.nombre}`, {
        body: `${r.medicamento?.nombre} ${r.medicamento?.dosis}. ${r.mensaje || ''}`,
        icon: '/favicon.ico'
      });
    }, diff);
  });
}

(async () => {
  await cargarSelectPacientes();
  cargarRecordatorios();
})();
