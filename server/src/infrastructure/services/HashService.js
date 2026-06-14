// ============================================================================
// Servicio de Infraestructura: HashService
// Capa: Infrastructure
// RNF-SEG-02: Contraseñas con bcrypt
// ============================================================================

const bcrypt = require('bcryptjs');

/** Número de rondas de salt para bcrypt */
const SALT_ROUNDS = 12;

class HashService {
  /**
   * Hashea una contraseña usando bcrypt.
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<string>} Hash bcrypt
   */
  async hash(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Compara una contraseña en texto plano con su hash.
   * @param {string} password - Contraseña en texto plano
   * @param {string} hashedPassword - Hash almacenado
   * @returns {Promise<boolean>} true si coinciden
   */
  async compare(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

module.exports = HashService;
