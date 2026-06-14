// ============================================================================
// Entidad de Dominio: User
// Capa: Domain (sin dependencias externas)
// RF: RF-USR-01, RF-USR-02, RF-USR-04
// RN: RN-02, RN-09
// ============================================================================

/**
 * Roles válidos del sistema según SRS Sección 2.
 * @readonly
 * @enum {string}
 */
const ROLES = Object.freeze({
  ADULTO_MAYOR: 'ADULTO_MAYOR',
  TUTOR: 'TUTOR',
  ESTUDIANTE: 'ESTUDIANTE',
  ADMIN: 'ADMIN',
});

/**
 * Dominios institucionales válidos para estudiantes UCT.
 * RF-USR-01: Solo @uct.cl y @alu.uct.cl
 */
const DOMINIOS_UCT = ['@uct.cl', '@alu.uct.cl'];

/**
 * Máximo de inasistencias antes de suspensión automática.
 * RN-09: Tres inasistencias generan suspensión.
 */
const MAX_INASISTENCIAS = 3;

class User {
  /**
   * @param {Object} props
   * @param {string} [props.id]
   * @param {string} props.email
   * @param {string} props.passwordHash
   * @param {string} props.rut
   * @param {string} props.nombre
   * @param {string} props.apellido
   * @param {string} [props.telefono]
   * @param {string} props.rol
   * @param {string} [props.comuna]
   * @param {string} [props.direccion]
   * @param {number} [props.inasistencias]
   * @param {boolean} [props.suspendido]
   */
  constructor(props) {
    this.id = props.id || null;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.rut = props.rut;
    this.nombre = props.nombre;
    this.apellido = props.apellido;
    this.telefono = props.telefono || null;
    this.rol = props.rol;
    this.comuna = props.comuna || null;
    this.direccion = props.direccion || null;
    this.inasistencias = props.inasistencias || 0;
    this.suspendido = props.suspendido || false;
  }

  /** @returns {string} Nombre completo del usuario */
  getNombreCompleto() {
    return `${this.nombre} ${this.apellido}`;
  }

  /** @returns {boolean} Si el usuario es estudiante UCT */
  esEstudiante() {
    return this.rol === ROLES.ESTUDIANTE;
  }

  /** @returns {boolean} Si el usuario puede crear solicitudes */
  puedeCrearSolicitudes() {
    return (
      (this.rol === ROLES.ADULTO_MAYOR || this.rol === ROLES.TUTOR) &&
      !this.suspendido
    );
  }

  /** @returns {boolean} Si el usuario puede aceptar tareas */
  puedeAceptarTareas() {
    return this.rol === ROLES.ESTUDIANTE && !this.suspendido;
  }

  /** @returns {boolean} Si el usuario es administrador */
  esAdmin() {
    return this.rol === ROLES.ADMIN;
  }

  /**
   * Registra una inasistencia y evalúa suspensión automática.
   * RN-08 + RN-09
   * @returns {boolean} Si el usuario fue suspendido
   */
  registrarInasistencia() {
    this.inasistencias += 1;
    if (this.inasistencias >= MAX_INASISTENCIAS) {
      this.suspendido = true;
    }
    return this.suspendido;
  }
}

module.exports = { User, ROLES, DOMINIOS_UCT, MAX_INASISTENCIAS };
