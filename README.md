# UCT-Vínculo Mayor — AllyUCT

Plataforma de voluntariado que conecta estudiantes de la UCT con adultos mayores de Temuco.

## Stack Tecnológico

| Componente | Tecnología |
|---|---|
| **Backend** | Node.js + Express + Prisma ORM |
| **Frontend** | React + Vite + Tailwind CSS |
| **Base de datos** | PostgreSQL 15 |
| **Cache** | Redis 7 |
| **Documentación API** | Swagger/OpenAPI 3.0 |
| **Autenticación** | JWT + bcrypt |
| **Despliegue** | Docker + Nginx |

## Estructura del Proyecto

```
├── server/          → Backend Node.js (API REST)
│   ├── src/
│   │   ├── domain/          → Entidades y reglas de negocio
│   │   ├── application/     → Casos de uso
│   │   ├── presentation/    → Controladores y rutas
│   │   └── infrastructure/  → Prisma, Logger, Swagger, Cron
│   └── prisma/              → Schema y migraciones
├── client/          → Frontend React (Vite)
│   └── src/
│       ├── components/      → Componentes reutilizables
│       ├── pages/           → Páginas de la aplicación
│       ├── context/         → AuthContext (estado global)
│       └── services/        → API client (Axios)
├── system/          → Configuración Django (legacy + RNF)
├── Dockerfile       → Build multi-stage (React + Node)
├── docker-compose.yml → Orquestación de servicios
└── srs_vinculo_uct.md → Documento SRS
```

## Inicio Rápido (Desarrollo Local)

### Requisitos
- Node.js 22+
- PostgreSQL 15+ (corriendo)
- Redis (opcional, para cache)

### Pasos

**1. Clonar y configurar:**
```bash
git clone <url-del-repo>
cd Desarrollo-de-software
```

**2. Configurar variables de entorno:**
```bash
cp server/.env.example server/.env
# Editar server/.env con tus credenciales de PostgreSQL
```

**3. Instalar dependencias e inicializar base de datos:**
```bash
cd server
npm install
npx prisma migrate dev
npx prisma db seed
cd ..
```

**4. Instalar frontend:**
```bash
cd client
npm install
cd ..
```

**5. Iniciar servidores (2 terminales):**

Terminal 1 — Backend:
```bash
cd server
node src/server.js
```

Terminal 2 — Frontend:
```bash
cd client
npm run dev
```

**6. Abrir en el navegador:**
- Frontend: http://localhost:5173
- API Docs (Swagger): http://localhost:3000/api/docs
- Health Check: http://localhost:3000/api/health

### Cuentas de Prueba
| Rol | Email | Contraseña |
|---|---|---|
| Estudiante | `juan.perez@alu.uct.cl` | `MiPass123` |
| Adulto Mayor | `marialagos@gmail.com` | `MiPass123` |

## Despliegue con Docker

```bash
docker compose up --build -d
```

Esto levanta automáticamente:
- PostgreSQL 15
- Redis 7
- Node.js (API + Frontend compilado)

## Documentación API

Accede a la documentación interactiva Swagger en:
- **Swagger UI:** http://localhost:3000/api/docs
- **Schema JSON:** http://localhost:3000/api/schema

## Equipo
- Benjamin Sebastian — Requerimientos Funcionales (RF)
- Francisco Valderrama — Requerimientos No Funcionales: Seguridad (RNF-SEG)
- Sebastian Rivera — Requerimientos No Funcionales: Despliegue (RNF-DIS/REN)
- Axel Gonzalez — Requerimientos No Funcionales: API/Arquitectura (RNF-MAN)

## Docente
Guido Octavio Mellado Bravo — Universidad Católica de Temuco
