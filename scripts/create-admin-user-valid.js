const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://joebhvyfcftobrngcqor.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWJodnlmY2Z0b2JybmcjcW9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDQ5NzE5MCwiZXhwIjoyMDUwMDczMTkwfQ.SseWwWd7DpxeVfQVTCbfTg_KEzkN-qv';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const createAdminUser = async () => {
  const email = 'admin@elinsti.com';
  const password = 'Admin123'; // Cumple validaciones: minúscula, mayúscula, número
  
  console.log('🚀 Creando usuario admin...');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
  console.log('');

  try {
    // 1. Crear usuario en Supabase Auth
    console.log('1️⃣ Creando usuario en Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        role: 'admin'
      }
    });

    if (authError) {
      console.error('❌ Error creando usuario en Auth:', authError);
      return;
    }

    console.log('✅ Usuario creado en Auth:', authData.user.id);

    // 2. Insertar en tabla usuarios
    console.log('2️⃣ Insertando en tabla usuarios...');
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        email: email,
        nombre: 'Administrador',
        rol: 'admin',
        activo: true,
        fecha_creacion: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Error insertando en tabla usuarios:', userError);
      return;
    }

    console.log('✅ Usuario insertado en tabla usuarios:', userData);

    // 3. Verificar que se puede hacer login
    console.log('3️⃣ Verificando login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (loginError) {
      console.error('❌ Error en login de prueba:', loginError);
      return;
    }

    console.log('✅ Login exitoso:', loginData.user.id);

    console.log('');
    console.log('🎉 Usuario admin creado exitosamente!');
    console.log('📧 Email: admin@elinsti.com');
    console.log('🔑 Password: Admin123');
    console.log('👤 Rol: admin');

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
};

createAdminUser(); 