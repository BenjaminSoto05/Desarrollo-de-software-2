const { Categoria } = require('../../../../src/domain/entities/Categoria');

describe('Categoria Entity', () => {
  describe('constructor', () => {
    test('crea con propiedades correctas', () => {
      const cat = new Categoria({ nombre: 'Compras', descripcion: 'Ayuda con compras' });
      expect(cat.nombre).toBe('Compras');
      expect(cat.activa).toBe(true);
    });
  });

  describe('esProhibida() — RN-07', () => {
    test('medicina prohibida', () => { expect(new Categoria({ nombre: 'Medicina general' }).esProhibida()).toBe(true); });
    test('electricidad prohibida', () => { expect(new Categoria({ nombre: 'Electricidad' }).esProhibida()).toBe(true); });
    test('conducción prohibida', () => { expect(new Categoria({ nombre: 'Conducción' }).esProhibida()).toBe(true); });
    test('conduccion sin tilde', () => { expect(new Categoria({ nombre: 'Conduccion' }).esProhibida()).toBe(true); });
    test('riesgo físico prohibido', () => { expect(new Categoria({ nombre: 'Riesgo físico' }).esProhibida()).toBe(true); });
    test('case-insensitive', () => { expect(new Categoria({ nombre: 'MEDICINA' }).esProhibida()).toBe(true); });
    test('Compras NO prohibida', () => { expect(new Categoria({ nombre: 'Compras' }).esProhibida()).toBe(false); });
    test('Acompañamiento NO prohibida', () => { expect(new Categoria({ nombre: 'Acompañamiento' }).esProhibida()).toBe(false); });
    test('Trámites NO prohibida', () => { expect(new Categoria({ nombre: 'Trámites' }).esProhibida()).toBe(false); });
  });
});
