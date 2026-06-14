// ============================================================================
// Servicio de Infraestructura: JwtService
// Capa: Infrastructure
// RNF-SEG: Manejo seguro de sesiones con JWT
// ============================================================================

const jwt = require('jsonwebtoken');

class JwtService {
  /**
   * @param {string} secret - Clave secreta para firmar tokens
   * @param {string} expiresIn - Tiempo de expiración (ej: "24h")
   */
  constructor(secret, expiresIn) {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  /**
   * Genera un token JWT con los datos del usuario.
   * @param {{ id: string, email: string, rol: string }} payload
   * @returns {string} Token JWT firmado
   */
  generateToken(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  /**
   * Verifica y decodifica un token JWT.
   * @param {string} token
   * @returns {{ id: string, email: string, rol: string }} Payload decodificado
   * @throws {Error} Si el token es inválido o expirado
   */
  verifyToken(token) {
    return jwt.verify(token, this.secret);
  }
}

module.exports = JwtService;
