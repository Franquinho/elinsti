const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase con service role key para crear usuarios
const supabaseUrl = 'https://joebhvyfcftobrngcqor.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWJodnlmY2Z0b2JybmdjcW9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQzNjkzMywiZXhwIjoyMDY2MDEyOTMzfQ.LtdelW0YtBCnXewjgJSEbTmXQ-WqIgeUYDNSU7X4BsM';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAuthUsers() {
  console.log('🔐 CREANDO CUENTAS DE AUTENTICACIÓN');
  console.log('=====================================\n');

  const users = [
    {
      email: 'admin@elinsti.com',
      password: 'admin123',
      nombre: 'Admin El Insti',
      rol: 'administrador'
    },
    {
      email: 'caja@elinsti.com',
      password: 'caja123',
      nombre: 'Cajero Principal',
      rol: 'caja'
    },
    {
      email: 'ventas@elinsti.com',
      password: 'ventas123',
      nombre: 'Vendedor 1',
      rol: 'venta'
    }
  ];

  for (const user of users) {
    try {
      console.log(`📝 Creando cuenta para: ${user.email}`);
      
      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          nombre: user.nombre,
          rol: user.rol
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`   ⚠️  Usuario ${user.email} ya existe en Auth`);
        } else {
          console.log(`   ❌ Error creando usuario: ${authError.message}`);
        }
      } else {
        console.log(`   ✅ Usuario ${user.email} creado en Auth`);
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n🔐 CREDENCIALES DE ACCESO:');
  console.log('==========================');
  console.log('1. admin@elinsti.com / admin123 (Administrador)');
  console.log('2. caja@elinsti.com / caja123 (Caja)');
  console.log('3. ventas@elinsti.com / ventas123 (Ventas)');
  console.log('\n💡 Usa estas credenciales para hacer login en el sistema');
}

createAuthUsers().catch(console.error); 