// ============================================================================
// Use Case: Crear Solicitud de Ayuda
// Capa: Application
// RF-SOL-01: Crear con categorías predefinidas
// RF-SOL-02: Incluir fecha, hora, descripción, ubicación
// RF-SOL-03: Impedir fuera de 08:00-20:00 y con <24h anticipación
// RN-04, RN-05, RN-07
// ============================================================================

const { Solicitud } = require('../../../domain/entities/Solicitud');
const { SolicitudValidationService } = require('../../../domain/services/SolicitudValidationService');
const { UserValidationService } = require('../../../domain/services/UserValidationService');

class CreateSolicitudUseCase {
  /**
   * @param {import('../../../domain/repositories/SolicitudRepository')} solicitudRepository
   * @param {import('../../../domain/repositories/CategoriaRepository')} categoriaRepository
   * @param {import('../../../domain/repositories/UserRepository')} userRepository
   */
  constructor(solicitudRepository, categoriaRepository, userRepository) {
    this.solicitudRepository = solicitudRepository;
    this.categoriaRepository = categoriaRepository;
    this.userRepository = userRepository;
  }

  /**
   * Crea una nueva solicitud de ayuda.
   * @param {Object} input
   * @param {string} input.titulo
   * @param {string} input.descripcion
   * @param {string} input.categoriaId
   * @param {string} input.fechaProgramada - ISO date string
   * @param {string} input.horaProgramada - "HH:mm"
   * @param {string} input.direccion
   * @param {string} input.comuna
   * @param {string} solicitanteId - ID del usuario autenticado
   * @returns {Promise<Object>} Solicitud creada
   */
  async execute(input, solicitanteId) {
    // 1. Verificar que el solicitante existe y puede crear solicitudes
    const solicitante = await this.userRepository.findById(solicitanteId);
    if (!solicitante) {
      const error = new Error('Usuario no encontrado.');
      error.statusCode = 404;
      throw error;
    }

    if (!['ADULTO_MAYOR', 'TUTOR'].includes(solicitante.rol)) {
      const error = new Error('Solo adultos mayores o tutores pueden crear solicitudes.');
      error.statusCode = 403;
      throw error;
    }

    if (solicitante.suspendido) {
      const error = new Error('Tu cuenta está suspendida. No puedes crear solicitudes.');
      error.statusCode = 403;
      throw error;
    }

    // 2. Verificar que la categoría existe y está activa (RF-SOL-01)
    const categoria = await this.categoriaRepository.findById(input.categoriaId);
    if (!categoria) {
      const error = new Error('La categoría seleccionada no existe.');
      error.statusCode = 400;
      throw error;
    }
    if (!categoria.activa) {
      const error = new Error('La categoría seleccionada no está disponible.');
      error.statusCode = 400;
      throw error;
    }

    // 3. Validar horario y anticipación (RF-SOL-03, RN-04, RN-05)
    const validacionCreacion = SolicitudValidationService.validarCreacion({
      fechaProgramada: new Date(input.fechaProgramada),
      horaProgramada: input.horaProgramada,
    });

    if (!validacionCreacion.valid) {
      const error = new Error(validacionCreacion.errors.join(' '));
      error.statusCode = 400;
      throw error;
    }

    // 4. Validar comuna (RN-03)
    const comunaValidation = UserValidationService.validarComuna(input.comuna);
    if (!comunaValidation.valid) {
      const error = new Error(comunaValidation.error);
      error.statusCode = 400;
      throw error;
    }

    // 5. Crear la solicitud
    const solicitudData = {
      titulo: input.titulo.trim(),
      descripcion: input.descripcion.trim(),
      categoriaId: input.categoriaId,
      solicitanteId,
      fechaProgramada: new Date(input.fechaProgramada),
      horaProgramada: input.horaProgramada,
      direccion: input.direccion.trim(),
      comuna: input.comuna.trim(),
    };

    const solicitud = await this.solicitudRepository.create(solicitudData);
    return solicitud;
  }
}

module.exports = CreateSolicitudUseCase;
