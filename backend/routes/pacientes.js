// =========================================
// SUGARFREE — routes/pacientes.js
// CRUD de pacientes del cuidador
// =========================================

const express  = require('express');
const router   = express.Router();
const Paciente = require('../models/Paciente');
const { protect } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

// GET /api/pacientes  — Listar pacientes del cuidador autenticado
router.get('/', async (req, res) => {
  try {
    const pacientes = await Paciente.find({ cuidador: req.userId, activo: true })
      .sort({ nombre: 1 });
    res.json(pacientes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/pacientes/:id
router.get('/:id', async (req, res) => {
  try {
    const paciente = await Paciente.findOne({
      _id: req.params.id,
      cuidador: req.userId
    });
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado.' });
    res.json(paciente);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/pacientes  — Crear paciente
router.post('/', async (req, res) => {
  try {
    // Máximo 10 pacientes por cuidador (ajustable)
    const total = await Paciente.countDocuments({ cuidador: req.userId, activo: true });
    if (total >= 10) {
      return res.status(400).json({ message: 'Límite máximo de 10 pacientes alcanzado.' });
    }

    const paciente = await Paciente.create({
      ...req.body,
      cuidador: req.userId
    });
    res.status(201).json(paciente);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/pacientes/:id  — Actualizar paciente
router.put('/:id', async (req, res) => {
  try {
    const paciente = await Paciente.findOneAndUpdate(
      { _id: req.params.id, cuidador: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado.' });
    res.json(paciente);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/pacientes/:id  — Borrado lógico
router.delete('/:id', async (req, res) => {
  try {
    const paciente = await Paciente.findOneAndUpdate(
      { _id: req.params.id, cuidador: req.userId },
      { activo: false },
      { new: true }
    );
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado.' });
    res.json({ message: 'Paciente eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
