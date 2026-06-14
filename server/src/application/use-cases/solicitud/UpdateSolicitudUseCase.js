// ============================================================================
// Use Case: Actualizar Solicitud
// Capa: Application
// RF-SOL-04: Editar solicitud antes de aceptación
// ============================================================================

const { Solicitud } = require('../../../domain/entities/Solicitud');
const { SolicitudValidationService } = require('../../../domain/services/SolicitudValidationService');

class UpdateSolicitudUseCase {
  /**
   * @param {import('../../../domain/repositories/SolicitudRepository')} solicitudRepository
   * @param {import('../../../domain/repositories/CategoriaRepository')} categoriaRepository
   */
  constructor(solicitudRepository, categoriaRepository) {
    this.solicitudRepository = solicitudRepository;
    this.categoriaRepository = categoriaRepository;
  }

  /**
   * Actualiza una solicitud existente.
   * RF-SOL-04: Solo si está en estado PENDIENTE y es el solicitante.
   * @param {string} solicitudId
   * @param {Object} input - Campos a actualizar
   * @param {string} userId - ID del usuario que solicita la edición
   * @returns {Promise<Object>} Solicitud actualizada
   */
  async execute(solicitudId, input, userId) {
    const solicitudData = await this.solicitudRepository.findById(solicitudId);

    if (!solicitudData) {
      const error = new Error('Solicitud no encontrada.');
      error.statusCode = 404;
      throw error;
    }

    // Usar entidad de dominio para validar permisos
    const solicitud = new Solicitud(solicitudData);

    if (!solicitud.puedeSerEditadaPor(userId)) {
      const error = new Error(
        'No puedes editar esta solicitud. Solo el creador puede editarla mientras esté pendiente.'
      );
      error.statusCode = 403;
      throw error;
    }

    // Validar nueva categoría si se proporciona
    if (input.categoriaId) {
      const categoria = await this.categoriaRepository.findById(input.categoriaId);
      if (!categoria || !categoria.activa) {
        const error = new Error('La categoría seleccionada no es válida.');
        error.statusCode = 400;
        throw error;
      }
    }

    // Validar horario y anticipación si se cambian fecha/hora
    if (input.fechaProgramada || input.horaProgramada) {
      const fechaValidar = input.fechaProgramada
        ? new Date(input.fechaProgramada)
        : solicitudData.fechaProgramada;
      const horaValidar = input.horaProgramada || solicitudData.horaProgramada;

      const validacion = SolicitudValidationService.validarCreacion({
        fechaProgramada: fechaValidar,
        horaProgramada: horaValidar,
      });

      if (!validacion.valid) {
        const error = new Error(validacion.errors.join(' '));
        error.statusCode = 400;
        throw error;
      }
    }

    // Construir datos de actualización (solo campos proporcionados)
    const updateData = {};
    if (input.titulo) updateData.titulo = input.titulo.trim();
    if (input.descripcion) updateData.descripcion = input.descripcion.trim();
    if (input.categoriaId) updateData.categoriaId = input.categoriaId;
    if (input.fechaProgramada) updateData.fechaProgramada = new Date(input.fechaProgramada);
    if (input.horaProgramada) updateData.horaProgramada = input.horaProgramada;
    if (input.direccion) updateData.direccion = input.direccion.trim();
    if (input.comuna) updateData.comuna = input.comuna.trim();

    const updated = await this.solicitudRepository.update(solicitudId, updateData);
    return updated;
  }
}

module.exports = UpdateSolicitudUseCase;
