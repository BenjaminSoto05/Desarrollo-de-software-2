const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        // Node.js globals
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
      },
    },
    rules: {
      // Permitir parámetros no usados si empiezan con _ o son de Express (req, res, next)
      // También permite destructuring con variables no usadas (rest siblings)
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_|^next$|^req$|^res$',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      }],
      'no-console': 'off',
    },
  },
  {
    // Archivos de repositorio abstracto: los parámetros no usados son intencionales
    files: ['src/domain/repositories/**/*.js'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
  {
    // Ignorar archivos que no necesitan lint
    ignores: ['node_modules/', 'coverage/', 'prisma/migrations/', 'tests/'],
  },
];
