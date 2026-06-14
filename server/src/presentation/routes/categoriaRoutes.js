// ============================================================================
// Rutas: Categorías
// Capa: Presentation
// ============================================================================

const { Router } = require('express');

// Infraestructura
const prisma = require('../../infrastructure/database/prismaClient');
const PrismaCategoriaRepository = require('../../infrastructure/repositories/PrismaCategoriaRepository');

// Use Cases
const GetCategoriasUseCase = require('../../application/use-cases/categoria/GetCategoriasUseCase');

// Controller
const CategoriaController = require('../controllers/CategoriaController');

// Dependency Injection
const categoriaRepository = new PrismaCategoriaRepository(prisma);
const categoriaController = new CategoriaController({
  getCategorias: new GetCategoriasUseCase(categoriaRepository),
});

// Rutas
const router = Router();

/**
 * GET /api/categorias
 * Listado público de categorías activas (no requiere auth)
 */
router.get('/', categoriaController.handleGetAll);

module.exports = router;
