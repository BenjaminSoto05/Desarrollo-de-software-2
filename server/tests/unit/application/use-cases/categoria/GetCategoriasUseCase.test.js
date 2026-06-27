const GetCategoriasUseCase = require('../../../../../src/application/use-cases/categoria/GetCategoriasUseCase');

describe('GetCategoriasUseCase', () => {
  let categoriaRepositoryMock;
  let getCategoriasUseCase;

  beforeEach(() => {
    categoriaRepositoryMock = {
      findAllActive: jest.fn(),
    };
    getCategoriasUseCase = new GetCategoriasUseCase(categoriaRepositoryMock);
  });

  it('debe retornar todas las categorías activas', async () => {
    const mockCategorias = [
      { id: 'cat-1', nombre: 'Acompañamiento', activa: true },
      { id: 'cat-2', nombre: 'Trámites', activa: true },
    ];
    categoriaRepositoryMock.findAllActive.mockResolvedValue(mockCategorias);

    const result = await getCategoriasUseCase.execute();

    expect(categoriaRepositoryMock.findAllActive).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockCategorias);
  });
});
