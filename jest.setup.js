import '@testing-library/jest-dom'
import 'dotenv/config';
jest.mock('@/lib/supabase', () => require('./__tests__/mocks/supabase'));
const eventosData = [
  { id: 1, nombre: 'Evento Test', activo: true },
  { id: 2, nombre: 'Evento Inactivo', activo: false }
];
const usuariosData = [
  { id: 1, email: 'test@test.com', activo: true },
  { id: 2, email: 'inactivo@test.com', activo: false }
];
const comandasData = [
  { id: 1, evento_id: 1, usuario_id: 1, estado: 'pendiente' }
];
function getTableData(table) {
  if (table === 'eventos') return eventosData;
  if (table === 'usuarios') return usuariosData;
  if (table === 'comandas') return comandasData;
  return [];
}
const createMockSupabase = () => ({
  from: jest.fn((table) => ({
    select: jest.fn(() => ({
      eq: jest.fn((col, val) => ({
        single: jest.fn(() => {
          const data = getTableData(table).find((row) => row[col] === val);
          if (!data) return Promise.resolve({ data: null, error: { message: 'No encontrado' } });
          return Promise.resolve({ data, error: null });
        }),
        order: jest.fn(() => Promise.resolve({ data: getTableData(table), error: null }))
      })),
      in: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: getTableData(table), error: null }))
      })),
      order: jest.fn(() => Promise.resolve({ data: getTableData(table), error: null }))
    })),
    insert: jest.fn((data) => ({
      select: jest.fn(() => ({
        single: jest.fn(() => {
          if (table === 'comandas' && (!data.usuario_id || !data.evento_id)) {
            return Promise.resolve({ data: null, error: { message: 'Datos incompletos' } });
          }
          return Promise.resolve({ data: { id: 99, ...data }, error: null });
        })
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: 1 }, error: null }))
        }))
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null }))
    }))
  })),
  auth: {
    signInWithPassword: jest.fn(({ email, password }) => {
      if (email === 'test@test.com' && password === '1234') {
        return Promise.resolve({ data: { user: { id: 1, email, rol: 'admin' } }, error: null });
      }
      if (email === 'inactivo@test.com') {
        return Promise.resolve({ data: null, error: { message: 'Usuario inactivo' } });
      }
      return Promise.resolve({ data: null, error: { message: 'Credenciales inválidas' } });
    }),
    getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 1 } }, error: null }))
  }
});
const mockSupabase = createMockSupabase();
global.mockSupabase = mockSupabase;
