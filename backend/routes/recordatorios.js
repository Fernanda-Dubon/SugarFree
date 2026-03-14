// =========================================
// SUGARFREE — routes/recordatorios.js
// =========================================

const express       = require('express');
const router        = express.Router();
const Recordatorio  = require('../models/Recordatorio');
const Paciente      = require('../models/Paciente');
const { protect }   = require('../middleware/authMiddleware');

router.use(protect);

// GET /api/recordatorios  — Todos los recordatorios del cuidador
router.get('/', async (req, res) => {
  try {
    const recs = await Recordatorio.find({ cuidador: req.userId })
      .populate('paciente', 'nombre')
      .populate('medicamento', 'nombre dosis')
      .sort({ hora: 1 });
    res.json(recs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/recordatorios/pendientes  — Recordatorios activos de hoy
router.get('/pendientes', async (req, res) => {
  try {
    const diasSemana = ['dom','lun','mar','mie','jue','vie','sab'];
    const hoy = diasSemana[new Date().getDay()];

    const recs = await Recordatorio.find({
      cuidador: req.userId,
      activo: true,
      dias: hoy
    })
    .populate('paciente', 'nombre')
    .populate('medicamento', 'nombre dosis')
    .sort({ hora: 1 });

    res.json(recs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/recordatorios/paciente/:id
router.get('/paciente/:id', async (req, res) => {
  try {
    const pac = await Paciente.findOne({ _id: req.params.id, cuidador: req.userId });
    if (!pac) return res.status(404).json({ message: 'Paciente no encontrado.' });

    const recs = await Recordatorio.find({ paciente: req.params.id })
      .populate('paciente', 'nombre')
      .populate('medicamento', 'nombre dosis')
      .sort({ hora: 1 });
    res.json(recs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/recordatorios/:id
router.get('/:id', async (req, res) => {
  try {
    const rec = await Recordatorio.findOne({ _id: req.params.id, cuidador: req.userId })
      .populate('paciente', 'nombre')
      .populate('medicamento', 'nombre dosis');
    if (!rec) return res.status(404).json({ message: 'Recordatorio no encontrado.' });
    res.json(rec);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/recordatorios
router.post('/', async (req, res) => {
  try {
    const pac = await Paciente.findOne({ _id: req.body.paciente, cuidador: req.userId });
    if (!pac) return res.status(404).json({ message: 'Paciente no encontrado.' });

    const rec = await Recordatorio.create({ ...req.body, cuidador: req.userId });
    const populated = await rec.populate([
      { path: 'paciente', select: 'nombre' },
      { path: 'medicamento', select: 'nombre dosis' }
    ]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/recordatorios/:id
router.put('/:id', async (req, res) => {
  try {
    const rec = await Recordatorio.findOneAndUpdate(
      { _id: req.params.id, cuidador: req.userId },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('paciente', 'nombre')
    .populate('medicamento', 'nombre dosis');

    if (!rec) return res.status(404).json({ message: 'Recordatorio no encontrado.' });
    res.json(rec);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/recordatorios/:id
router.delete('/:id', async (req, res) => {
  try {
    const rec = await Recordatorio.findOneAndDelete({
      _id: req.params.id,
      cuidador: req.userId
    });
    if (!rec) return res.status(404).json({ message: 'Recordatorio no encontrado.' });
    res.json({ message: 'Recordatorio eliminado.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
