// SUGARFREE — models/Glucemia.js


const mongoose = require('mongoose');

const GlucemiaSchema = new mongoose.Schema({
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
  valor:   { type: Number, required: true, min: 20, max: 700 },
  fecha:   { type: Date, default: Date.now },
  momento: {
    type: String,
    enum: ['ayunas', 'preprandial', 'postprandial', 'noche', 'otro'],
    default: 'otro'
  },
  notas:   { type: String }
}, { timestamps: true });

// Índice para consultas por paciente y fecha
GlucemiaSchema.index({ paciente: 1, fecha: -1 });

module.exports = mongoose.model('Glucemia', GlucemiaSchema);
