// SUGARFREE — Medicamentos JS

requireAuth();
initSidebar();

async function cargarSelectPacientes() {
  const pacientes = await api('/pacientes');
  ['pacienteSelect', 'medPaciente'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = `<option value="">Seleccionar...</option>`;
    (pacientes || []).forEach(p => {
      el.innerHTML += `<option value="${p._id}">${p.nombre}</option>`;
    });
  });
}

async function cargarMedicamentos() {
  const pacId = document.getElementById('pacienteSelect')?.value;
  const tbody = document.getElementById('medicamentosBody');
  if (!pacId) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:24px">Selecciona un paciente.</td></tr>`;
    return;
  }

  try {
    const meds = await api(`/medicamentos/paciente/${pacId}`);
    if (!meds || meds.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:24px">Sin medicamentos registrados para este paciente.</td></tr>`;
      return;
    }
    tbody.innerHTML = meds.map(m => `
      <tr>
        <td>
          <span class="med-nombre">💊 ${m.nombre}</span>
        </td>
        <td style="max-width:200px;font-size:.82rem;color:var(--text-secondary)">${m.descripcion || '—'}</td>
        <td><span class="med-dosis-badge">${m.dosis}</span></td>
        <td><span class="frecuencia-label">${frecuenciaLabel(m.frecuencia)}</span></td>
        <td style="font-size:.82rem">${viaLabel(m.via)}</td>
        <td>
          ${m.activo !== false
            ? `<span class="badge badge-green">✓ Activo</span>`
            : `<span class="badge badge-red">✕ Inactivo</span>`
          }
        </td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn btn-icon btn-sm" onclick="editarMed('${m._id}')" title="Editar">✏️</button>
            <button class="btn btn-icon btn-sm" onclick="eliminarMed('${m._id}')" title="Eliminar" style="color:var(--brand-red)">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--brand-red)">Error al cargar medicamentos.</td></tr>`;
  }
}

function frecuenciaLabel(f) {
  const map = {
    diario: '1 vez al día', '2xdia': '2 veces al día',
    '3xdia': '3 veces al día', semanal: 'Semanal',
    concomida: 'Con cada comida', otra: 'Otra'
  };
  return map[f] || f;
}

function viaLabel(v) {
  const map = {
    oral: '💊 Oral', subcutanea: '💉 Subcutánea',
    inhalada: '🌬️ Inhalada', topica: '🖐 Tópica'
  };
  return map[v] || v;
}

function abrirModal() {
  document.getElementById('medForm').reset();
  document.getElementById('medId').value = '';
  document.getElementById('modalTitle').textContent = 'Agregar medicamento';
  // Pre-seleccionar paciente activo
  const pac = document.getElementById('pacienteSelect')?.value;
  if (pac) document.getElementById('medPaciente').value = pac;
  document.getElementById('medInicio').value = new Date().toISOString().split('T')[0];
  document.getElementById('modalOverlay').classList.add('open');
}

function cerrarModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

async function editarMed(id) {
  const m = await api(`/medicamentos/${id}`);
  document.getElementById('medId').value = m._id;
  document.getElementById('medPaciente').value = m.paciente;
  document.getElementById('medNombre').value = m.nombre;
  document.getElementById('medDosis').value = m.dosis;
  document.getElementById('medDescripcion').value = m.descripcion || '';
  document.getElementById('medFrecuencia').value = m.frecuencia;
  document.getElementById('medVia').value = m.via;
  document.getElementById('medInicio').value = m.fechaInicio?.split('T')[0] || '';
  document.getElementById('medFin').value = m.fechaFin?.split('T')[0] || '';
  document.getElementById('medNotas').value = m.notas || '';
  document.getElementById('modalTitle').textContent = 'Editar medicamento';
  document.getElementById('modalOverlay').classList.add('open');
}

async function eliminarMed(id) {
  if (!confirm('¿Eliminar este medicamento?')) return;
  await api(`/medicamentos/${id}`, 'DELETE');
  showToast('Medicamento eliminado', 'success');
  cargarMedicamentos();
}

document.getElementById('medForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('medId').value;
  const payload = {
    paciente:     document.getElementById('medPaciente').value,
    nombre:       document.getElementById('medNombre').value,
    dosis:        document.getElementById('medDosis').value,
    descripcion:  document.getElementById('medDescripcion').value,
    frecuencia:   document.getElementById('medFrecuencia').value,
    via:          document.getElementById('medVia').value,
    fechaInicio:  document.getElementById('medInicio').value,
    fechaFin:     document.getElementById('medFin').value || null,
    notas:        document.getElementById('medNotas').value
  };

  try {
    if (id) {
      await api(`/medicamentos/${id}`, 'PUT', payload);
      showToast('Medicamento actualizado', 'success');
    } else {
      await api('/medicamentos', 'POST', payload);
      showToast('Medicamento registrado', 'success');
    }
    cerrarModal();
    cargarMedicamentos();
  } catch (err) {
    showToast(err.message || 'Error al guardar', 'error');
  }
});

document.getElementById('modalOverlay')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) cerrarModal();
});

(async () => {
  await cargarSelectPacientes();
})();
