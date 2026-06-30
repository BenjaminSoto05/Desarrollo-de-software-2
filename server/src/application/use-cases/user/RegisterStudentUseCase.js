// ============================================================================
// Use Case: Registrar Estudiante UCT
// Capa: Application
// RF-USR-01: Registro validando dominios @uct.cl y @alu.uct.cl
// RN-02: Solo estudiantes regulares pueden participar
// ============================================================================

const { ROLES } = require('../../../domain/entities/User');
const {
  UserValidationService,
} = require('../../../domain/services/UserValidationService');
const {
  ValidationError,
  ConflictError,
} = require('../../../domain/exceptions');

class RegisterStudentUseCase {
  /**
   * @param {import('../../domain/repositories/UserRepository')} userRepository
   * @param {import('../../infrastructure/services/HashService')} hashService
   */
  constructor(userRepository, hashService) {
    this.userRepository = userRepository;
    this.hashService = hashService;
  }

  /**
   * Registra un nuevo estudiante UCT.
   * @param {Object} input
   * @param {string} input.email - Debe ser @uct.cl o @alu.uct.cl
   * @param {string} input.password
   * @param {string} input.rut
   * @param {string} input.nombre
   * @param {string} input.apellido
   * @param {string} [input.telefono]
   * @returns {Promise<Object>} Usuario creado (sin passwordHash)
   * @throws {Error} Si la validación falla o el usuario ya existe
   */
  async execute(input) {
    // 1. Validar email institucional (RF-USR-01)
    const emailValidation = UserValidationService.validarEmailEstudiante(
      input.email
    );
    if (!emailValidation.valid)
      throw new ValidationError(emailValidation.error);

    // 2. Validar RUT chileno
    const rutNormalizado = UserValidationService.normalizarRut(input.rut);
    const rutValidation = UserValidationService.validarRut(rutNormalizado);
    if (!rutValidation.valid) throw new ValidationError(rutValidation.error);

    // 3. Verificar que el email no esté registrado
    const existingEmail = await this.userRepository.findByEmail(
      input.email.toLowerCase().trim()
    );
    if (existingEmail)
      throw new ConflictError('Este correo electrónico ya está registrado.');

    // 4. Verificar que el RUT no esté registrado
    const existingRut = await this.userRepository.findByRut(rutNormalizado);
    if (existingRut) throw new ConflictError('Este RUT ya está registrado.');

    // 5. Hashear contraseña (RNF-SEG-02)
    const passwordHash = await this.hashService.hash(input.password);

    // 6. Crear usuario con rol ESTUDIANTE
    const userData = {
      email: input.email.toLowerCase().trim(),
      passwordHash,
      rut: rutNormalizado,
      nombre: input.nombre.trim(),
      apellido: input.apellido.trim(),
      telefono: input.telefono || null,
      rol: ROLES.ESTUDIANTE,
    };

    const createdUser = await this.userRepository.create(userData);

    // 7. Retornar sin datos sensibles
    const { passwordHash: _, ...userWithoutPassword } = createdUser;
    return userWithoutPassword;
  }
}

module.exports = RegisterStudentUseCase;
