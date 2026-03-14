// =========================================
// SUGARFREE — routes/dietas.js
// Generación de dietas personalizadas
// =========================================

const express   = require('express');
const router    = express.Router();
const Paciente  = require('../models/Paciente');
const { protect } = require('../middleware/authMiddleware');

// Colección en memoria (puedes agregar un modelo Dieta si deseas persistirlas)
// Por simplicidad, las dietas se generan dinámicamente según el perfil del paciente
// Si quieres persistirlas, crea models/Dieta.js con el esquema correspondiente.

router.use(protect);

// ── Base de datos de platos por tipo ──
const PLATOS = {
  // Desayunos
  desayuno: {
    tipo1:        [
      { nombre: 'Avena con canela y chía', porcion: '1 taza' },
      { nombre: 'Huevos revueltos con espinaca', porcion: '2 huevos' },
      { nombre: 'Tortilla integral', porcion: '1 unidad' },
      { nombre: 'Yogur natural sin azúcar', porcion: '¾ taza' }
    ],
    tipo2:        [
      { nombre: 'Huevos a la plancha', porcion: '2 unidades' },
      { nombre: 'Pan integral tostado', porcion: '1 rebanada' },
      { nombre: 'Aguacate en rodajas', porcion: '¼ unidad' },
      { nombre: 'Té sin azúcar', porcion: '1 taza' }
    ],
    gestacional:  [
      { nombre: 'Batido de proteína con leche descremada', porcion: '1 vaso' },
      { nombre: 'Frutas frescas de bajo índice glucémico', porcion: '½ taza' },
      { nombre: 'Tostada integral con queso blanco', porcion: '1 rebanada' }
    ],
    prediabetes:  [
      { nombre: 'Granola sin azúcar con leche vegetal', porcion: '½ taza' },
      { nombre: 'Plátano verde cocido', porcion: '½ unidad' },
      { nombre: 'Café negro sin azúcar', porcion: '1 taza' }
    ]
  },
  // Media mañana
  media_manana: {
    tipo1:        [{ nombre: 'Almendra natural', porcion: '15 g' }, { nombre: 'Manzana pequeña', porcion: '1 unidad' }],
    tipo2:        [{ nombre: 'Pepino con limón', porcion: '1 taza' }, { nombre: 'Nueces', porcion: '10 g' }],
    gestacional:  [{ nombre: 'Yogur natural', porcion: '½ taza' }, { nombre: 'Galletas integrales', porcion: '3 unidades' }],
    prediabetes:  [{ nombre: 'Zanahoria baby', porcion: '1 taza' }, { nombre: 'Hummus sin sal', porcion: '2 cdas' }]
  },
  // Almuerzo
  almuerzo: {
    tipo1:        [
      { nombre: 'Arroz integral', porcion: '½ taza' },
      { nombre: 'Pechuga de pollo a la plancha', porcion: '120 g' },
      { nombre: 'Ensalada verde con aceite de oliva', porcion: '2 tazas' },
      { nombre: 'Agua o infusión sin azúcar', porcion: '1 vaso' }
    ],
    tipo2:        [
      { nombre: 'Frijoles negros cocidos', porcion: '½ taza' },
      { nombre: 'Pescado al vapor', porcion: '130 g' },
      { nombre: 'Brócoli y zanahorias al vapor', porcion: '1 taza' },
      { nombre: 'Tortilla integral', porcion: '1 unidad' }
    ],
    gestacional:  [
      { nombre: 'Quinoa cocida', porcion: '½ taza' },
      { nombre: 'Res magra a la plancha', porcion: '100 g' },
      { nombre: 'Vegetales salteados', porcion: '1 taza' },
      { nombre: 'Agua con limón', porcion: '1 vaso' }
    ],
    prediabetes:  [
      { nombre: 'Camote al horno', porcion: '½ taza' },
      { nombre: 'Pavo horneado', porcion: '120 g' },
      { nombre: 'Ensalada de espinaca y tomate', porcion: '2 tazas' }
    ]
  },
  // Merienda
  merienda: {
    tipo1:        [{ nombre: 'Palomitas de maíz sin sal', porcion: '1 taza' }, { nombre: 'Agua infusionada', porcion: '1 vaso' }],
    tipo2:        [{ nombre: 'Rodajas de pepino y jícama', porcion: '1 taza' }, { nombre: 'Semillas de girasol sin sal', porcion: '10 g' }],
    gestacional:  [{ nombre: 'Rebanadas de queso fresco', porcion: '30 g' }, { nombre: 'Galletas de avena sin azúcar', porcion: '3 unidades' }],
    prediabetes:  [{ nombre: 'Mango verde con sal y limón', porcion: '½ taza' }, { nombre: 'Agua de jamaica sin azúcar', porcion: '1 vaso' }]
  },
  // Cena
  cena: {
    tipo1:        [
      { nombre: 'Sopa de verduras sin papa', porcion: '1 taza' },
      { nombre: 'Huevo pochado', porcion: '1 unidad' },
      { nombre: 'Pan integral', porcion: '1 rebanada' }
    ],
    tipo2:        [
      { nombre: 'Crema de espinaca sin crema', porcion: '1 taza' },
      { nombre: 'Atún en agua', porcion: '80 g' },
      { nombre: 'Tostada de centeno', porcion: '1 unidad' }
    ],
    gestacional:  [
      { nombre: 'Sopa de lentejas', porcion: '1 taza' },
      { nombre: 'Ensalada de rúcula', porcion: '1 taza' }
    ],
    prediabetes:  [
      { nombre: 'Tacos de lechuga con pollo', porcion: '2 tacos' },
      { nombre: 'Salsa de aguacate fresco', porcion: '2 cdas' }
    ]
  }
};

const EVITAR_POR_TIPO = {
  tipo1:       ['Jugos azucarados', 'Refresco', 'Dulces', 'Pan blanco', 'Papas fritas', 'Arroz blanco en exceso', 'Alcohol'],
  tipo2:       ['Azúcar de mesa', 'Refresco', 'Miel', 'Pan dulce', 'Pasteles', 'Frutas en almíbar', 'Alcohol', 'Embutidos'],
  gestacional: ['Mariscos crudos', 'Embutidos', 'Quesos no pasteurizados', 'Refresco', 'Azúcar refinada', 'Cafeína en exceso'],
  prediabetes: ['Bebidas energéticas', 'Comida ultra-procesada', 'Harinas refinadas', 'Azúcar añadida', 'Frituras', 'Alcohol']
};

const RECOMENDACIONES_POR_TIPO = {
  tipo1: [
    'Cuenta los carbohidratos en cada comida para ajustar la dosis de insulina.',
    'Siempre lleva consigo glucosa de acción rápida (tabletas o jugo).',
    'Come a horas regulares para evitar picos glucémicos.',
    'Mide la glucemia antes y después de cada comida principal.',
    'Hidratación constante: 8 vasos de agua al día mínimo.'
  ],
  tipo2: [
    'Prefiere carbohidratos complejos: legumbres, granos integrales.',
    'Reduce las porciones progresivamente para alcanzar peso ideal.',
    'Distribuye las comidas en 5 tiempos pequeños al día.',
    'Incluye actividad física ligera después del almuerzo (caminata de 10 min).',
    'Evita saltarte comidas para prevenir hipoglucemia si tomas medicación.'
  ],
  gestacional: [
    'Come cada 2-3 horas para mantener glucemia estable.',
    'Aumenta el consumo de ácido fólico y hierro de fuentes naturales.',
    'Prefiere proteínas magras en cada comida principal.',
    'Registra los valores de glucemia antes y 1h después de cada comida.',
    'Consulta al nutricionista al menos una vez por semana.'
  ],
  prediabetes: [
    'Este es el momento ideal para revertir la condición con dieta y ejercicio.',
    'Reduce el azúcar añadida gradualmente para evitar antojos severos.',
    '30 minutos de ejercicio aeróbico 5 días a la semana es muy efectivo.',
    'Prioriza alimentos con bajo índice glucémico.',
    'Controla el tamaño de las porciones usando el método del plato.'
  ]
};

// ── Función generadora de dieta ──
function generarDietaPersonalizada(paciente) {
  const tipo = paciente.tipoDiabetes;
  const alergias = (paciente.alergias || '').toLowerCase();

  // Filtrar platos si hay alergias conocidas
  const filtrar = (platos) => platos.filter(p =>
    !alergias.split(',').some(a =>
      a.trim() && p.nombre.toLowerCase().includes(a.trim())
    )
  );

  const tiempos = ['desayuno', 'media_manana', 'almuerzo', 'merienda', 'cena'];

  const comidas = tiempos.map(tiempo => {
    const base = PLATOS[tiempo]?.[tipo] || PLATOS[tiempo]?.tipo2 || [];
    const platos = filtrar(base);
    return {
      tipo,
      platos,
      nota: getNota(tiempo, tipo)
    };
  });

  // Ajuste por condiciones especiales
  const condiciones = (paciente.condiciones || '').toLowerCase();
  let evitar = [...(EVITAR_POR_TIPO[tipo] || [])];
  if (condiciones.includes('renal') || condiciones.includes('riñon')) {
    evitar.push('Alimentos altos en potasio', 'Exceso de proteína animal');
  }
  if (condiciones.includes('hipertension') || condiciones.includes('presion')) {
    evitar.push('Sal en exceso', 'Embutidos', 'Enlatados con sodio');
  }

  return {
    paciente: { nombre: paciente.nombre, _id: paciente._id },
    tipoDiabetes: tipo,
    comidas,
    evitar,
    recomendaciones: RECOMENDACIONES_POR_TIPO[tipo] || [],
    generadoEn: new Date().toISOString()
  };
}

function getNota(tiempo, tipo) {
  const notas = {
    desayuno:    'Desayuna dentro de la primera hora al despertar.',
    media_manana:'Solo si han pasado más de 2h del desayuno.',
    almuerzo:    'El almuerzo debe ser la comida más completa del día.',
    merienda:    'Snack ligero para evitar llegara la cena con mucha hambre.',
    cena:        'Cena al menos 2 horas antes de dormir.'
  };
  return notas[tiempo] || '';
}

// ── Rutas ──

// POST /api/dietas/generar/:pacienteId  — Genera dieta nueva
router.post('/generar/:pacienteId', async (req, res) => {
  try {
    const paciente = await Paciente.findOne({
      _id: req.params.pacienteId,
      cuidador: req.userId
    });
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado.' });

    const dieta = generarDietaPersonalizada(paciente);
    res.json(dieta);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/dietas/paciente/:id/ultima  — Genera/devuelve dieta actual
router.get('/paciente/:id/ultima', async (req, res) => {
  try {
    const paciente = await Paciente.findOne({
      _id: req.params.id,
      cuidador: req.userId
    });
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado.' });

    const dieta = generarDietaPersonalizada(paciente);
    res.json(dieta);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
