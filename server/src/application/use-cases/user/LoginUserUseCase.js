// ============================================================================
// Use Case: Iniciar Sesión
// Capa: Application
// RF-USR-03: Autenticación mediante correo y contraseña
// ============================================================================

class LoginUserUseCase {
  /**
   * @param {import('../../domain/repositories/UserRepository')} userRepository
   * @param {import('../../domain/repositories/RefreshTokenRepository')} refreshTokenRepository
   * @param {import('../../infrastructure/services/HashService')} hashService
   * @param {import('../../infrastructure/services/JwtService')} jwtService
   */
  constructor(userRepository, refreshTokenRepository, hashService, jwtService) {
    this.userRepository = userRepository;
    this.refreshTokenRepository = refreshTokenRepository;
    this.hashService = hashService;
    this.jwtService = jwtService;
  }

  /**
   * Autentica un usuario y retorna un token JWT de acceso y uno de refresco.
   * @param {Object} input
   * @param {string} input.email
   * @param {string} input.password
   * @returns {Promise<{ user: Object, accessToken: string, refreshToken: string }>}
   * @throws {Error} Si las credenciales son inválidas o el usuario está suspendido
   */
  async execute(input) {
    // 1. Buscar usuario por email
    const user = await this.userRepository.findByEmail(
      input.email.toLowerCase().trim()
    );

    if (!user) {
      const error = new Error('Credenciales inválidas.');
      error.statusCode = 401;
      throw error;
    }

    // 2. Verificar contraseña
    const passwordMatch = await this.hashService.compare(
      input.password,
      user.passwordHash
    );

    if (!passwordMatch) {
      const error = new Error('Credenciales inválidas.');
      error.statusCode = 401;
      throw error;
    }

    // 3. Verificar que no esté suspendido (RN-09)
    if (user.suspendido) {
      const error = new Error(
        'Tu cuenta ha sido suspendida. Contacta al administrador.'
      );
      error.statusCode = 403;
      throw error;
    }

    // 4. Generar tokens
    const payload = {
      id: user.id,
      email: user.email,
      rol: user.rol,
    };
    const accessToken = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    // 5. Guardar hash del Refresh Token en BD
    const tokenHash = this.jwtService.hashToken(refreshToken);
    const expiresAt = this.jwtService.getRefreshTokenExpiresAt();

    await this.refreshTokenRepository.create({
      tokenHash,
      userId: user.id,
      expiresAt,
    });

    // 6. Retornar usuario sin datos sensibles + tokens
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }
}

module.exports = LoginUserUseCase;
