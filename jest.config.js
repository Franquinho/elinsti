const nextJest = require('next/jest')

// Proporciona la ruta a tu aplicación Next.js para cargar next.config.js y .env en el entorno de prueba
const createJestConfig = nextJest({
  dir: './',
})

// Agrega cualquier configuración personalizada de Jest que desees
const customJestConfig = {
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/__tests__/mocks/'],
  moduleNameMapper: {
    // Manejar alias de módulo (esto se debe ajustar a tu tsconfig.json)
    '^@/(.*)$': '<rootDir>/$1',
  },
}

// createJestConfig se exporta de esta manera para asegurar que next/jest pueda cargar la configuración de Next.js
module.exports = createJestConfig(customJestConfig) 