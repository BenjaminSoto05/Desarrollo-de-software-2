const CreateEvaluacionUseCase = require('../../../../../src/application/use-cases/evaluacion/CreateEvaluacionUseCase');
const { ESTADOS } = require('../../../../../src/domain/entities/Solicitud');

describe('CreateEvaluacionUseCase', () => {
  let evaluacionRepositoryMock;
  let solicitudRepositoryMock;
  let createEvaluacionUseCase;

  beforeEach(() => {
    evaluacionRepositoryMock = {
      existsForSolicitudAndEvaluador: jest.fn(),
      create: jest.fn(),
    };
    solicitudRepositoryMock = {
      findById: jest.fn(),
    };
    createEvaluacionUseCase = new CreateEvaluacionUseCase(evaluacionRepositoryMock, solicitudRepositoryMock);
  });

  const validSolicitud = {
    id: 'sol-1',
    estado: ESTADOS.FINALIZADA,
    solicitanteId: 'am-1',
    voluntarioId: 'est-1',
  };

  const validInput = {
    solicitudId: 'sol-1',
    puntuacion: 5,
    comentario: 'Muy buen voluntario',
  };

  it('debe crear una evaluación correctamente si es el solicitante', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(validSolicitud);
    evaluacionRepositoryMock.existsForSolicitudAndEvaluador.mockResolvedValue(false);
    evaluacionRepositoryMock.create.mockResolvedValue({ id: 'ev-1', ...validInput, evaluadorId: 'am-1', evaluadoId: 'est-1' });

    const result = await createEvaluacionUseCase.execute(validInput, 'am-1');

    expect(solicitudRepositoryMock.findById).toHaveBeenCalledWith('sol-1');
    expect(evaluacionRepositoryMock.existsForSolicitudAndEvaluador).toHaveBeenCalledWith('sol-1', 'am-1');
    expect(evaluacionRepositoryMock.create).toHaveBeenCalledWith({
      solicitudId: 'sol-1',
      evaluadorId: 'am-1',
      evaluadoId: 'est-1',
      puntuacion: 5,
      comentario: 'Muy buen voluntario',
    });
    expect(result.id).toBe('ev-1');
  });

  it('debe crear una evaluación correctamente si es el voluntario', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(validSolicitud);
    evaluacionRepositoryMock.existsForSolicitudAndEvaluador.mockResolvedValue(false);
    evaluacionRepositoryMock.create.mockResolvedValue({ id: 'ev-2', ...validInput, evaluadorId: 'est-1', evaluadoId: 'am-1' });

    const result = await createEvaluacionUseCase.execute(validInput, 'est-1');

    expect(evaluacionRepositoryMock.create).toHaveBeenCalledWith(expect.objectContaining({
      evaluadorId: 'est-1',
      evaluadoId: 'am-1',
    }));
  });

  it('debe lanzar error 404 si la solicitud no existe', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(null);

    await expect(createEvaluacionUseCase.execute(validInput, 'am-1'))
      .rejects.toThrow('Solicitud no encontrada.');
  });

  it('debe lanzar error 400 si la solicitud no está FINALIZADA ni COMPLETADA', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue({ ...validSolicitud, estado: ESTADOS.ACEPTADA });

    await expect(createEvaluacionUseCase.execute(validInput, 'am-1'))
      .rejects.toThrow('Solo se pueden evaluar tareas finalizadas o completadas.');
  });

  it('debe lanzar error 403 si el evaluador no participa en la solicitud', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(validSolicitud);

    await expect(createEvaluacionUseCase.execute(validInput, 'otro-user'))
      .rejects.toThrow('Solo el solicitante o el voluntario pueden evaluar esta tarea.');
  });

  it('debe lanzar error 409 si ya evaluó previamente', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(validSolicitud);
    evaluacionRepositoryMock.existsForSolicitudAndEvaluador.mockResolvedValue(true);

    await expect(createEvaluacionUseCase.execute(validInput, 'am-1'))
      .rejects.toThrow('Ya has evaluado esta solicitud.');
  });

  it('debe lanzar error 400 si la puntuación es inválida', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(validSolicitud);
    evaluacionRepositoryMock.existsForSolicitudAndEvaluador.mockResolvedValue(false);

    await expect(createEvaluacionUseCase.execute({ ...validInput, puntuacion: 6 }, 'am-1'))
      .rejects.toThrow('La puntuación debe ser un entero entre 1 y 5.');
  });
});
