// ============================================================================
// Interfaz de Repositorio: UserRepository
// Capa: Domain — Contrato que la infraestructura debe implementar
// Principio: Dependency Inversion (SOLID - D)
// ============================================================================

/**
 * Contrato para el acceso a datos de usuarios.
 * La capa de aplicación depende de esta interfaz, no de la implementación concreta.
 *
 * @interface
 */
class UserRepository {
  /**
   * Busca un usuario por su ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    throw new Error('Método findById no implementado.');
  }

  /**
   * Busca un usuario por email.
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    throw new Error('Método findByEmail no implementado.');
  }

  /**
   * Busca un usuario por RUT.
   * @param {string} rut
   * @returns {Promise<Object|null>}
   */
  async findByRut(rut) {
    throw new Error('Método findByRut no implementado.');
  }

  /**
   * Crea un nuevo usuario.
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  async create(userData) {
    throw new Error('Método create no implementado.');
  }

  /**
   * Actualiza un usuario existente.
   * @param {string} id
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  async update(id, userData) {
    throw new Error('Método update no implementado.');
  }

  /**
   * Lista todos los usuarios, opcionalmente filtrados.
   * @param {Object} [filters]
   * @returns {Promise<Object[]>}
   */
  async findAll(filters) {
    throw new Error('Método findAll no implementado.');
  }
}

module.exports = UserRepository;
