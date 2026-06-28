// Tests de integracion para RegisterStudentUseCase
const RegisterStudentUseCase = require('../../../src/application/use-cases/user/RegisterStudentUseCase');
const { ROLES } = require('../../../src/domain/entities/User');

describe('RegisterStudentUseCase (Integracion)', () => {
  let useCase;
  let mockUserRepository;
  let mockHashService;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findByRut: jest.fn(),
      create: jest.fn(),
    };
    mockHashService = {
      hash: jest.fn(async () => 'HASHED_PASSWORD_MOCK'),
    };
    useCase = new RegisterStudentUseCase(mockUserRepository, mockHashService);
  });

  describe('Registro exitoso', () => {
    it('debe registrar estudiante con email @uct.cl', async () => {
      const input = {
        email: 'estudiante@uct.cl',
        password: 'Password123',
        rut: '12345678-5',
        nombre: 'Juan',
        apellido: 'Perez',
      };
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByRut.mockResolvedValue(null);
      mockUserRepository.create.mockImplementation((data) =>
        Promise.resolve({ id: 'user-new', ...data, passwordHash: undefined })
      );

      const resultado = await useCase.execute(input);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('estudiante@uct.cl');
      expect(mockUserRepository.findByRut).toHaveBeenCalledWith('12345678-5');
      expect(mockHashService.hash).toHaveBeenCalledWith('Password123');
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(resultado).toHaveProperty('id', 'user-new');
      expect(resultado).not.toHaveProperty('passwordHash');
    });

    it('debe registrar estudiante con email @alu.uct.cl', async () => {
      const input = {
        email: 'alumno@alu.uct.cl',
        password: 'Password123',
        rut: '12345678-5',
        nombre: 'Ana',
        apellido: 'Gonzalez',
      };
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByRut.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({ id: 'user-2', ...input, passwordHash: undefined });

      const resultado = await useCase.execute(input);
      expect(resultado).toHaveProperty('id', 'user-2');
    });
  });
});