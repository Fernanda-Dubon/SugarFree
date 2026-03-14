// =========================================
// SUGARFREE — routes/glucemia.js
// Registros de glucemia
// =========================================

const express  = require('express');
const router   = express.Router();
const Glucemia = require('../models/Glucemia');
const Paciente = require('../models/Paciente');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// GET /api/glucemia/hoy  — Todos los registros de hoy de todos los pacientes
router.get('/hoy', async (req, res) => {
  try {
    const inicio = new Date(); inicio.setHours(0, 0, 0, 0);
    const fin    = new Date(); fin.setHours(23, 59, 59, 999);

    const registros = await Glucemia.find({
      cuidador: req.userId,
      fecha: { $gte: inicio, $lte: fin }
    })
    .populate('paciente', 'nombre glucemiaRango')
    .sort({ fecha: -1 });

    res.json(registros);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/glucemia/paciente/:id  — Historial con filtros opcionales
router.get('/paciente/:id', async (req, res) => {
  try {
    // Verificar que el paciente pertenece al cuidador
    const paciente = await Paciente.findOne({ _id: req.params.id, cuidador: req.userId });
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado.' });

    const filtro = { paciente: req.params.id };

    if (req.query.desde || req.query.hasta) {
      filtro.fecha = {};
      if (req.query.desde) filtro.fecha.$gte = new Date(req.query.desde);
      if (req.query.hasta) {
        const h = new Date(req.query.hasta);
        h.setHours(23, 59, 59, 999);
        filtro.fecha.$lte = h;
      }
    }

    const registros = await Glucemia.find(filtro)
      .populate('paciente', 'nombre glucemiaRango')
      .sort({ fecha: -1 })
      .limit(200);

    res.json(registros);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/glucemia  — Registrar lectura
router.post('/', async (req, res) => {
  try {
    const { paciente, valor, fecha, momento, notas } = req.body;

    // Verificar que el paciente es del cuidador
    const pac = await Paciente.findOne({ _id: paciente, cuidador: req.userId });
    if (!pac) return res.status(404).json({ message: 'Paciente no encontrado.' });

    const registro = await Glucemia.create({
      paciente,
      cuidador: req.userId,
      valor,
      fecha: fecha || new Date(),
      momento,
      notas
    });

    const populated = await registro.populate('paciente', 'nombre glucemiaRango');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/glucemia/:id
router.delete('/:id', async (req, res) => {
  try {
    const registro = await Glucemia.findOneAndDelete({
      _id: req.params.id,
      cuidador: req.userId
    });
    if (!registro) return res.status(404).json({ message: 'Registro no encontrado.' });
    res.json({ message: 'Registro eliminado.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
