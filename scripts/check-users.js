const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://joebhvyfcftobrngcqor.supabase.co';
const supabaseKey = 'sb_publishable_SseWwWd7DpxeVfQVTCbfTg_KEzkN-qv';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  console.log('👥 VERIFICANDO USUARIOS EN LA BASE DE DATOS');
  console.log('===========================================\n');

  try {
    // Obtener todos los usuarios
    const { data: users, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, rol, activo, created_at')
      .order('id');

    if (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      console.log('💡 Necesitas crear al menos un usuario administrador');
      return;
    }

    console.log(`✅ Usuarios encontrados: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Nombre: ${user.nombre}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Rol: ${user.rol}`);
      console.log(`   Activo: ${user.activo ? '✅ Sí' : '❌ No'}`);
      console.log(`   Creado: ${user.created_at}`);
      console.log('');
    });

    // Mostrar usuarios activos que pueden hacer login
    const activeUsers = users.filter(user => user.activo);
    console.log(`\n🔐 USUARIOS ACTIVOS (pueden hacer login): ${activeUsers.length}`);
    activeUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.rol})`);
    });

    if (activeUsers.length === 0) {
      console.log('\n⚠️  ADVERTENCIA: No hay usuarios activos');
      console.log('   El sistema no puede funcionar sin usuarios activos');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUsers(); 