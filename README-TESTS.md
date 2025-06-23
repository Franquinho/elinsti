# 🧪 Pruebas End-to-End (E2E) para la API

## Estructura de las Pruebas
- Todas las pruebas de endpoints de la API están en la carpeta `__tests__/api/`.
- Cada archivo cubre un endpoint o grupo de endpoints (ej: `productos`, `comandas`, `auth`, `admin`).

## Mocking de Supabase
- El mock global de Supabase se encuentra en `jest.setup.js`.
- Todos los métodos de la cadena (`from`, `select`, `eq`, `order`, `single`, etc.) están simulados para permitir cualquier flujo de llamada.
- Los métodos terminales (`order`, `single`, etc.) deben ser sobreescritos en cada test para devolver la respuesta esperada.

## Cómo escribir un test de API
1. **Prepara el mock:** Antes de llamar al endpoint, configura el mock para devolver los datos esperados.
2. **Ejecuta la petición:** Usa el handler de la API directamente (ej: `await POST(request)`).
3. **Valida la respuesta:** Comprueba el status y el contenido de la respuesta.

### Ejemplo
```js
// Mock de la cadena de métodos
global.mockSupabase.from.mockReturnThis();
global.mockSupabase.select.mockReturnThis();
global.mockSupabase.eq.mockReturnThis();
global.mockSupabase.order.mockResolvedValue({ data: [/* tus datos */], error: null });

const response = await GET();
const data = await response.json();
expect(response.status).toBe(200);
expect(data.success).toBe(true);
```

## Cobertura actual
- **Productos:** Listado y manejo de errores.
- **Comandas:** Creación, actualización de estado y listado.
- **Auth:** Login exitoso, login fallido y error de datos de usuario.
- **Admin:** Gestión de productos y estadísticas.

## Ejecutar las pruebas
```bash
npm test
```
o
```bash
npm run test
```

## Agregar nuevos casos
- Añade un nuevo archivo en `__tests__/api/` o un nuevo bloque `describe` en el archivo correspondiente.
- Sigue el patrón de mocking y validación mostrado arriba.

## Buenas prácticas
- Simula solo lo necesario en cada test para mantenerlos claros y robustos.
- Usa `jest.clearAllMocks()` en un `beforeEach` para evitar interferencias entre tests.
- Si cambias la estructura de la base de datos o los endpoints, actualiza los mocks y los tests para reflejarlo.
- Si un endpoint espera campos obligatorios, asegúrate de incluirlos en los datos de prueba.

---

¿Dudas? Consulta los ejemplos en los archivos de `__tests__/api/` o pregunta a tu AI favorita 😉 