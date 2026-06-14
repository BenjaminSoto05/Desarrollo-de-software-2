// ============================================================================
// Use Case: Obtener Perfil de Usuario
// Capa: Application
// ============================================================================

class GetUserProfileUseCase {
  /**
   * @param {import('../../domain/repositories/UserRepository')} userRepository
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Obtiene el perfil del usuario autenticado.
   * @param {string} userId
   * @returns {Promise<Object>} Perfil del usuario (sin passwordHash)
   * @throws {Error} Si el usuario no existe
   */
  async execute(userId) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      const error = new Error('Usuario no encontrado.');
      error.statusCode = 404;
      throw error;
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = GetUserProfileUseCase;
