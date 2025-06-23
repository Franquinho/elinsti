import '@testing-library/jest-dom'
import 'dotenv/config';

// Mock global de Supabase - se aplica antes de cualquier importación
const createMockSupabase = () => {
  const mock = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: undefined, error: null }),
    // Métodos terminales típicos de Supabase
    then: undefined, // para evitar que Jest trate el mock como una promesa
    auth: {
      signInWithPassword: jest.fn(),
    },
  };

  // Asegurar que todos los métodos devuelvan el mismo objeto
  Object.keys(mock).forEach(key => {
    if (typeof mock[key] === 'function' && key !== 'single' && key !== 'auth') {
      mock[key].mockReturnValue(mock);
    }
  });

  return mock;
};

const mockSupabase = createMockSupabase();

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: mockSupabase,
  supabase: mockSupabase,
}));

// Exportar el mock para que los tests puedan acceder a él
global.mockSupabase = mockSupabase;

// Aquí puedes añadir cualquier otra configuración global para las pruebas 