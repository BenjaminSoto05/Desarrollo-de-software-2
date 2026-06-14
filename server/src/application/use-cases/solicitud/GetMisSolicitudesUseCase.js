// ============================================================================
// Use Case: Obtener Solicitudes del Usuario (Mis Solicitudes)
// Capa: Application
// ============================================================================

class GetMisSolicitudesUseCase {
  /**
   * @param {import('../../../domain/repositories/SolicitudRepository')} solicitudRepository
   */
  constructor(solicitudRepository) {
    this.solicitudRepository = solicitudRepository;
  }

  /**
   * Obtiene solicitudes del usuario según su rol.
   * - ADULTO_MAYOR/TUTOR: solicitudes que creó
   * - ESTUDIANTE: solicitudes que aceptó
   * @param {string} userId
   * @param {string} userRol
   * @returns {Promise<Object[]>}
   */
  async execute(userId, userRol) {
    if (['ADULTO_MAYOR', 'TUTOR'].includes(userRol)) {
      return this.solicitudRepository.findBySolicitante(userId);
    }

    if (userRol === 'ESTUDIANTE') {
      return this.solicitudRepository.findByVoluntario(userId);
    }

    const error = new Error('Rol no válido para esta consulta.');
    error.statusCode = 403;
    throw error;
  }
}

module.exports = GetMisSolicitudesUseCase;
