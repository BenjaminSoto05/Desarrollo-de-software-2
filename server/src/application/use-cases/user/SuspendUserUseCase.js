// ============================================================================
// Use Case: Suspender Usuario por Inasistencias
// Capa: Application
// RF-USR-04: Suspensión automática tras 3 inasistencias injustificadas
// RN-09: Tres inasistencias generan suspensión
// ============================================================================

const { User, MAX_INASISTENCIAS } = require('../../../domain/entities/User');

class SuspendUserUseCase {
  /**
   * @param {import('../../domain/repositories/UserRepository')} userRepository
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Registra una inasistencia y suspende automáticamente si corresponde.
   * @param {string} userId - ID del estudiante
   * @returns {Promise<{ suspendido: boolean, inasistencias: number }>}
   */
  async execute(userId) {
    const userData = await this.userRepository.findById(userId);

    if (!userData) {
      const error = new Error('Usuario no encontrado.');
      error.statusCode = 404;
      throw error;
    }

    // Usar entidad de dominio para aplicar lógica de negocio
    const user = new User(userData);
    const fueSuspendido = user.registrarInasistencia();

    // Persistir cambios
    await this.userRepository.update(userId, {
      inasistencias: user.inasistencias,
      suspendido: user.suspendido,
    });

    return {
      suspendido: user.suspendido,
      inasistencias: user.inasistencias,
      mensaje: fueSuspendido
        ? `El usuario ha sido suspendido tras ${MAX_INASISTENCIAS} inasistencias.`
        : `Inasistencia registrada (${user.inasistencias}/${MAX_INASISTENCIAS}).`,
    };
  }
}

module.exports = SuspendUserUseCase;
