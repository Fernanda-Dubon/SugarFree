// =========================================
// SUGARFREE — models/Recordatorio.js
// =========================================

const mongoose = require('mongoose');

const RecordatorioSchema = new mongoose.Schema({
  paciente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: true
  },
  medicamento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicamento',
    required: true
  },
  cuidador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  hora:    { type: String, required: true },   // Formato "HH:MM"
  dias:    {
    type: [String],
    enum: ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'],
    default: ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom']
  },
  mensaje: { type: String },
  activo:  { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Recordatorio', RecordatorioSchema);
