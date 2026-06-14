// ============================================================================
// Controller: Autenticación
// Capa: Presentation
// Maneja los requests HTTP y delega la lógica a los Use Cases
// Principio: Single Responsibility — solo traduce HTTP ↔ Use Case
// ============================================================================

class AuthController {
  /**
   * @param {Object} useCases
   * @param {import('../../application/use-cases/user/RegisterStudentUseCase')} useCases.registerStudent
   * @param {import('../../application/use-cases/user/RegisterElderlyUseCase')} useCases.registerElderly
   * @param {import('../../application/use-cases/user/LoginUserUseCase')} useCases.loginUser
   * @param {import('../../application/use-cases/user/GetUserProfileUseCase')} useCases.getUserProfile
   */
  constructor(useCases) {
    this.registerStudent = useCases.registerStudent;
    this.registerElderly = useCases.registerElderly;
    this.loginUser = useCases.loginUser;
    this.getUserProfile = useCases.getUserProfile;

    // Bind para mantener el contexto de `this` en Express
    this.handleRegisterStudent = this.handleRegisterStudent.bind(this);
    this.handleRegisterElderly = this.handleRegisterElderly.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleGetProfile = this.handleGetProfile.bind(this);
  }

  /**
   * POST /api/auth/register/student
   * RF-USR-01: Registro de estudiante con validación de dominio UCT
   */
  async handleRegisterStudent(req, res, next) {
    try {
      const user = await this.registerStudent.execute(req.body);

      res.status(201).json({
        success: true,
        message: 'Estudiante registrado exitosamente.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/register/elderly
   * RF-USR-02: Registro de Adulto Mayor o Tutor
   */
  async handleRegisterElderly(req, res, next) {
    try {
      const user = await this.registerElderly.execute(req.body);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * RF-USR-03: Autenticación con email y contraseña
   */
  async handleLogin(req, res, next) {
    try {
      const result = await this.loginUser.execute(req.body);

      res.json({
        success: true,
        message: 'Inicio de sesión exitoso.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Obtiene el perfil del usuario autenticado
   */
  async handleGetProfile(req, res, next) {
    try {
      const user = await this.getUserProfile.execute(req.user.id);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
