// ============================================================================
// Use Case: Crear Evaluación (Estrellas)
// Capa: Application
// RF-EJE-04: Evaluaciones opcionales con estrellas (1-5)
// ============================================================================

const { Evaluacion } = require('../../../domain/entities/Evaluacion');
const { ESTADOS } = require('../../../domain/entities/Solicitud');

class CreateEvaluacionUseCase {
  /**
   * @param {import('../../../domain/repositories/EvaluacionRepository')} evaluacionRepository
   * @param {import('../../../domain/repositories/SolicitudRepository')} solicitudRepository
   */
  constructor(evaluacionRepository, solicitudRepository) {
    this.evaluacionRepository = evaluacionRepository;
    this.solicitudRepository = solicitudRepository;
  }

  /**
   * Crea una evaluación con estrellas para una solicitud finalizada.
   * @param {Object} input
   * @param {string} input.solicitudId
   * @param {number} input.puntuacion - 1 a 5
   * @param {string} [input.comentario]
   * @param {string} evaluadorId - ID del usuario que evalúa
   * @returns {Promise<Object>} Evaluación creada
   */
  async execute(input, evaluadorId) {
    // 1. Verificar que la solicitud existe y está FINALIZADA o COMPLETADA
    const solicitud = await this.solicitudRepository.findById(input.solicitudId);

    if (!solicitud) {
      const error = new Error('Solicitud no encontrada.');
      error.statusCode = 404;
      throw error;
    }

    if (solicitud.estado !== ESTADOS.FINALIZADA && solicitud.estado !== ESTADOS.COMPLETADA) {
      const error = new Error('Solo se pueden evaluar tareas finalizadas o completadas.');
      error.statusCode = 400;
      throw error;
    }

    // 2. Verificar que el evaluador es parte de la solicitud
    const esSolicitante = solicitud.solicitanteId === evaluadorId;
    const esVoluntario = solicitud.voluntarioId === evaluadorId;

    if (!esSolicitante && !esVoluntario) {
      const error = new Error('Solo el solicitante o el voluntario pueden evaluar esta tarea.');
      error.statusCode = 403;
      throw error;
    }

    // 3. Determinar a quién se evalúa
    const evaluadoId = esSolicitante ? solicitud.voluntarioId : solicitud.solicitanteId;

    // 4. Validar puntuación con entidad de dominio
    const evaluacion = new Evaluacion({
      solicitudId: input.solicitudId,
      evaluadorId,
      evaluadoId,
      puntuacion: input.puntuacion,
      comentario: input.comentario,
    });

    // 5. Verificar que no se autoeval​​úe
    if (evaluacion.esAutoEvaluacion()) {
      const error = new Error('No puedes evaluarte a ti mismo.');
      error.statusCode = 400;
      throw error;
    }

    // 6. Verificar que no haya evaluado ya esta solicitud
    const yaEvaluo = await this.evaluacionRepository.existsForSolicitudAndEvaluador(
      input.solicitudId,
      evaluadorId
    );

    if (yaEvaluo) {
      const error = new Error('Ya has evaluado esta solicitud.');
      error.statusCode = 409;
      throw error;
    }

    // 7. Crear la evaluación
    const created = await this.evaluacionRepository.create({
      solicitudId: input.solicitudId,
      evaluadorId,
      evaluadoId,
      puntuacion: input.puntuacion,
      comentario: input.comentario || null,
    });

    return created;
  }
}

module.exports = CreateEvaluacionUseCase;
