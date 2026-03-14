##  Estructura de Carpetas

```
sugarfree/
├── frontend/                 
│   ├── index.html             ← Login / Registro
│   ├── dashboard.html         ← Panel principal
│   ├── pages/
│   │   ├── pacientes.html
│   │   ├── glucemia.html
│   │   ├── medicamentos.html
│   │   ├── recordatorios.html
│   │   ├── dietas.html
│   │   └── consejos.html
│   ├── css/
│   │   ├── global.css         
│   │   ├── login.css
│   │   ├── dashboard.css
│   │   ├── pacientes.css
│   │   ├── glucemia.css
│   │   ├── medicamentos.css
│   │   ├── recordatorios.css
│   │   ├── dietas.css
│   │   └── consejos.css
│   └── js/
│       ├── api.js             
│       ├── auth.js            ← Sesión, login, logout
│       ├── utils.js           ← Funciones compartidas
│       ├── glucemia.js        ← Lógica de la linea de tiempo de glucosa
│       ├── medicamentos.js
│       └── recordatorios.js   ← Notificaciones de alertas
└── backend/
    ├── server.js              ← Express
    ├── package.json
    ├── .env                   ← Variables de entorno
    ├── config/
    │   └── db.js              ← Conexión MongoDB
    ├── middleware/
    │   └── authMiddleware.js  ← Verificación 
    ├── models/
    │   ├── Usuario.js
    │   ├── Paciente.js
    │   ├── Glucemia.js
    │   ├── Medicamento.js
    │   └── Recordatorio.js
    └── routes/
        ├── auth.js
        ├── pacientes.js
        ├── glucemia.js
        ├── medicamentos.js
        ├── recordatorios.js
        └── dietas.js
```