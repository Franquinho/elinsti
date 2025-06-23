import { POST } from '@/app/api/auth/login/route'

describe('/api/auth/login', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return user data and token on successful login', async () => {
    const mockUser = { id: '123', email: 'test@test.com', app_metadata: { role: 'admin' } }
    const mockToken = 'fake-jwt-token'
    
    global.mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: { access_token: mockToken } },
      error: null,
    })
    global.mockSupabase.from.mockReturnThis()
    global.mockSupabase.select.mockReturnThis()
    global.mockSupabase.eq.mockReturnThis()
    global.mockSupabase.single.mockResolvedValue({ data: { id: 1, nombre: 'Test User', rol: 'admin' }, error: null })

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'password' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.user.email).toBe('test@test.com')
    expect(data.user.rol).toBe('admin')
  })

  it('should return 401 for invalid credentials', async () => {
    global.mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials', name: 'AuthApiError', status: 400 },
    })

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'wrong@test.com', password: 'wrong' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it('should return 500 if user role cannot be fetched', async () => {
    const mockUser = { id: '123', email: 'test@test.com' }
    global.mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: { access_token: 'token' } },
      error: null,
    })
    global.mockSupabase.from.mockReturnThis()
    global.mockSupabase.select.mockReturnThis()
    global.mockSupabase.eq.mockReturnThis()
    global.mockSupabase.single.mockResolvedValue({ data: null, error: { message: 'DB Error' } })

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'password' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
  })
}) 