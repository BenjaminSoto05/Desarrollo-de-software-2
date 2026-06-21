// ============================================================================
// Tests Unitarios: Entidad Categoria
// Capa: Domain
// ============================================================================

const { Categoria, CATEGORIAS_PROHIBIDAS } = require('../../../../src/domain/entities/Categoria');

describe('Categoria Entity', () => {
  describe('constructor', () => {
    test('debe crear una categoría con propiedades correctas', () => {
      const cat = new Categoria({ nombre: 'Compras', descripcion: 'Ayuda con compras' });
      expect(cat.nombre).toBe('Compras');
      expect(cat.descripcion).toBe('Ayuda con compras');
      expect(cat.activa).toBe(true);
      expect(cat.id).toBeNull();
    });

    test('debe respetar el valor de activa si se proporciona', () => {
      const cat = new Categoria({ nombre: 'Inactiva', activa: false });
      expect(cat.activa).toBe(false);
    });
  });

  describe('esProhibida() — RN-07', () => {
    test('debe detectar "medicina" como prohibida', () => {
      const cat = new Categoria({ nombre: 'Medicina general' });
      expect(cat.esProhibida()).toBe(true);
    });

    test('debe detectar "electricidad" como prohibida', () => {
      const cat = new Categoria({ nombre: 'Electricidad domiciliaria' });
      expect(cat.esProhibida()).toBe(true);
    });

    test('debe detectar "conducción" como prohibida', () => {
      const cat = new Categoria({ nombre: 'Conducción de vehículos' });
      expect(cat.esProhibida()).toBe(true);
    });

    test('debe detectar "conduccion" (sin tilde) como prohibida', () => {
      const cat = new Categoria({ nombre: 'Conduccion' });
      expect(cat.esProhibida()).toBe(true);
    });

    test('debe detectar "riesgo físico" como prohibida', () => {
      const cat = new Categoria({ nombre: 'Riesgo físico extremo' });
      expect(cat.esProhibida()).toBe(true);
    });

    test('debe ser case-insensitive', () => {
      const cat = new Categoria({ nombre: 'MEDICINA' });
      expect(cat.esProhibida()).toBe(true);
    });

    test('NO debe marcar "Compras" como prohibida', () => {
      const cat = new Categoria({ nombre: 'Compras' });
      expect(cat.esProhibida()).toBe(false);
    });

    test('NO debe marcar "Acompañamiento" como prohibida', () => {
      const cat = new Categoria({ nombre: 'Acompañamiento' });
      expect(cat.esProhibida()).toBe(false);
    });

    test('NO debe marcar "Trámites" como prohibida', () => {
      const cat = new Categoria({ nombre: 'Trámites bancarios' });
      expect(cat.esProhibida()).toBe(false);
    });
  });
});
