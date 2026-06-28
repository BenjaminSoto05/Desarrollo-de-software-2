module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/unit/**/*.test.js',
    '**/integration/**/*.test.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/app.js',
    '!src/infrastructure/swagger.js',
  ],
  coverageThreshold: {
    './src/domain/entities/': {
      lines: 90,
      functions: 90,
      branches: 90,
      statements: 90,
    },
    './src/domain/services/': {
      lines: 90,
      functions: 90,
      branches: 85,
      statements: 90,
    },
    './src/application/use-cases/': {
      lines: 70,
      functions: 70,
      branches: 60,
      statements: 70,
    },
  },
  coverageDirectory: 'coverage',
  verbose: true,
  clearMocks: true,
  resetModules: true,
};
