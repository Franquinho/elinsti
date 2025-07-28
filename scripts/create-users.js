const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joebhvyfcftobrngcqor.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWJodnlmY2Z0b2JybmdjcW9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQzNjkzMywiZXhwIjoyMDY2MDEyOTMzfQ.LtdelW0YtBCnXewjgJSEbTmXQ-WqIgeUYDNSU7X4BsM';

const supabase = createClient(supabaseUrl, supabaseKey);

const users = [
  {
    email: 'admin@elinsti.com',
    password: 'Admin123!',
    nombre: 'Administrador',
    rol: 'admin'
  },
  {
    email: 'caja@elinsti.com',
    password: 'Caja123!',
    nombre: 'Caja',
    rol: 'caja'
  },
  {
    email: 'venta1@elinsti.com',
    password: 'Venta123!',
    nombre: 'Venta 1',
    rol: 'venta'
  }
];

async function createUsers() {
  console.log('🔧 Creando usuarios en Supabase...');
  
  for (const user of users) {
    try {
      console.log(`📝 Creando usuario: ${user.email}`);
      
      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true
      });
      
      if (authError) {
        console.error(`❌ Error creando usuario ${user.email}:`, authError.message);
        continue;
      }
      
      console.log(`✅ Usuario creado en Auth: ${user.email}`);
      
      // Insertar en tabla usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .insert({
          email: user.email,
          nombre: user.nombre,
          rol: user.rol,
          activo: true
        })
        .select()
        .single();
      
      if (userError) {
        console.error(`❌ Error insertando en tabla usuarios ${user.email}:`, userError.message);
      } else {
        console.log(`✅ Usuario insertado en tabla: ${user.email}`);
      }
      
    } catch (error) {
      console.error(`❌ Error general para ${user.email}:`, error.message);
    }
  }
  
  console.log('✅ Proceso completado');
}

createUsers(); 