// ============================================================================
// Entidad de Dominio: Categoria
// Capa: Domain (sin dependencias externas)
// RF: RF-SOL-01
// RN: RN-07 (restricción de categorías peligrosas)
// ============================================================================

/**
 * Categorías prohibidas por RN-07.
 * No se permiten tareas de riesgo físico, legal o médico.
 */
const CATEGORIAS_PROHIBIDAS = Object.freeze([
  'medicina',
  'electricidad',
  'conducción',
  'conduccion',
  'riesgo físico',
  'riesgo fisico',
  'riesgo legal',
]);

class Categoria {
  /**
   * @param {Object} props
   * @param {string} [props.id]
   * @param {string} props.nombre
   * @param {string} [props.descripcion]
   * @param {boolean} [props.activa]
   */
  constructor(props) {
    this.id = props.id || null;
    this.nombre = props.nombre;
    this.descripcion = props.descripcion || null;
    this.activa = props.activa !== undefined ? props.activa : true;
  }

  /**
   * Verifica si el nombre de la categoría está prohibido (RN-07).
   * @returns {boolean}
   */
  esProhibida() {
    const nombreNormalizado = this.nombre.toLowerCase().trim();
    return CATEGORIAS_PROHIBIDAS.some((prohibida) =>
      nombreNormalizado.includes(prohibida)
    );
  }
}

module.exports = { Categoria, CATEGORIAS_PROHIBIDAS };
