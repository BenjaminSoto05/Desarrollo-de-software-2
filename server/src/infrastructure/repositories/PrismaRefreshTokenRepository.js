// ============================================================================
// Implementación: PrismaRefreshTokenRepository
// Capa: Infrastructure — Implementa el contrato de domain/repositories
// ============================================================================

const RefreshTokenRepository = require('../../domain/repositories/RefreshTokenRepository');

class PrismaRefreshTokenRepository extends RefreshTokenRepository {
  /**
   * @param {import('@prisma/client').PrismaClient} prisma
   */
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async create(data) {
    return this.prisma.refreshToken.create({
      data: {
        tokenHash: data.tokenHash,
        userId: data.userId,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findByTokenHash(tokenHash) {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
  }

  async revoke(tokenHash) {
    return this.prisma.refreshToken.update({
      where: { tokenHash },
      data: { revoked: true },
    });
  }

  async revokeAllByUserId(userId) {
    const result = await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
    return result.count;
  }
}

module.exports = PrismaRefreshTokenRepository;
