// ============================================================================
// Use Case: Detalle de Solicitud
// Capa: Application
// RF-EMP-02: Mostrar info pública, ocultar dirección y teléfono
// RF-EMP-05: Liberar dirección solo después de aceptación (al voluntario asignado)
// ============================================================================

class GetSolicitudDetailUseCase {
  /**
   * @param {import('../../../domain/repositories/SolicitudRepository')} solicitudRepository
   */
  constructor(solicitudRepository) {
    this.solicitudRepository = solicitudRepository;
  }

  /**
   * Obtiene el detalle de una solicitud.
   * Aplica reglas de privacidad según el rol y estado.
   * @param {string} solicitudId
   * @param {Object} requestingUser - { id, rol }
   * @returns {Promise<Object>} Solicitud con datos condicionales
   */
  async execute(solicitudId, requestingUser) {
    const solicitud = await this.solicitudRepository.findById(solicitudId);

    if (!solicitud) {
      const error = new Error('Solicitud no encontrada.');
      error.statusCode = 404;
      throw error;
    }

    // Determinar si el usuario puede ver datos privados
    const esSolicitante = solicitud.solicitanteId === requestingUser.id;
    const esVoluntarioAsignado = solicitud.voluntarioId === requestingUser.id;
    const esAdmin = requestingUser.rol === 'ADMIN';

    // RF-EMP-05: Solo liberar dirección al voluntario asignado (post-aceptación)
    const puedeVerDireccion = esSolicitante || esVoluntarioAsignado || esAdmin;

    const result = { ...solicitud };

    if (!puedeVerDireccion) {
      result.direccion = '[Disponible después de aceptar la tarea]';
    }

    // Ocultar teléfono del solicitante a usuarios no autorizados
    if (result.solicitante && !puedeVerDireccion) {
      const { telefono, direccion, ...solicitantePublico } = result.solicitante;
      result.solicitante = solicitantePublico;
    }

    return result;
  }
}

module.exports = GetSolicitudDetailUseCase;
