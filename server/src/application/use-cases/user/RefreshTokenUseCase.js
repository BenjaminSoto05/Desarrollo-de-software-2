// ============================================================================
// Use Case: Renovar Token
// Capa: Application
// Permite refrescar el token de acceso usando el token de refresco y realiza rotación.
// ============================================================================

class RefreshTokenUseCase {
  /**
   * @param {import('../../domain/repositories/RefreshTokenRepository')} refreshTokenRepository
   * @param {import('../../domain/repositories/UserRepository')} userRepository
   * @param {import('../../../infrastructure/services/JwtService')} jwtService
   */
  constructor(refreshTokenRepository, userRepository, jwtService) {
    this.refreshTokenRepository = refreshTokenRepository;
    this.userRepository = userRepository;
    this.jwtService = jwtService;
  }

  /**
   * Valida un Refresh Token y emite un nuevo par de tokens.
   * @param {Object} input
   * @param {string} input.token - Token de refresco original
   * @returns {Promise<{ accessToken: string, refreshToken: string }>}
   */
  async execute(input) {
    const { token } = input;
    if (!token) {
      const error = new Error('Refresh Token no proporcionado.');
      error.statusCode = 400;
      throw error;
    }

    // 1. Verificar firma y expiración del JWT de refresco
    let decoded;
    try {
      decoded = this.jwtService.verifyRefreshToken(token);
    } catch (err) {
      const error = new Error('Refresh Token inválido o expirado.');
      error.statusCode = 401;
      throw error;
    }

    // 2. Calcular hash y buscar en la base de datos
    const tokenHash = this.jwtService.hashToken(token);
    const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken) {
      const error = new Error('Sesión no encontrada.');
      error.statusCode = 401;
      throw error;
    }

    // 3. DETECTAR REUTILIZACIÓN DE TOKEN REVOCADO (Posible compromiso de seguridad)
    if (storedToken.revoked) {
      // Revocar todas las sesiones del usuario de forma inmediata
      await this.refreshTokenRepository.revokeAllByUserId(storedToken.userId);
      const error = new Error('Brecha de seguridad detectada. Todas las sesiones del usuario han sido invalidadas.');
      error.statusCode = 401;
      throw error;
    }

    // 4. Validar expiración temporal física
    if (new Date() > new Date(storedToken.expiresAt)) {
      const error = new Error('Sesión expirada.');
      error.statusCode = 401;
      throw error;
    }

    // 5. Obtener usuario y validar que no esté suspendido
    const user = await this.userRepository.findById(storedToken.userId);
    if (!user || user.suspendido) {
      const error = new Error('Acceso denegado.');
      error.statusCode = 403;
      throw error;
    }

    // 6. Generar nuevo Access Token y un nuevo Refresh Token (Rotación)
    const payload = {
      id: user.id,
      email: user.email,
      rol: user.rol,
    };
    const newAccessToken = this.jwtService.generateAccessToken(payload);
    const newRefreshToken = this.jwtService.generateRefreshToken(payload);

    // 7. Inactivar el token de refresco anterior y registrar el nuevo
    await this.refreshTokenRepository.revoke(tokenHash);

    const newHash = this.jwtService.hashToken(newRefreshToken);
    const newExpiresAt = this.jwtService.getRefreshTokenExpiresAt();

    await this.refreshTokenRepository.create({
      tokenHash: newHash,
      userId: user.id,
      expiresAt: newExpiresAt,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}

module.exports = RefreshTokenUseCase;
