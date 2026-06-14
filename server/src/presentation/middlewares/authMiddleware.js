// ============================================================================
// Middleware: Autenticación JWT
// Capa: Presentation
// Verifica el token JWT y adjunta el usuario al request
// ============================================================================

const JwtService = require('../../infrastructure/services/JwtService');

const jwtService = new JwtService(
  process.env.JWT_SECRET,
  process.env.JWT_EXPIRES_IN
);

/**
 * Middleware que verifica el token JWT del header Authorization.
 * Si es válido, adjunta `req.user` con { id, email, rol }.
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Acceso denegado. Token no proporcionado.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwtService.verifyToken(token);

    // Adjuntar datos del usuario al request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado. Inicia sesión nuevamente.',
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Token inválido.',
    });
  }
}

module.exports = authMiddleware;
