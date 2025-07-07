// Mock completo de Supabase para todos los flujos del sistema
const eventosData = [
  { id: 1, nombre: 'Noche de Jazz', activo: true, fecha: '2024-01-15' },
  { id: 2, nombre: 'Rock Night', activo: false, fecha: '2024-01-20' }
];

const usuariosData = [
  { id: 1, email: 'test@test.com', nombre: 'Test User', rol: 'admin', activo: true },
  { id: 2, email: 'inactivo@test.com', nombre: 'Usuario Inactivo', rol: 'user', activo: false }
];

const comandasData = [
  { id: 1, evento_id: 1, usuario_id: 1, estado: 'pendiente', total: 100 },
  { id: 2, evento_id: 1, usuario_id: 1, estado: 'pagado', total: 150 }
];

const productosData = [
  { id: 1, nombre: 'Café', precio: 25, activo: true },
  { id: 2, nombre: 'Té', precio: 20, activo: true },
  { id: 3, nombre: 'Producto Inactivo', precio: 30, activo: false }
];

const comandaItemsData = [
  { id: 1, comanda_id: 1, producto_id: 1, cantidad: 2, precio_unitario: 25, subtotal: 50 },
  { id: 2, comanda_id: 1, producto_id: 2, cantidad: 1, precio_unitario: 20, subtotal: 20 },
  { id: 3, comanda_id: 2, producto_id: 1, cantidad: 3, precio_unitario: 25, subtotal: 75 }
];

const logsData = [
  { id: 1, accion: 'login', usuario_id: 1, timestamp: '2024-01-01T10:00:00Z' },
  { id: 2, accion: 'comanda_creada', usuario_id: 1, timestamp: '2024-01-01T11:00:00Z' }
];

function getTableData(table: string) {
  switch (table) {
    case 'eventos': return eventosData;
    case 'usuarios': return usuariosData;
    case 'comandas': return comandasData;
    case 'productos': return productosData;
    case 'comanda_items': return comandaItemsData;
    case 'logs': return logsData;
    default: return [];
  }
}

const supabaseMock = {
  from: jest.fn((table: string) => ({
    select: jest.fn(() => ({
      eq: jest.fn((col: string, val: any) => ({
        single: jest.fn(() => {
          const data = getTableData(table).find((row: any) => row[col] === val);
          if (!data) return Promise.resolve({ data: null, error: { message: 'No encontrado' } });
          return Promise.resolve({ data, error: null });
        }),
        order: jest.fn(() => Promise.resolve({ data: getTableData(table), error: null })),
        gte: jest.fn(() => ({
          lte: jest.fn(() => Promise.resolve({ data: getTableData(table), error: null }))
        })),
        lte: jest.fn(() => Promise.resolve({ data: getTableData(table), error: null }))
      })),
      in: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: getTableData(table), error: null }))
      })),
      order: jest.fn(() => {
        // Mock específico para productos activos
        if (table === 'productos') {
          const activeProducts = productosData.filter(p => p.activo);
          return Promise.resolve({ data: activeProducts, error: null });
        }
        return Promise.resolve({ data: getTableData(table), error: null });
      }),
      gte: jest.fn(() => ({
        lte: jest.fn(() => Promise.resolve({ data: getTableData(table), error: null }))
      })),
      lte: jest.fn(() => Promise.resolve({ data: getTableData(table), error: null }))
    })),
    insert: jest.fn((data: any) => ({
      select: jest.fn(() => ({
        single: jest.fn(() => {
          if (table === 'comandas' && (!data.usuario_id || !data.evento_id)) {
            return Promise.resolve({ data: null, error: { message: 'Datos incompletos' } });
          }
          const newId = Math.max(...getTableData(table).map((item: any) => item.id)) + 1;
          const newItem = { id: newId, ...data };
          return Promise.resolve({ data: newItem, error: null });
        })
      }))
    })),
    update: jest.fn((updateData: any) => ({
      eq: jest.fn((col: string, val: any) => ({
        select: jest.fn(() => ({
          single: jest.fn(() => {
            const existing = getTableData(table).find((row: any) => row[col] === val);
            if (!existing) return Promise.resolve({ data: null, error: { message: 'No encontrado' } });
            const updated = { ...existing, ...updateData };
            return Promise.resolve({ data: updated, error: null });
          })
        }))
      }))
    })),
    patch: jest.fn((patchData: any) => ({
      eq: jest.fn((col: string, val: any) => ({
        select: jest.fn(() => ({
          single: jest.fn(() => {
            const existing = getTableData(table).find((row: any) => row[col] === val);
            if (!existing) return Promise.resolve({ data: null, error: { message: 'No encontrado' } });
            const updated = { ...existing, ...patchData };
            return Promise.resolve({ data: updated, error: null });
          })
        }))
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn((col: string, val: any) => {
        const existing = getTableData(table).find((row: any) => row[col] === val);
        if (!existing) return Promise.resolve({ error: { message: 'No encontrado' } });
        return Promise.resolve({ error: null });
      })
    }))
  })),
  auth: {
    signInWithPassword: jest.fn(({ email, password }: { email: string; password: string }) => {
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
};

export const supabase = supabaseMock;
export const supabaseAdmin = supabaseMock;
export default { supabase, supabaseAdmin }; 