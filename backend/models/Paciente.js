// =========================================
// SUGARFREE — models/Paciente.js
// =========================================

const mongoose = require('mongoose');

const PacienteSchema = new mongoose.Schema({
  cuidador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  nombre:       { type: String, required: true, trim: true },
  edad:         { type: Number, required: true },
  tipoDiabetes: {
    type: String,
    enum: ['tipo1', 'tipo2', 'gestacional', 'prediabetes'],
    required: true
  },
  peso:         { type: Number },
  glucemiaRango: {
    min: { type: Number, default: 70 },
    max: { type: Number, default: 180 }
  },
  alergias:    { type: String },
  condiciones: { type: String },
  notas:       { type: String },
  activo:      { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Paciente', PacienteSchema);
