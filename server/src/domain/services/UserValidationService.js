// ============================================================================
// Servicio de Dominio: UserValidationService
// Capa: Domain (lógica de negocio pura, sin dependencias externas)
// RF: RF-USR-01, RF-USR-02
// RN: RN-02, RN-03
// ============================================================================

const { DOMINIOS_UCT } = require('../entities/User');

/**
 * Comunas permitidas por RN-03.
 * El voluntariado se limita a Temuco y Padre Las Casas.
 */
const COMUNAS_PERMITIDAS = Object.freeze([
  'temuco',
  'padre las casas',
]);

class UserValidationService {
  /**
   * Valida que el email pertenezca a un dominio institucional UCT.
   * RF-USR-01: Solo @uct.cl y @alu.uct.cl
   * RN-02: Solo estudiantes regulares
   * @param {string} email
   * @returns {{ valid: boolean, error?: string }}
   */
  static validarEmailEstudiante(email) {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'El email es requerido.' };
    }

    const emailNormalizado = email.toLowerCase().trim();
    const esDominioUCT = DOMINIOS_UCT.some((dominio) =>
      emailNormalizado.endsWith(dominio)
    );

    if (!esDominioUCT) {
      return {
        valid: false,
        error: `El email debe pertenecer a un dominio institucional UCT (${DOMINIOS_UCT.join(', ')}).`,
      };
    }

    return { valid: true };
  }

  /**
   * Valida el formato del RUT chileno.
   * RF-USR-02: RUT válido
   * Formato aceptado: 12345678-9 o 12.345.678-9
   * @param {string} rut
   * @returns {{ valid: boolean, error?: string }}
   */
  static validarRut(rut) {
    if (!rut || typeof rut !== 'string') {
      return { valid: false, error: 'El RUT es requerido.' };
    }

    // Limpiar puntos y guiones para validación
    const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '').trim();

    if (rutLimpio.length < 2) {
      return { valid: false, error: 'El RUT es inválido.' };
    }

    const cuerpo = rutLimpio.slice(0, -1);
    const digitoVerificador = rutLimpio.slice(-1).toUpperCase();

    // Validar que el cuerpo sean solo dígitos
    if (!/^\d+$/.test(cuerpo)) {
      return { valid: false, error: 'El RUT contiene caracteres inválidos.' };
    }

    // Calcular dígito verificador esperado
    const digitoCalculado = UserValidationService.calcularDigitoVerificador(cuerpo);

    if (digitoCalculado !== digitoVerificador) {
      return { valid: false, error: 'El dígito verificador del RUT no es válido.' };
    }

    return { valid: true };
  }

  /**
   * Calcula el dígito verificador de un RUT chileno (módulo 11).
   * @param {string} cuerpo - Parte numérica del RUT (sin DV)
   * @returns {string} Dígito verificador calculado
   */
  static calcularDigitoVerificador(cuerpo) {
    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i], 10) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = 11 - (suma % 11);

    if (resto === 11) return '0';
    if (resto === 10) return 'K';
    return resto.toString();
  }

  /**
   * Valida que la comuna esté dentro del rango geográfico permitido.
   * RN-03: Solo Temuco y Padre Las Casas.
   * @param {string} comuna
   * @returns {{ valid: boolean, error?: string }}
   */
  static validarComuna(comuna) {
    if (!comuna || typeof comuna !== 'string') {
      return { valid: false, error: 'La comuna es requerida.' };
    }

    const comunaNormalizada = comuna.toLowerCase().trim();
    const esPermitida = COMUNAS_PERMITIDAS.includes(comunaNormalizada);

    if (!esPermitida) {
      return {
        valid: false,
        error: `El servicio solo está disponible en: ${COMUNAS_PERMITIDAS.join(', ')}.`,
      };
    }

    return { valid: true };
  }

  /**
   * Normaliza un RUT al formato estándar (sin puntos, con guión).
   * @param {string} rut
   * @returns {string} RUT normalizado: "12345678-9"
   */
  static normalizarRut(rut) {
    const limpio = rut.replace(/\./g, '').trim();
    if (limpio.includes('-')) return limpio.toUpperCase();

    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);
    return `${cuerpo}-${dv}`.toUpperCase();
  }

  /**
   * Asigna rol automáticamente basado en dominio de email.
   * Equivalente a: CustomUserManager._validate_email_domain() en Django
   * @uct.cl / @alu.uct.cl → ESTUDIANTE
   * Otros dominios → ADULTO_MAYOR
   * @param {string} email
   * @returns {string} Rol asignado
   */
  static assignRoleByEmailDomain(email) {
    if (!email) return 'ADULTO_MAYOR';
    const emailNorm = email.toLowerCase().trim();
    const esDominioUCT = DOMINIOS_UCT.some((d) => emailNorm.endsWith(d));
    return esDominioUCT ? 'ESTUDIANTE' : 'ADULTO_MAYOR';
  }
}

module.exports = { UserValidationService, COMUNAS_PERMITIDAS };
