#  SugarFree
### Aplicación web para cuidadores de personas diabéticas

---

##  Descripción

SugarFree es una aplicación web cliente-servidor desarrollada con **HTML/CSS/JS** en el frontend y **Node.js + Express + MongoDB** en el backend.

**Funcionalidades:**
-  Registro y gestión de pacientes con su perfil de condición diabética
-  Registro de glucemia con línea de tiempo visual y alertas automáticas
-  Gestión de medicamentos (nombre, descripción, dosis, vía, frecuencia)
-  Recordatorios de medicamentos con notificaciones del navegador
-  Generación de dietas personalizadas según el tipo de diabetes
-  Sección de consejos para cuidadores

---

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

---

### Requisitos previos

Instala lo siguiente si no lo tienes:

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Node.js | v18+ | https://nodejs.org |
| MongoDB Atlas | (cuenta gratis) | https://mongodb.com/atlas |
| VS Code + Live Server | — | https://code.visualstudio.com |

---

## API Endpoints

### Auth
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registrar cuidador |
| POST | `/api/auth/login` | Iniciar sesión |

### Pacientes
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/pacientes` | Listar mis pacientes |
| GET | `/api/pacientes/:id` | Ver un paciente |
| POST | `/api/pacientes` | Crear paciente |
| PUT | `/api/pacientes/:id` | Actualizar paciente |
| DELETE | `/api/pacientes/:id` | Eliminar paciente |

### Glucemia
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/glucemia/hoy` | Lecturas de hoy de todos los pacientes |
| GET | `/api/glucemia/paciente/:id?desde=&hasta=` | Historial con filtro de fechas |
| POST | `/api/glucemia` | Registrar lectura |
| DELETE | `/api/glucemia/:id` | Eliminar lectura |

### Medicamentos
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/medicamentos/paciente/:id` | Medicamentos de un paciente |
| POST | `/api/medicamentos` | Crear medicamento |
| PUT | `/api/medicamentos/:id` | Actualizar medicamento |
| DELETE | `/api/medicamentos/:id` | Eliminar medicamento |

### Recordatorios
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/recordatorios` | Todos los recordatorios |
| GET | `/api/recordatorios/pendientes` | Recordatorios activos hoy |
| GET | `/api/recordatorios/paciente/:id` | Por paciente |
| POST | `/api/recordatorios` | Crear recordatorio |
| PUT | `/api/recordatorios/:id` | Actualizar / activar-desactivar |
| DELETE | `/api/recordatorios/:id` | Eliminar |

### Dietas
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/dietas/generar/:pacienteId` | Generar nueva dieta |
| GET | `/api/dietas/paciente/:id/ultima` | Ver dieta actual del paciente |

---

## Tecnologías utilizadas

**Frontend:**
- HTML5 + CSS3 + JavaScript 
- Google Fonts: Syne + DM Sans
- Notification API del navegador (para recordatorios)

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose ODM
- JSON Web Tokens (JWT) para autenticación
- bcryptjs para hash de contraseñas
- CORS habilitado

---

##Rangos de alerta de glucemia

| Valor (mg/dL) | Estado | Color |
|---|---|---|
| < 54 | Hipoglucemia grave | Rojo |
| 54 – 69 | Glucosa baja | Azul |
| 70 – 180* | En rango | Verde |
| 181 – 250 | Glucosa alta | Ámbar |
| > 250 | Hiperglucemia severa | Rojo |

*El rango normal se configura individualmente por paciente.

---

## Notas del proyecto

- El sistema soporta hasta 10 pacientes por cuidador.
- Las dietas se generan dinámicamente según el tipo de diabetes, alergias y condiciones del paciente.
- Los recordatorios activan notificaciones del navegador si se conceden los permisos.
- Los borrados son lógicos (campo `activo: false`) para mantener la integridad de los datos.
