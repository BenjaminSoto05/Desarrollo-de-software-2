// ============================================================================
// Rutas: Autenticación
// Capa: Presentation
// Conecta endpoints HTTP con middlewares y controllers
// ============================================================================

const { Router } = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');
const {
  registerStudentRules,
  registerElderlyRules,
  loginRules,
} = require('../middlewares/validationMiddleware');

// Infraestructura
const prisma = require('../../infrastructure/database/prismaClient');
const PrismaUserRepository = require('../../infrastructure/repositories/PrismaUserRepository');
const JwtService = require('../../infrastructure/services/JwtService');
const HashService = require('../../infrastructure/services/HashService');

// Use Cases
const RegisterStudentUseCase = require('../../application/use-cases/user/RegisterStudentUseCase');
const RegisterElderlyUseCase = require('../../application/use-cases/user/RegisterElderlyUseCase');
const LoginUserUseCase = require('../../application/use-cases/user/LoginUserUseCase');
const GetUserProfileUseCase = require('../../application/use-cases/user/GetUserProfileUseCase');

// Controller
const AuthController = require('../controllers/AuthController');

// ============================================================================
// Composición de dependencias (Dependency Injection manual)
// ============================================================================

const userRepository = new PrismaUserRepository(prisma);
const hashService = new HashService();
const jwtService = new JwtService(
  process.env.JWT_SECRET,
  process.env.JWT_EXPIRES_IN
);

const authController = new AuthController({
  registerStudent: new RegisterStudentUseCase(userRepository, hashService),
  registerElderly: new RegisterElderlyUseCase(userRepository, hashService),
  loginUser: new LoginUserUseCase(userRepository, hashService, jwtService),
  getUserProfile: new GetUserProfileUseCase(userRepository),
});

// ============================================================================
// Definición de rutas
// ============================================================================

const router = Router();

/**
 * POST /api/auth/register/student
 * RF-USR-01: Registro de estudiantes con email @uct.cl o @alu.uct.cl
 * Body: { email, password, rut, nombre, apellido, telefono? }
 */
router.post(
  '/register/student',
  registerStudentRules,
  authController.handleRegisterStudent
);

/**
 * POST /api/auth/register/elderly
 * RF-USR-02: Registro de Adulto Mayor o Tutor con RUT válido
 * Body: { email, password, rut, nombre, apellido, rol, telefono?, comuna?, direccion? }
 */
router.post(
  '/register/elderly',
  registerElderlyRules,
  authController.handleRegisterElderly
);

/**
 * POST /api/auth/login
 * RF-USR-03: Autenticación con email y contraseña → JWT
 * Body: { email, password }
 */
router.post('/login', loginRules, authController.handleLogin);

/**
 * GET /api/auth/me
 * Obtiene perfil del usuario autenticado (requiere JWT)
 */
router.get('/me', authMiddleware, authController.handleGetProfile);

module.exports = router;
