// ============================================================================
// Servicio de Infraestructura: JwtService
// Capa: Infrastructure
// RNF-SEG: Manejo seguro de sesiones con JWT
// ============================================================================

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JwtService {
  /**
   * @param {string} [accessTokenSecret]
   * @param {string} [accessTokenExpiresIn]
   * @param {string} [refreshTokenSecret]
   * @param {string} [refreshTokenExpiresIn]
   */
  constructor(accessTokenSecret, accessTokenExpiresIn, refreshTokenSecret, refreshTokenExpiresIn) {
    this.accessTokenSecret = accessTokenSecret || process.env.JWT_SECRET;
    this.accessTokenExpiresIn = accessTokenExpiresIn || process.env.JWT_EXPIRES_IN || '15m';
    this.refreshTokenSecret = refreshTokenSecret || process.env.JWT_REFRESH_SECRET;
    this.refreshTokenExpiresIn = refreshTokenExpiresIn || process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  /**
   * Genera un Access Token JWT con los datos del usuario.
   * @param {{ id: string, email: string, rol: string }} payload
   * @returns {string} Token JWT firmado
   */
  generateAccessToken(payload) {
    return jwt.sign(payload, this.accessTokenSecret, { expiresIn: this.accessTokenExpiresIn });
  }

  /**
   * Genera un Refresh Token JWT con los datos del usuario.
   * @param {{ id: string, email: string, rol: string }} payload
   * @returns {string} Token JWT firmado
   */
  generateRefreshToken(payload) {
    return jwt.sign(payload, this.refreshTokenSecret, { expiresIn: this.refreshTokenExpiresIn });
  }

  /**
   * Verifica y decodifica un Access Token JWT.
   * @param {string} token
   * @returns {{ id: string, email: string, rol: string }} Payload decodificado
   * @throws {Error} Si el token es inválido o expirado
   */
  verifyAccessToken(token) {
    return jwt.verify(token, this.accessTokenSecret);
  }

  /**
   * Verifica y decodifica un Refresh Token JWT.
   * @param {string} token
   * @returns {{ id: string, email: string, rol: string }} Payload decodificado
   * @throws {Error} Si el token es inválido o expirado
   */
  verifyRefreshToken(token) {
    return jwt.verify(token, this.refreshTokenSecret);
  }

  /**
   * Genera un hash SHA-256 de un Refresh Token para persistencia segura.
   * @param {string} token
   * @returns {string} Hash hexadecimal del token
   */
  hashToken(token) {
    return crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
  }

  /**
   * Obtiene la fecha de expiración sumando el tiempo del JWT Refresh Token a la fecha actual.
   * @returns {Date} Fecha de expiración calculada
   */
  getRefreshTokenExpiresAt() {
    const durationMs = this.parseDuration(this.refreshTokenExpiresIn);
    return new Date(Date.now() + durationMs);
  }

  /**
   * Helper para parsear string de duración de JWT a milisegundos (ej: "7d", "15m", "2h").
   * @param {string} durationStr
   * @returns {number} Milisegundos correspondientes
   */
  parseDuration(durationStr) {
    const matches = durationStr.trim().match(/^(\d+)([smhd])$/);
    if (!matches) {
      throw new Error(`Formato de duración inválido: ${durationStr}`);
    }
    
    const value = parseInt(matches[1], 10);
    const unit = matches[2];
    const multipliers = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000
    };
    return value * multipliers[unit];
  }

  // Métodos de compatibilidad hacia atrás
  generateToken(payload) {
    return this.generateAccessToken(payload);
  }

  verifyToken(token) {
    return this.verifyAccessToken(token);
  }
}

module.exports = JwtService;
