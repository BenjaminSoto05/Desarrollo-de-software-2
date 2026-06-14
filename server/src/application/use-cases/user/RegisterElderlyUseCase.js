// ============================================================================
// Use Case: Registrar Adulto Mayor o Tutor
// Capa: Application
// RF-USR-02: Registro de perfiles Adulto Mayor y Tutor con RUT válido
// ============================================================================

const { ROLES } = require('../../../domain/entities/User');
const { UserValidationService } = require('../../../domain/services/UserValidationService');

/** Roles permitidos para este registro */
const ROLES_PERMITIDOS = [ROLES.ADULTO_MAYOR, ROLES.TUTOR];

class RegisterElderlyUseCase {
  /**
   * @param {import('../../domain/repositories/UserRepository')} userRepository
   * @param {import('../../infrastructure/services/HashService')} hashService
   */
  constructor(userRepository, hashService) {
    this.userRepository = userRepository;
    this.hashService = hashService;
  }

  /**
   * Registra un Adulto Mayor o Tutor.
   * @param {Object} input
   * @param {string} input.email
   * @param {string} input.password
   * @param {string} input.rut
   * @param {string} input.nombre
   * @param {string} input.apellido
   * @param {string} [input.telefono]
   * @param {string} input.rol - ADULTO_MAYOR o TUTOR
   * @param {string} [input.comuna]
   * @param {string} [input.direccion]
   * @returns {Promise<Object>} Usuario creado (sin passwordHash)
   */
  async execute(input) {
    // 1. Validar rol permitido
    if (!ROLES_PERMITIDOS.includes(input.rol)) {
      const error = new Error(
        `El rol debe ser uno de: ${ROLES_PERMITIDOS.join(', ')}.`
      );
      error.statusCode = 400;
      throw error;
    }

    // 2. Validar RUT chileno (RF-USR-02)
    const rutNormalizado = UserValidationService.normalizarRut(input.rut);
    const rutValidation = UserValidationService.validarRut(rutNormalizado);
    if (!rutValidation.valid) {
      const error = new Error(rutValidation.error);
      error.statusCode = 400;
      throw error;
    }

    // 3. Validar comuna si se proporciona (RN-03)
    if (input.comuna) {
      const comunaValidation = UserValidationService.validarComuna(input.comuna);
      if (!comunaValidation.valid) {
        const error = new Error(comunaValidation.error);
        error.statusCode = 400;
        throw error;
      }
    }

    // 4. Verificar unicidad de email
    const existingEmail = await this.userRepository.findByEmail(
      input.email.toLowerCase().trim()
    );
    if (existingEmail) {
      const error = new Error('Este correo electrónico ya está registrado.');
      error.statusCode = 409;
      throw error;
    }

    // 5. Verificar unicidad de RUT
    const existingRut = await this.userRepository.findByRut(rutNormalizado);
    if (existingRut) {
      const error = new Error('Este RUT ya está registrado.');
      error.statusCode = 409;
      throw error;
    }

    // 6. Hashear contraseña (RNF-SEG-02)
    const passwordHash = await this.hashService.hash(input.password);

    // 7. Crear usuario
    const userData = {
      email: input.email.toLowerCase().trim(),
      passwordHash,
      rut: rutNormalizado,
      nombre: input.nombre.trim(),
      apellido: input.apellido.trim(),
      telefono: input.telefono || null,
      rol: input.rol,
      comuna: input.comuna ? input.comuna.trim() : null,
      direccion: input.direccion ? input.direccion.trim() : null,
    };

    const createdUser = await this.userRepository.create(userData);

    const { passwordHash: _, ...userWithoutPassword } = createdUser;
    return userWithoutPassword;
  }
}

module.exports = RegisterElderlyUseCase;
