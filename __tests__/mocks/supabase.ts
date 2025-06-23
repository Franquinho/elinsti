// Mock completo de Supabase para pruebas
export const supabaseAdmin = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      in: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      order: jest.fn(() => Promise.resolve({ data: [], error: null }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: { id: 1, nombre: 'Test Producto', precio: 10, emoji: '🧪', activo: true }, error: null }))
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: 1, nombre: 'Producto Actualizado', precio: 10, emoji: '🧪', activo: true }, error: null }))
        }))
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null }))
    }))
  }))
};

export const supabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: { id: 1, nombre: 'Test User', rol: 'administrador' }, error: null })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      in: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      order: jest.fn(() => Promise.resolve({ data: [], error: null }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: { id: 1 }, error: null }))
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
    signInWithPassword: jest.fn(() => Promise.resolve({ data: { user: { id: 1 } }, error: null })),
    getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 1 } }, error: null }))
  }
}; 