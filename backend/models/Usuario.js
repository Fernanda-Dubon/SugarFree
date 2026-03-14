// =========================================
// SUGARFREE — models/Usuario.js
// Modelo del Cuidador
// =========================================

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema({
  nombre:   { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  activo:   { type: Boolean, default: true }
}, { timestamps: true });

// Hash de contraseña antes de guardar
UsuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Método para comparar contraseñas
UsuarioSchema.methods.compararPassword = async function (candidata) {
  return bcrypt.compare(candidata, this.password);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);
