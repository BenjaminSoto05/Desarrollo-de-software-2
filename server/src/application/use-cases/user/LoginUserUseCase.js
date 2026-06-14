// ============================================================================
// Use Case: Iniciar Sesión
// Capa: Application
// RF-USR-03: Autenticación mediante correo y contraseña
// ============================================================================

class LoginUserUseCase {
  /**
   * @param {import('../../domain/repositories/UserRepository')} userRepository
   * @param {import('../../infrastructure/services/HashService')} hashService
   * @param {import('../../infrastructure/services/JwtService')} jwtService
   */
  constructor(userRepository, hashService, jwtService) {
    this.userRepository = userRepository;
    this.hashService = hashService;
    this.jwtService = jwtService;
  }

  /**
   * Autentica un usuario y retorna un token JWT.
   * @param {Object} input
   * @param {string} input.email
   * @param {string} input.password
   * @returns {Promise<{ user: Object, token: string }>}
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

    // 4. Generar token JWT
    const token = this.jwtService.generateToken({
      id: user.id,
      email: user.email,
      rol: user.rol,
    });

    // 5. Retornar usuario sin datos sensibles + token
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }
}

module.exports = LoginUserUseCase;
