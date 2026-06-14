// ============================================================================
// Cron Job: Auto-Aprobación — RF-EJE-05, RN-12
// Equivalente a Celery periodic task en Django
// Ejecuta AutoApproveSolicitudesUseCase cada hora
// ============================================================================

const cron = require('node-cron');
const { logger } = require('../logger');

function startAutoApproveJob(autoApproveUseCase) {
  // Ejecutar cada hora (equivalente a celery beat schedule)
  cron.schedule('0 * * * *', async () => {
    logger.info('⏰ Ejecutando auto-aprobación de solicitudes (RN-12)...', { module: 'cron' });
    try {
      const result = await autoApproveUseCase.execute();
      if (result.solicitudesAprobadas > 0) {
        logger.info(`✅ Auto-aprobadas: ${result.solicitudesAprobadas} solicitudes`, { module: 'cron' });
      } else {
        logger.info('✅ Sin solicitudes pendientes de auto-aprobación', { module: 'cron' });
      }
    } catch (error) {
      logger.error(`❌ Error en auto-aprobación: ${error.message}`, { module: 'cron' });
    }
  });

  logger.info('📅 Cron job de auto-aprobación iniciado (cada hora)', { module: 'cron' });
}

module.exports = { startAutoApproveJob };
