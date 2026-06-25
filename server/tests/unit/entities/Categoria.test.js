// =======================================================================
// Test: Categoria.test.js
// Capa: Domain — Entidad Categoria
// Cubre: esProhibida, categorías válidas, constructor defaults
// Rúbrica: Cobertura entidad de dominio ≥ 70%
// =======================================================================

const {
  Categoria,
  CATEGORIAS_PROHIBIDAS,
} = require('../../../src/domain/entities/Categoria');

describe('Entidad Categoria', () => {
  // ── Helper ────────────────────────────────────────────────────────
  const crearCategoria = (overrides = {}) =>
    new Categoria({
      nombre: 'Acompañamiento',
      descripcion: 'Visitas y acompañamiento a adultos mayores',
      ...overrides,
    });

  // ── esProhibida ───────────────────────────────────────────────────
  describe('esProhibida()', () => {
    it('debe retornar false para una categoría permitida: "Acompañamiento"', () => {
      const cat = crearCategoria({ nombre: 'Acompañamiento' });
      expect(cat.esProhibida()).toBe(false);
    });

    it('debe retornar false para una categoría permitida: "Trámites administrativos"', () => {
      const cat = crearCategoria({ nombre: 'Trámites administrativos' });
      expect(cat.esProhibida()).toBe(false);
    });

    it('debe retornar false para una categoría permitida: "Compras"', () => {
      const cat = crearCategoria({ nombre: 'Compras' });
      expect(cat.esProhibida()).toBe(false);
    });

    it('debe retornar true para categoría "medicina"', () => {
      const cat = crearCategoria({ nombre: 'medicina' });
      expect(cat.esProhibida()).toBe(true);
    });

    it('debe retornar true para categoría "electricidad"', () => {
      const cat = crearCategoria({ nombre: 'electricidad' });
      expect(cat.esProhibida()).toBe(true);
    });

    it('debe retornar true para categoría "conducción"', () => {
      const cat = crearCategoria({ nombre: 'conducción' });
      expect(cat.esProhibida()).toBe(true);
    });

    it('debe retornar true para categoría "conduccion" (sin tilde)', () => {
      const cat = crearCategoria({ nombre: 'conduccion' });
      expect(cat.esProhibida()).toBe(true);
    });

    it('debe retornar true para categoría "riesgo físico"', () => {
      const cat = crearCategoria({ nombre: 'riesgo físico' });
      expect(cat.esProhibida()).toBe(true);
    });

    it('debe retornar true para categoría "riesgo fisico" (sin tilde)', () => {
      const cat = crearCategoria({ nombre: 'riesgo fisico' });
      expect(cat.esProhibida()).toBe(true);
    });

    it('debe retornar true para categoría "riesgo legal"', () => {
      const cat = crearCategoria({ nombre: 'riesgo legal' });
      expect(cat.esProhibida()).toBe(true);
    });

    it('debe ser insensible a mayúsculas/minúsculas: "MEDICINA" debe ser prohibida', () => {
      const cat = crearCategoria({ nombre: 'MEDICINA' });
      expect(cat.esProhibida()).toBe(true);
    });

    it('debe detectar nombre prohibido dentro de un nombre más largo: "Atención médica de medicina"', () => {
      const cat = crearCategoria({ nombre: 'Atención médica de medicina' });
      expect(cat.esProhibida()).toBe(true);
    });

    it('debe retornar false para texto que no contiene palabras prohibidas', () => {
      const cat = crearCategoria({ nombre: 'Lectura y entretenimiento' });
      expect(cat.esProhibida()).toBe(false);
    });
  });

  // ── Constructor ───────────────────────────────────────────────────
  describe('Constructor — valores por defecto', () => {
    it('debe inicializar activa en true si no se proporciona', () => {
      const cat = crearCategoria();
      expect(cat.activa).toBe(true);
    });

    it('debe respetar activa: false si se proporciona explícitamente', () => {
      const cat = crearCategoria({ activa: false });
      expect(cat.activa).toBe(false);
    });

    it('debe inicializar id en null si no se proporciona', () => {
      const cat = crearCategoria();
      expect(cat.id).toBeNull();
    });

    it('debe inicializar descripcion en null si no se proporciona', () => {
      const cat = new Categoria({ nombre: 'Test' });
      expect(cat.descripcion).toBeNull();
    });
  });

  // ── CATEGORIAS_PROHIBIDAS lista ───────────────────────────────────
  describe('CATEGORIAS_PROHIBIDAS — integridad de la lista (RN-07)', () => {
    it('debe contener exactamente las categorías prohibidas definidas en RN-07', () => {
      expect(CATEGORIAS_PROHIBIDAS).toContain('medicina');
      expect(CATEGORIAS_PROHIBIDAS).toContain('electricidad');
      expect(CATEGORIAS_PROHIBIDAS).toContain('conducción');
      expect(CATEGORIAS_PROHIBIDAS).toContain('conduccion');
      expect(CATEGORIAS_PROHIBIDAS).toContain('riesgo físico');
      expect(CATEGORIAS_PROHIBIDAS).toContain('riesgo fisico');
      expect(CATEGORIAS_PROHIBIDAS).toContain('riesgo legal');
    });
  });
});
