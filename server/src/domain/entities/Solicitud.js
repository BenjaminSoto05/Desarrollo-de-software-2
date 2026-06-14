// ============================================================================
// Entidad de Dominio: Solicitud
// Capa: Domain (sin dependencias externas)
// RF: RF-SOL-01 a RF-SOL-04, RF-EMP-03, RF-EJE-01 a RF-EJE-03
// RN: RN-04, RN-05, RN-11
// ============================================================================

/**
 * Estados del ciclo de vida de una solicitud.
 * SRS Sección 5: Diagrama de Actividad
 * @readonly
 * @enum {string}
 */
const ESTADOS = Object.freeze({
  PENDIENTE: 'PENDIENTE',
  EN_CURSO: 'EN_CURSO',
  COMPLETADA: 'COMPLETADA',
  FINALIZADA: 'FINALIZADA',
  CANCELADA: 'CANCELADA',
});

/**
 * Transiciones de estado válidas.
 * Controla el flujo: PENDIENTE → EN_CURSO → COMPLETADA → FINALIZADA
 */
const TRANSICIONES_VALIDAS = Object.freeze({
  PENDIENTE: [ESTADOS.EN_CURSO, ESTADOS.CANCELADA],
  EN_CURSO: [ESTADOS.COMPLETADA, ESTADOS.CANCELADA],
  COMPLETADA: [ESTADOS.FINALIZADA],
  FINALIZADA: [],
  CANCELADA: [],
});

class Solicitud {
  /**
   * @param {Object} props
   * @param {string} [props.id]
   * @param {string} props.titulo
   * @param {string} props.descripcion
   * @param {string} props.categoriaId
   * @param {string} props.solicitanteId
   * @param {string} [props.voluntarioId]
   * @param {string} [props.estado]
   * @param {Date} props.fechaProgramada
   * @param {string} props.horaProgramada
   * @param {string} props.direccion
   * @param {string} props.comuna
   */
  constructor(props) {
    this.id = props.id || null;
    this.titulo = props.titulo;
    this.descripcion = props.descripcion;
    this.categoriaId = props.categoriaId;
    this.solicitanteId = props.solicitanteId;
    this.voluntarioId = props.voluntarioId || null;
    this.estado = props.estado || ESTADOS.PENDIENTE;
    this.fechaProgramada = props.fechaProgramada;
    this.horaProgramada = props.horaProgramada;
    this.direccion = props.direccion;
    this.comuna = props.comuna;
  }

  /** @returns {boolean} Si la solicitud está disponible para aceptar */
  estaDisponible() {
    return this.estado === ESTADOS.PENDIENTE;
  }

  /** @returns {boolean} Si la solicitud está en curso */
  estaEnCurso() {
    return this.estado === ESTADOS.EN_CURSO;
  }

  /** @returns {boolean} Si la solicitud ya fue completada o finalizada */
  estaCerrada() {
    return (
      this.estado === ESTADOS.FINALIZADA || this.estado === ESTADOS.CANCELADA
    );
  }

  /**
   * Verifica si una transición de estado es válida.
   * @param {string} nuevoEstado
   * @returns {boolean}
   */
  puedeTransicionarA(nuevoEstado) {
    const transicionesPermitidas = TRANSICIONES_VALIDAS[this.estado];
    return transicionesPermitidas.includes(nuevoEstado);
  }

  /**
   * Cambia el estado de la solicitud si la transición es válida.
   * @param {string} nuevoEstado
   * @throws {Error} Si la transición no es válida
   */
  cambiarEstado(nuevoEstado) {
    if (!this.puedeTransicionarA(nuevoEstado)) {
      throw new Error(
        `Transición inválida: ${this.estado} → ${nuevoEstado}`
      );
    }
    this.estado = nuevoEstado;
  }

  /**
   * Asigna un voluntario a la solicitud.
   * RF-EMP-03: Aceptar solicitud
   * @param {string} voluntarioId
   */
  asignarVoluntario(voluntarioId) {
    if (!this.estaDisponible()) {
      throw new Error('La solicitud no está disponible para aceptar.');
    }
    this.voluntarioId = voluntarioId;
    this.cambiarEstado(ESTADOS.EN_CURSO);
  }

  /**
   * Verifica si un usuario puede editar la solicitud.
   * RF-SOL-04: Editar/cancelar antes de aceptación
   * @param {string} userId
   * @returns {boolean}
   */
  puedeSerEditadaPor(userId) {
    return this.solicitanteId === userId && this.estaDisponible();
  }

  /**
   * Verifica si un usuario puede cancelar la solicitud.
   * @param {string} userId
   * @returns {boolean}
   */
  puedeSerCanceladaPor(userId) {
    return (
      this.solicitanteId === userId &&
      (this.estaDisponible() || this.estaEnCurso())
    );
  }
}

module.exports = { Solicitud, ESTADOS, TRANSICIONES_VALIDAS };
