// =========================================
// SUGARFREE — server.js
// Punto de entrada del servidor Express
// =========================================

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');

const app = express();

// ── Conexión a MongoDB ──
connectDB();

// ── Middlewares globales ──
app.use(cors({
  origin: '*',   // En producción, cambia esto a tu dominio
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas ──
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/pacientes',     require('./routes/pacientes'));
app.use('/api/glucemia',      require('./routes/glucemia'));
app.use('/api/medicamentos',  require('./routes/medicamentos'));
app.use('/api/recordatorios', require('./routes/recordatorios'));
app.use('/api/dietas',        require('./routes/dietas'));

// ── Ruta de salud ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SugarFree API funcionando 🩺' });
});

// ── Manejo de errores global ──
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor'
  });
});

// ── Iniciar servidor ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SugarFree API corriendo en http://localhost:${PORT}`);
});
