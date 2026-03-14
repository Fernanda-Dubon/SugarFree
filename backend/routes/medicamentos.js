// =========================================
// SUGARFREE — routes/medicamentos.js
// =========================================

const express     = require('express');
const router      = express.Router();
const Medicamento = require('../models/Medicamento');
const Paciente    = require('../models/Paciente');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// GET /api/medicamentos/paciente/:id
router.get('/paciente/:id', async (req, res) => {
  try {
    const pac = await Paciente.findOne({ _id: req.params.id, cuidador: req.userId });
    if (!pac) return res.status(404).json({ message: 'Paciente no encontrado.' });

    const meds = await Medicamento.find({ paciente: req.params.id, activo: true })
      .sort({ nombre: 1 });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/medicamentos/:id
router.get('/:id', async (req, res) => {
  try {
    const med = await Medicamento.findOne({ _id: req.params.id, cuidador: req.userId });
    if (!med) return res.status(404).json({ message: 'Medicamento no encontrado.' });
    res.json(med);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/medicamentos
router.post('/', async (req, res) => {
  try {
    const pac = await Paciente.findOne({ _id: req.body.paciente, cuidador: req.userId });
    if (!pac) return res.status(404).json({ message: 'Paciente no encontrado.' });

    const med = await Medicamento.create({ ...req.body, cuidador: req.userId });
    res.status(201).json(med);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/medicamentos/:id
router.put('/:id', async (req, res) => {
  try {
    const med = await Medicamento.findOneAndUpdate(
      { _id: req.params.id, cuidador: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!med) return res.status(404).json({ message: 'Medicamento no encontrado.' });
    res.json(med);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/medicamentos/:id  — Borrado lógico
router.delete('/:id', async (req, res) => {
  try {
    const med = await Medicamento.findOneAndUpdate(
      { _id: req.params.id, cuidador: req.userId },
      { activo: false },
      { new: true }
    );
    if (!med) return res.status(404).json({ message: 'Medicamento no encontrado.' });
    res.json({ message: 'Medicamento eliminado.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
