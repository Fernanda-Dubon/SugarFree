// =========================================
// SUGARFREE — routes/auth.js
// Rutas de autenticación
// =========================================

const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// ── Generar JWT ──
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ message: 'Ya existe una cuenta con ese correo.' });
    }

    const usuario = await Usuario.create({ nombre, email, password });

    res.status(201).json({
      token: generarToken(usuario._id),
      usuario: {
        _id:    usuario._id,
        nombre: usuario.nombre,
        email:  usuario.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    const correcto = await usuario.compararPassword(password);
    if (!correcto) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    res.json({
      token: generarToken(usuario._id),
      usuario: {
        _id:    usuario._id,
        nombre: usuario.nombre,
        email:  usuario.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
