import { POST } from '@/app/api/auth/login/route'
import { supabase } from '@/lib/supabase'

// Mock de Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
    from: jest.fn(),
  },
}))

const supabaseMock = supabase as jest.Mocked<typeof supabase>

describe('/api/auth/login', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('debería retornar un usuario y un token en un login exitoso', async () => {
    // Arrange: Simular respuestas exitosas
    supabaseMock.auth.signInWithPassword.mockResolvedValue({ data: { user: {} }, error: null })

    ;(supabaseMock.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 1, nombre: 'Test User', rol: 'venta' }, error: null }),
    })

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'password123' }),
    })

    // Act
    const response = await POST(request)
    const body = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.user).toBeDefined()
    expect(body.user.nombre).toBe('Test User')
  })

  it('debería retornar un error 401 con credenciales incorrectas', async () => {
    // Arrange: Simular error de autenticación
    supabaseMock.auth.signInWithPassword.mockResolvedValue({ data: {}, error: { message: 'Invalid login credentials' } })

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'wrong@test.com', password: 'wrongpassword' }),
    })

    // Act
    const response = await POST(request)
    const body = await response.json()

    // Assert
    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(body.message).toBe('Invalid login credentials')
  })

  it('debería retornar un error 500 si la tabla de usuarios falla', async () => {
    // Arrange: Simular login correcto pero fallo al buscar usuario
    supabaseMock.auth.signInWithPassword.mockResolvedValue({ data: { user: {} }, error: null })
    ;(supabaseMock.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } }),
    })

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'password123' }),
    })

    // Act
    const response = await POST(request)
    const body = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.message).toContain('Error obteniendo datos de usuario')
  })
}) 