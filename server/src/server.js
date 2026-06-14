// ============================================================================
// Entry Point del Servidor — server.js
// Capa: Infrastructure (arranque y configuración)
// ============================================================================

require('dotenv').config();

const app = require('./app');
const prisma = require('./infrastructure/database/prismaClient');
const { logger } = require('./infrastructure/logger');
const { startAutoApproveJob } = require('./infrastructure/cron/autoApproveJob');

// Use cases necesarios para el cron job
const AutoApproveSolicitudesUseCase = require('./application/use-cases/solicitud/AutoApproveSolicitudesUseCase');
const PrismaSolicitudRepository = require('./infrastructure/repositories/PrismaSolicitudRepository');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Verificar conexión a la base de datos
    await prisma.$connect();
    logger.info('✅ Conexión a PostgreSQL establecida.', { module: 'server' });

    // Iniciar cron job de auto-aprobación (equivalente a Celery beat)
    const solicitudRepo = new PrismaSolicitudRepository(prisma);
    const autoApproveUseCase = new AutoApproveSolicitudesUseCase(solicitudRepo);
    startAutoApproveJob(autoApproveUseCase);

    // Iniciar servidor HTTP
    app.listen(PORT, () => {
      console.log(`🚀 Servidor UCT-Vínculo Mayor corriendo en http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📖 Swagger docs: http://localhost:${PORT}/api/docs`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error(`❌ Error al iniciar el servidor: ${error.message}`, { module: 'server' });
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

