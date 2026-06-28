const RegisterStudentUseCase = require('../../../../../src/application/use-cases/user/RegisterStudentUseCase');
const { ROLES } = require('../../../../../src/domain/entities/User');
const { UserValidationService } = require('../../../../../src/domain/services/UserValidationService');

describe('RegisterStudentUseCase', () => {
  let userRepositoryMock;
  let hashServiceMock;
  let registerStudentUseCase;

  beforeEach(() => {
    userRepositoryMock = {
      findByEmail: jest.fn(),
      findByRut: jest.fn(),
      create: jest.fn(),
    };
    hashServiceMock = {
      hash: jest.fn(),
    };
    registerStudentUseCase = new RegisterStudentUseCase(userRepositoryMock, hashServiceMock);
  });

  const validPayload = {
    email: 'estudiante@alu.uct.cl',
    password: 'password123',
    rut: '12345678-5',
    nombre: 'Maria',
    apellido: 'Gonzalez',
    telefono: '+56912345678',
  };

  it('debe registrar un Estudiante correctamente', async () => {
    jest.spyOn(UserValidationService, 'validarEmailEstudiante').mockReturnValue({ valid: true });
    jest.spyOn(UserValidationService, 'validarRut').mockReturnValue({ valid: true });
    
    userRepositoryMock.findByEmail.mockResolvedValue(null);
    userRepositoryMock.findByRut.mockResolvedValue(null);
    hashServiceMock.hash.mockResolvedValue('hashedPassword');
    
    userRepositoryMock.create.mockResolvedValue({
      id: 'student-1',
      ...validPayload,
      rol: ROLES.ESTUDIANTE,
      passwordHash: 'hashedPassword',
    });

    const result = await registerStudentUseCase.execute(validPayload);

    expect(userRepositoryMock.create).toHaveBeenCalledWith({
      email: 'estudiante@alu.uct.cl',
      passwordHash: 'hashedPassword',
      rut: '12345678-5',
      nombre: 'Maria',
      apellido: 'Gonzalez',
      telefono: '+56912345678',
      rol: ROLES.ESTUDIANTE,
    });
    expect(result.passwordHash).toBeUndefined();
    expect(result.id).toBe('student-1');
  });

  it('debe lanzar error 400 si el email no es institucional', async () => {
    jest.spyOn(UserValidationService, 'validarEmailEstudiante').mockReturnValue({ valid: false, error: 'Email inválido' });
    
    await expect(registerStudentUseCase.execute(validPayload))
      .rejects.toThrow('Email inválido');
  });

  it('debe lanzar error 400 si el RUT es inválido', async () => {
    jest.spyOn(UserValidationService, 'validarEmailEstudiante').mockReturnValue({ valid: true });
    jest.spyOn(UserValidationService, 'validarRut').mockReturnValue({ valid: false, error: 'RUT inválido' });
    
    await expect(registerStudentUseCase.execute(validPayload))
      .rejects.toThrow('RUT inválido');
  });

  it('debe lanzar error 409 si el email ya existe', async () => {
    jest.spyOn(UserValidationService, 'validarEmailEstudiante').mockReturnValue({ valid: true });
    jest.spyOn(UserValidationService, 'validarRut').mockReturnValue({ valid: true });
    userRepositoryMock.findByEmail.mockResolvedValue({ id: 'exists' });

    await expect(registerStudentUseCase.execute(validPayload))
      .rejects.toThrow('Este correo electrónico ya está registrado.');
  });

  it('debe lanzar error 409 si el RUT ya existe', async () => {
    jest.spyOn(UserValidationService, 'validarEmailEstudiante').mockReturnValue({ valid: true });
    jest.spyOn(UserValidationService, 'validarRut').mockReturnValue({ valid: true });
    userRepositoryMock.findByEmail.mockResolvedValue(null);
    userRepositoryMock.findByRut.mockResolvedValue({ id: 'exists' });

    await expect(registerStudentUseCase.execute(validPayload))
      .rejects.toThrow('Este RUT ya está registrado.');
  });
});
