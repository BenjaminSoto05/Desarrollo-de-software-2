// ============================================================================
// Use Case: Cerrar Todas las Sesiones (Logout Global)
// Capa: Application
// Revoca todos los Refresh Tokens de un usuario de forma masiva.
// ============================================================================

class LogoutAllUsersUseCase {
  /**
   * @param {import('../../domain/repositories/RefreshTokenRepository')} refreshTokenRepository
   */
  constructor(refreshTokenRepository) {
    this.refreshTokenRepository = refreshTokenRepository;
  }

  /**
   * Revoca todos los tokens de refresco del usuario.
   * @param {string} userId - ID del usuario actual
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async execute(userId) {
    await this.refreshTokenRepository.revokeAllByUserId(userId);
    return {
      success: true,
      message: 'Todas las sesiones activas han sido cerradas exitosamente.',
    };
  }
}

module.exports = LogoutAllUsersUseCase;
