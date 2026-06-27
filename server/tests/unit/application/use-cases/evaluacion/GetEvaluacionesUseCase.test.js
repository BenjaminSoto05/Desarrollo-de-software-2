const GetEvaluacionesUseCase = require('../../../../../src/application/use-cases/evaluacion/GetEvaluacionesUseCase');

describe('GetEvaluacionesUseCase', () => {
  let evaluacionRepositoryMock;
  let getEvaluacionesUseCase;

  beforeEach(() => {
    evaluacionRepositoryMock = {
      findBySolicitud: jest.fn(),
    };
    getEvaluacionesUseCase = new GetEvaluacionesUseCase(evaluacionRepositoryMock);
  });

  it('debe retornar las evaluaciones de una solicitud', async () => {
    const mockEvaluaciones = [
      { id: 'eval-1', puntuacion: 5, comentario: 'Excelente' },
    ];
    evaluacionRepositoryMock.findBySolicitud.mockResolvedValue(mockEvaluaciones);

    const result = await getEvaluacionesUseCase.execute('solicitud-1');

    expect(evaluacionRepositoryMock.findBySolicitud).toHaveBeenCalledWith('solicitud-1');
    expect(result).toEqual(mockEvaluaciones);
  });
});
