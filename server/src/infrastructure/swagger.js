// ============================================================================
// Configuración Swagger/OpenAPI — RNF-MAN-02
// Equivalente a drf-spectacular en Django
// Documentación automática de la API REST
// ============================================================================

const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AllyUCT API',
      version: '1.0.0',
      description: 'Documentación oficial de la API REST para el sistema UCT-Vínculo Mayor. Plataforma de voluntariado que conecta estudiantes UCT con adultos mayores de Temuco.',
      contact: {
        name: 'Equipo de Desarrollo UCT',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido en /api/auth/login',
        },
      },
      schemas: {
        // ==========================================
        // Módulo de Usuarios (RF-USR)
        // ==========================================
        RegisterStudent: {
          type: 'object',
          required: ['email', 'password', 'rut', 'nombre', 'apellido'],
          properties: {
            email: { type: 'string', format: 'email', example: 'juan.perez@alu.uct.cl', description: 'Dominio @uct.cl o @alu.uct.cl (RF-USR-01)' },
            password: { type: 'string', minLength: 8, example: 'MiPass123' },
            rut: { type: 'string', example: '12345678-5', description: 'RUT chileno válido (módulo 11)' },
            nombre: { type: 'string', example: 'Juan' },
            apellido: { type: 'string', example: 'Pérez' },
          },
        },
        RegisterElderly: {
          type: 'object',
          required: ['email', 'password', 'rut', 'nombre', 'apellido', 'rol'],
          properties: {
            email: { type: 'string', format: 'email', example: 'maria@gmail.com' },
            password: { type: 'string', minLength: 8 },
            rut: { type: 'string', example: '98765432-1' },
            nombre: { type: 'string', example: 'María' },
            apellido: { type: 'string', example: 'Lagos' },
            rol: { type: 'string', enum: ['ADULTO_MAYOR', 'TUTOR'], description: 'RF-USR-02' },
            comuna: { type: 'string', example: 'Temuco' },
            direccion: { type: 'string', example: 'Av. Alemania 123' },
            telefono: { type: 'string', example: '+56912345678' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string', description: 'JWT Token' },
                user: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string' },
            nombre: { type: 'string' },
            apellido: { type: 'string' },
            rol: { type: 'string', enum: ['ESTUDIANTE', 'ADULTO_MAYOR', 'TUTOR', 'ADMIN'] },
            rut: { type: 'string' },
          },
        },

        // ==========================================
        // Módulo de Solicitudes (RF-SOL, RF-EMP, RF-EJE)
        // ==========================================
        CreateSolicitud: {
          type: 'object',
          required: ['titulo', 'descripcion', 'categoriaId', 'comuna', 'direccion', 'fechaProgramada', 'horaProgramada'],
          properties: {
            titulo: { type: 'string', example: 'Necesito ayuda con compras' },
            descripcion: { type: 'string', example: 'Compras en supermercado cercano' },
            categoriaId: { type: 'integer', example: 1 },
            comuna: { type: 'string', example: 'Temuco', description: 'RN-03: Solo Temuco o Padre Las Casas' },
            direccion: { type: 'string', example: 'Av. Alemania 456', description: 'RF-EMP-05: Oculta hasta aceptación' },
            fechaProgramada: { type: 'string', format: 'date', example: '2026-06-01', description: 'RN-05: Mínimo 24h anticipación' },
            horaProgramada: { type: 'string', example: '10:00', description: 'RN-04: Entre 08:00 y 20:00' },
          },
        },
        Solicitud: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            titulo: { type: 'string' },
            descripcion: { type: 'string' },
            estado: { type: 'string', enum: ['PENDIENTE', 'EN_CURSO', 'COMPLETADA', 'FINALIZADA', 'CANCELADA'] },
            comuna: { type: 'string' },
            fechaProgramada: { type: 'string', format: 'date' },
            horaProgramada: { type: 'string' },
            categoria: { type: 'object', properties: { id: { type: 'integer' }, nombre: { type: 'string' } } },
            solicitante: { $ref: '#/components/schemas/User' },
          },
        },

        // ==========================================
        // Módulo de Evaluaciones (RF-EJE-04)
        // ==========================================
        CreateEvaluacion: {
          type: 'object',
          required: ['solicitudId', 'puntuacion'],
          properties: {
            solicitudId: { type: 'integer' },
            puntuacion: { type: 'integer', minimum: 1, maximum: 5, description: 'Estrellas del 1 al 5' },
            comentario: { type: 'string' },
          },
        },

        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],

    // ==========================================
    // Definición de todos los endpoints
    // ==========================================
    paths: {
      // --- AUTH ---
      '/auth/register/student': {
        post: {
          tags: ['Autenticación'],
          summary: 'Registrar estudiante UCT (RF-USR-01)',
          description: 'Valida dominio @uct.cl o @alu.uct.cl y RUT módulo 11.',
          security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterStudent' } } } },
          responses: {
            201: { description: 'Estudiante registrado exitosamente' },
            400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/auth/register/elderly': {
        post: {
          tags: ['Autenticación'],
          summary: 'Registrar Adulto Mayor o Tutor (RF-USR-02)',
          description: 'Registro con RUT válido. Roles: ADULTO_MAYOR o TUTOR.',
          security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterElderly' } } } },
          responses: {
            201: { description: 'Usuario registrado' },
            400: { description: 'Datos inválidos' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Autenticación'],
          summary: 'Iniciar sesión (RF-USR-03)',
          description: 'Autentica con correo + contraseña. Retorna JWT.',
          security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
          responses: {
            200: { description: 'Login exitoso', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } } },
            401: { description: 'Credenciales inválidas' },
          },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Autenticación'],
          summary: 'Obtener perfil del usuario actual',
          responses: { 200: { description: 'Perfil del usuario' } },
        },
      },

      // --- SOLICITUDES ---
      '/solicitudes': {
        get: {
          tags: ['Solicitudes'],
          summary: 'Listar solicitudes con filtros (RF-EMP-01, RF-EMP-02)',
          description: 'Filtrables por categoría, comuna y estado. La dirección se oculta para no-participantes.',
          parameters: [
            { in: 'query', name: 'categoriaId', schema: { type: 'integer' } },
            { in: 'query', name: 'comuna', schema: { type: 'string' } },
            { in: 'query', name: 'estado', schema: { type: 'string' } },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          ],
          responses: { 200: { description: 'Lista paginada de solicitudes' } },
        },
        post: {
          tags: ['Solicitudes'],
          summary: 'Crear solicitud (RF-SOL-01, RF-SOL-02, RF-SOL-03)',
          description: 'Valida horario 08-20 (RN-04), anticipación 24h (RN-05).',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateSolicitud' } } } },
          responses: { 201: { description: 'Solicitud creada' }, 400: { description: 'Validación fallida' } },
        },
      },
      '/solicitudes/mine': {
        get: {
          tags: ['Solicitudes'],
          summary: 'Mis solicitudes',
          responses: { 200: { description: 'Solicitudes del usuario actual' } },
        },
      },
      '/solicitudes/{id}': {
        get: {
          tags: ['Solicitudes'],
          summary: 'Detalle de solicitud (RF-EMP-02, RF-EMP-05)',
          description: 'Dirección visible solo para participantes aceptados.',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Detalle completo' }, 404: { description: 'No encontrada' } },
        },
        put: {
          tags: ['Solicitudes'],
          summary: 'Editar solicitud (RF-SOL-04)',
          description: 'Solo si estado = PENDIENTE y es el creador.',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Solicitud actualizada' } },
        },
        delete: {
          tags: ['Solicitudes'],
          summary: 'Cancelar solicitud pendiente (RF-SOL-04)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Solicitud cancelada' } },
        },
      },
      '/solicitudes/{id}/accept': {
        post: {
          tags: ['Ciclo de Vida'],
          summary: 'Aceptar solicitud (RF-EMP-03, RF-EMP-04)',
          description: 'Solo estudiantes. Máximo 2 activas (RF-EMP-04). Transacción atómica.',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Solicitud aceptada' }, 409: { description: 'Ya aceptada o límite alcanzado' } },
        },
      },
      '/solicitudes/{id}/cancel-acceptance': {
        post: {
          tags: ['Ciclo de Vida'],
          summary: 'Cancelar tarea aceptada (RF-EJE-01)',
          description: 'Si <4h antes = inasistencia (RN-08). 3 inasistencias = suspensión (RN-09).',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Cancelación procesada' } },
        },
      },
      '/solicitudes/{id}/complete': {
        post: {
          tags: ['Ciclo de Vida'],
          summary: 'Marcar como completada (RF-EJE-02)',
          description: 'Solo el voluntario asignado. Estado: EN_CURSO → COMPLETADA.',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Solicitud completada' } },
        },
      },
      '/solicitudes/{id}/confirm': {
        post: {
          tags: ['Ciclo de Vida'],
          summary: 'Confirmar recepción (RF-EJE-03, RF-EJE-06, RN-11)',
          description: 'Solo el solicitante. Acredita horas al voluntario. COMPLETADA → FINALIZADA.',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Servicio confirmado' } },
        },
      },
      '/solicitudes/admin/auto-approve': {
        post: {
          tags: ['Administración'],
          summary: 'Auto-aprobar tras 48h (RF-EJE-05, RN-12)',
          description: 'Aprueba automáticamente solicitudes completadas sin respuesta en 48h.',
          responses: { 200: { description: 'Solicitudes auto-aprobadas' } },
        },
      },

      // --- EVALUACIONES ---
      '/evaluaciones': {
        post: {
          tags: ['Evaluaciones'],
          summary: 'Crear evaluación (RF-EJE-04)',
          description: 'Puntuación 1-5 estrellas. Anti-duplicado. Solo participantes.',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateEvaluacion' } } } },
          responses: { 201: { description: 'Evaluación creada' } },
        },
      },
      '/evaluaciones/solicitud/{id}': {
        get: {
          tags: ['Evaluaciones'],
          summary: 'Ver evaluaciones de una solicitud',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Lista de evaluaciones' } },
        },
      },

      // --- CATEGORÍAS ---
      '/categorias': {
        get: {
          tags: ['Categorías'],
          summary: 'Listar categorías (RF-SOL-01)',
          security: [],
          responses: { 200: { description: 'Lista de categorías predefinidas' } },
        },
      },
    },
  },
  apis: [], // Usamos definición inline, no JSDoc
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
