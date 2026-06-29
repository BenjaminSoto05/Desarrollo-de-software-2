// ============================================================================
// Interfaz de Repositorio: RefreshTokenRepository
// Capa: Domain — Contrato que la infraestructura debe implementar
// Principio: Dependency Inversion (SOLID - D)
// ============================================================================

/**
 * Contrato para el acceso a datos de Refresh Tokens.
 * @interface
 */
class RefreshTokenRepository {
  /**
   * Crea un nuevo registro de Refresh Token.
   * @param {Object} data
   * @param {string} data.tokenHash - Hash SHA-256 del token
   * @param {string} data.userId - ID del usuario
   * @param {Date} data.expiresAt - Fecha de expiración
   * @returns {Promise<Object>}
   */
  async create(data) {
    throw new Error('Método create no implementado.');
  }

  /**
   * Busca un Refresh Token por su hash.
   * @param {string} tokenHash
   * @returns {Promise<Object|null>}
   */
  async findByTokenHash(tokenHash) {
    throw new Error('Método findByTokenHash no implementado.');
  }

  /**
   * Marca un Refresh Token como revocado.
   * @param {string} tokenHash
   * @returns {Promise<Object>}
   */
  async revoke(tokenHash) {
    throw new Error('Método revoke no implementado.');
  }

  /**
   * Revoca todos los Refresh Tokens asociados a un usuario.
   * @param {string} userId
   * @returns {Promise<number>} Cantidad de tokens revocados
   */
  async revokeAllByUserId(userId) {
    throw new Error('Método revokeAllByUserId no implementado.');
  }
}

module.exports = RefreshTokenRepository;
