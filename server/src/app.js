// ============================================================================
// Configuración de Express — app.js
// Capa: Presentation (entrada de la aplicación)
// ============================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./infrastructure/swagger');
const { logger } = require('./infrastructure/logger');

const app = express();

// ============================================================================
// Middlewares globales
// ============================================================================

// Seguridad: Headers HTTP seguros (RNF-SEG-01)
app.use(helmet());

// CORS: Permitir requests del frontend React
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Parsing de JSON y URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging de requests
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ============================================================================
// Health Check
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'UCT-Vínculo Mayor API',
  });
});

// ============================================================================
// Swagger/OpenAPI — RNF-MAN-02
// Equivalente a /api/docs/swagger/ de Django (drf-spectacular)
// ============================================================================

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'AllyUCT API - Documentación',
}));

// Schema JSON endpoint (equivalente a /api/schema/ de Django)
app.get('/api/schema', (req, res) => {
  res.json(swaggerSpec);
});

// ============================================================================
// Rutas de la API (se registran en Fase 2+)
// ============================================================================

// Fase 2: Autenticación (RF-USR-01 a RF-USR-04)
const authRoutes = require('./presentation/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Fase 3: Solicitudes y Categorías (RF-SOL-01 a RF-SOL-04)
const solicitudRoutes = require('./presentation/routes/solicitudRoutes');
const categoriaRoutes = require('./presentation/routes/categoriaRoutes');
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/categorias', categoriaRoutes);

// Fase 5: Evaluaciones (RF-EJE-04)
const evaluacionRoutes = require('./presentation/routes/evaluacionRoutes');
app.use('/api/evaluaciones', evaluacionRoutes);

// ============================================================================
// Manejo de errores global
// ============================================================================

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Recurso no encontrado.',
    path: req.originalUrl,
  });
});

// Error handler general
app.use((err, req, res, _next) => {
  console.error('❌ Error:', err.message);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor.'
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
  });
});

module.exports = app;
