// =========================================
// SUGARFREE — models/Medicamento.js
// =========================================

const mongoose = require('mongoose');

const MedicamentoSchema = new mongoose.Schema({
  paciente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: true
  },
  cuidador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  nombre:      { type: String, required: true, trim: true },
  descripcion: { type: String },
  dosis:       { type: String, required: true },
  frecuencia:  {
    type: String,
    enum: ['diario', '2xdia', '3xdia', 'semanal', 'concomida', 'otra'],
    default: 'diario'
  },
  via: {
    type: String,
    enum: ['oral', 'subcutanea', 'inhalada', 'topica'],
    default: 'oral'
  },
  fechaInicio: { type: Date, default: Date.now },
  fechaFin:    { type: Date },
  notas:       { type: String },
  activo:      { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Medicamento', MedicamentoSchema);
