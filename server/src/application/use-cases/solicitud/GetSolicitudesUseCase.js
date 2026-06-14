// ============================================================================
// Use Case: Listar Solicitudes
// Capa: Application
// RF-EMP-01: Mostrar solicitudes filtrables por categoría, comuna, fecha
// RF-EMP-02: Mostrar info pública, ocultar dirección y teléfono
// ============================================================================

class GetSolicitudesUseCase {
  /**
   * @param {import('../../../domain/repositories/SolicitudRepository')} solicitudRepository
   */
  constructor(solicitudRepository) {
    this.solicitudRepository = solicitudRepository;
  }

  /**
   * Lista solicitudes con filtros y paginación.
   * RF-EMP-02: Oculta dirección y teléfono del solicitante en el listado.
   * @param {Object} filters - { categoriaId?, comuna?, estado?, page?, limit? }
   * @param {Object} requestingUser - { id, rol } del usuario autenticado
   * @returns {Promise<Object>} { data, total, page, limit, totalPages }
   */
  async execute(filters, requestingUser) {
    const result = await this.solicitudRepository.findAll(filters);

    // RF-EMP-02: Sanitizar datos sensibles en el listado
    result.data = result.data.map((solicitud) => {
      const sanitized = { ...solicitud };

      // Ocultar dirección en el listado público (RF-EMP-02)
      delete sanitized.direccion;

      // Ocultar teléfono del solicitante
      if (sanitized.solicitante) {
        const { telefono, direccion, ...solicitantePublico } = sanitized.solicitante;
        sanitized.solicitante = solicitantePublico;
      }

      return sanitized;
    });

    return result;
  }
}

module.exports = GetSolicitudesUseCase;
