// ============================================================================
// Entidad de Dominio: Evaluacion
// Capa: Domain (sin dependencias externas)
// RF: RF-EJE-04
// ============================================================================

/** Puntuación mínima y máxima para evaluaciones con estrellas */
const PUNTUACION_MINIMA = 1;
const PUNTUACION_MAXIMA = 5;

class Evaluacion {
  /**
   * @param {Object} props
   * @param {string} [props.id]
   * @param {string} props.solicitudId
   * @param {string} props.evaluadorId
   * @param {string} props.evaluadoId
   * @param {number} props.puntuacion - Valor entre 1 y 5
   * @param {string} [props.comentario]
   */
  constructor(props) {
    this.id = props.id || null;
    this.solicitudId = props.solicitudId;
    this.evaluadorId = props.evaluadorId;
    this.evaluadoId = props.evaluadoId;
    this.puntuacion = props.puntuacion;
    this.comentario = props.comentario || null;

    this.validarPuntuacion();
  }

  /**
   * Valida que la puntuación esté dentro del rango permitido (1-5).
   * @throws {Error} Si la puntuación está fuera de rango
   */
  validarPuntuacion() {
    if (
      !Number.isInteger(this.puntuacion) ||
      this.puntuacion < PUNTUACION_MINIMA ||
      this.puntuacion > PUNTUACION_MAXIMA
    ) {
      throw new Error(
        `La puntuación debe ser un entero entre ${PUNTUACION_MINIMA} y ${PUNTUACION_MAXIMA}.`
      );
    }
  }

  /**
   * Verifica que el evaluador no se evalúe a sí mismo.
   * @returns {boolean}
   */
  esAutoEvaluacion() {
    return this.evaluadorId === this.evaluadoId;
  }
}

module.exports = { Evaluacion, PUNTUACION_MINIMA, PUNTUACION_MAXIMA };
