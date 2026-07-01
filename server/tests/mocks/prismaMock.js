// Mock global de @prisma/client para tests de integracion
// Permite simular una base de datos en memoria para los flujos E2E.

const createJestFn = (impl) => {
  if (typeof jest !== 'undefined' && jest.fn) {
    return jest.fn(impl);
  }

  return async (...args) => impl(...args);
};

class PrismaClientMock {
  constructor() {
    this.users = [];
    this.refreshTokens = [];
    this.solicitudes = [];
    this.categorias = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nombre: 'Compras',
        descripcion: 'Ayuda para compras',
        activa: true,
      },
    ];
    this.evaluaciones = [];

    this.user = this.createModelHandlers('user', this.users);
    this.solicitud = this.createModelHandlers('solicitud', this.solicitudes);
    this.categoria = this.createModelHandlers('categoria', this.categorias);
    this.refreshToken = this.createModelHandlers('refreshToken', this.refreshTokens);
    this.evaluacion = this.createModelHandlers('evaluacion', this.evaluaciones);

    this.$transaction = createJestFn(async (callback) => callback(this));
    this.$connect = createJestFn(async () => undefined);
    this.$disconnect = createJestFn(async () => undefined);
  }

  createModelHandlers(modelName, store) {
    return {
      findUnique: createJestFn(async ({ where, include } = {}) => {
        if (!where) return null;
        const item = store.find((entry) => Object.entries(where).every(([key, value]) => entry[key] === value)) || null;
        return include ? this.attachRelations(modelName, item, include) : item;
      }),
      findMany: createJestFn(async ({ where = {}, include, orderBy, skip, take } = {}) => {
        let items = store.filter((entry) => Object.entries(where).every(([key, value]) => {
          if (value && typeof value === 'object' && value.contains) {
            return String(entry[key]).toLowerCase().includes(String(value.contains).toLowerCase());
          }
          if (value && typeof value === 'object' && value.mode === 'insensitive') {
            return String(entry[key]).toLowerCase() === String(value.equals || value).toLowerCase();
          }
          return entry[key] === value;
        }));

        if (orderBy) {
          const [field, direction] = Object.entries(orderBy)[0];
          items = [...items].sort((a, b) => {
            const left = a[field];
            const right = b[field];
            return direction === 'desc' ? (left > right ? -1 : 1) : (left > right ? 1 : -1);
          });
        }

        if (typeof skip === 'number') items = items.slice(skip);
        if (typeof take === 'number') items = items.slice(0, take);

        return items.map((item) => (include ? this.attachRelations(modelName, item, include) : item));
      }),
      create: createJestFn(async ({ data, include }) => {
        const payload = data || {};
        const item = {
          id: this.generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          estado: 'PENDIENTE',
          ...payload,
        };
        store.push(item);
        return include ? this.attachRelations(modelName, item, include) : item;
      }),
      update: createJestFn(async ({ where, data, include }) => {
        const index = store.findIndex((entry) => Object.entries(where).every(([key, value]) => entry[key] === value));
        if (index === -1) throw new Error('Record not found');
        const updated = { ...store[index], ...data, updatedAt: new Date() };
        store[index] = updated;
        return include ? this.attachRelations(modelName, updated, include) : updated;
      }),
      delete: createJestFn(async ({ where }) => {
        const index = store.findIndex((entry) => Object.entries(where).every(([key, value]) => entry[key] === value));
        if (index === -1) throw new Error('Record not found');
        const [removed] = store.splice(index, 1);
        return removed;
      }),
      count: createJestFn(async ({ where = {} } = {}) => {
        return store.filter((entry) => Object.entries(where).every(([key, value]) => entry[key] === value)).length;
      }),
      updateMany: createJestFn(async ({ where = {}, data }) => {
        const items = store.filter((entry) => Object.entries(where).every(([key, value]) => entry[key] === value));
        items.forEach((entry) => Object.assign(entry, data));
        return { count: items.length };
      }),
    };
  }

  attachRelations(modelName, item, include) {
    if (!item) return null;

    if (modelName === 'solicitud') {
      if (include?.categoria) {
        return { ...item, categoria: this.categorias.find((entry) => entry.id === item.categoriaId) || null };
      }
      if (include?.solicitante) {
        return { ...item, solicitante: this.users.find((entry) => entry.id === item.solicitanteId) || null };
      }
      if (include?.voluntario) {
        return { ...item, voluntario: this.users.find((entry) => entry.id === item.voluntarioId) || null };
      }
    }

    if (modelName === 'evaluacion') {
      if (include?.evaluador) {
        return { ...item, evaluador: this.users.find((entry) => entry.id === item.evaluadorId) || null };
      }
      if (include?.evaluado) {
        return { ...item, evaluado: this.users.find((entry) => entry.id === item.evaluadoId) || null };
      }
    }

    return item;
  }

  generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

module.exports = { PrismaClient: PrismaClientMock };
