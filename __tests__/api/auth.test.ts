import { POST as login } from '@/app/api/auth/login/route'

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deberia responder 400 al login con datos invalidos segun el mock', async () => {
    const loginData = {
      email: 'invalid@test.com',
      password: ''
    }
    
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    })

    const response = await login(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toContain('Datos inválidos')
  })
}) 