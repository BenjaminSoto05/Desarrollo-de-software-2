// ============================================================================
// Use Case: Cerrar Sesión (Logout Individual)
// Capa: Application
// Revoca el Refresh Token actual.
// ============================================================================

class LogoutUserUseCase {
  /**
   * @param {import('../../domain/repositories/RefreshTokenRepository')} refreshTokenRepository
   * @param {import('../../../infrastructure/services/JwtService')} jwtService
   */
  constructor(refreshTokenRepository, jwtService) {
    this.refreshTokenRepository = refreshTokenRepository;
    this.jwtService = jwtService;
  }

  /**
   * Revoca un token de refresco específico.
   * @param {Object} input
   * @param {string} input.token - Token de refresco original
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async execute(input) {
    const { token } = input;
    if (!token) {
      const error = new Error('Refresh Token no proporcionado.');
      error.statusCode = 400;
      throw error;
    }

    const tokenHash = this.jwtService.hashToken(token);
    
    // Revocar en la base de datos
    try {
      await this.refreshTokenRepository.revoke(tokenHash);
    } catch (e) {
      // Ignorar errores si el token no existía (ej: ya expiró de la base de datos)
    }

    return {
      success: true,
      message: 'Sesión cerrada exitosamente.',
    };
  }
}

module.exports = LogoutUserUseCase;
