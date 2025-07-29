const fs = require('fs');
const path = require('path');

// Función para analizar archivos TypeScript/JavaScript
function analizarArchivo(rutaArchivo) {
  try {
    const contenido = fs.readFileSync(rutaArchivo, 'utf8');
    const analisis = {
      archivo: rutaArchivo,
      tamaño: contenido.length,
      lineas: contenido.split('\n').length,
      problemas: [],
      advertencias: [],
      recomendaciones: []
    };

    // Verificar imports
    const imports = contenido.match(/import.*from/g) || [];
    analisis.imports = imports.length;

    // Verificar tipos de datos
    const tipos = {
      number: (contenido.match(/number/g) || []).length,
      string: (contenido.match(/string/g) || []).length,
      boolean: (contenido.match(/boolean/g) || []).length,
      any: (contenido.match(/: any/g) || []).length,
      unknown: (contenido.match(/: unknown/g) || []).length
    };
    analisis.tipos = tipos;

    // Verificar validaciones Zod
    const validacionesZod = (contenido.match(/z\./g) || []).length;
    analisis.validaciones_zod = validacionesZod;

    // Verificar conversiones de tipos
    const conversiones = {
      parseInt: (contenido.match(/parseInt/g) || []).length,
      parseFloat: (contenido.match(/parseFloat/g) || []).length,
      toString: (contenido.match(/\.toString\(\)/g) || []).length,
      Number: (contenido.match(/Number\(/g) || []).length,
      String: (contenido.match(/String\(/g) || []).length
    };
    analisis.conversiones = conversiones;

    // Verificar manejo de errores
    const manejoErrores = {
      try: (contenido.match(/try\s*{/g) || []).length,
      catch: (contenido.match(/catch\s*\(/g) || []).length,
      throw: (contenido.match(/throw\s+/g) || []).length
    };
    analisis.manejo_errores = manejoErrores;

    // Verificar validaciones
    const validaciones = {
      if: (contenido.match(/if\s*\(/g) || []).length,
      typeof: (contenido.match(/typeof/g) || []).length,
      isNaN: (contenido.match(/isNaN/g) || []).length,
      Array: (contenido.match(/Array\./g) || []).length
    };
    analisis.validaciones = validaciones;

    // Detectar problemas potenciales
    if (tipos.any > 0) {
      analisis.problemas.push(`Uso de tipo 'any' (${tipos.any} veces) - Considerar tipos más específicos`);
    }

    if (tipos.unknown > 0) {
      analisis.advertencias.push(`Uso de tipo 'unknown' (${tipos.unknown} veces) - Verificar si es necesario`);
    }

    if (validacionesZod === 0 && rutaArchivo.includes('/api/')) {
      analisis.problemas.push('No se encontraron validaciones Zod - Considerar agregar validaciones');
    }

    if (manejoErrores.try === 0 && rutaArchivo.includes('/api/')) {
      analisis.problemas.push('No se encontró manejo de errores - Considerar agregar try/catch');
    }

    // Verificar uso de variables de entorno
    const envVars = contenido.match(/process\.env\.[A-Z_]+/g) || [];
    analisis.variables_entorno = envVars.length;

    return analisis;
  } catch (error) {
    return {
      archivo: rutaArchivo,
      error: error.message
    };
  }
}

// Función para analizar estructura de directorios
function analizarEstructura() {
  const estructura = {
    directorios: [],
    archivos: {
      typescript: [],
      javascript: [],
      json: [],
      otros: []
    },
    total_archivos: 0
  };

  function escanearDirectorio(dir, nivel = 0) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const rutaCompleta = path.join(dir, item);
        const stats = fs.statSync(rutaCompleta);
        
        if (stats.isDirectory()) {
          if (nivel < 3) { // Limitar profundidad
            estructura.directorios.push({
              nombre: item,
              ruta: rutaCompleta,
              nivel: nivel
            });
            escanearDirectorio(rutaCompleta, nivel + 1);
          }
        } else {
          estructura.total_archivos++;
          
          if (item.endsWith('.ts') || item.endsWith('.tsx')) {
            estructura.archivos.typescript.push(rutaCompleta);
          } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
            estructura.archivos.javascript.push(rutaCompleta);
          } else if (item.endsWith('.json')) {
            estructura.archivos.json.push(rutaCompleta);
          } else {
            estructura.archivos.otros.push(rutaCompleta);
          }
        }
      }
    } catch (error) {
      console.log(`Error escaneando ${dir}:`, error.message);
    }
  }

  escanearDirectorio('.');
  return estructura;
}

async function auditoriaCodigo() {
  console.log('🔍 AUDITORÍA DE CÓDIGO - EL INSTI');
  console.log('==================================\n');

  const reporte = {
    timestamp: new Date().toISOString(),
    version: '1.0',
    tipo: 'AUDITORIA_CODIGO',
    resultados: {}
  };

  // FASE 1: ANÁLISIS DE ESTRUCTURA
  console.log('📋 FASE 1: ANÁLISIS DE ESTRUCTURA');
  console.log('==================================');

  const estructura = analizarEstructura();
  
  console.log('1.1 Estructura de directorios:');
  estructura.directorios.forEach(dir => {
    console.log(`   ${'  '.repeat(dir.nivel)}📁 ${dir.nombre}`);
  });

  console.log('\n1.2 Resumen de archivos:');
  console.log(`   - TypeScript: ${estructura.archivos.typescript.length}`);
  console.log(`   - JavaScript: ${estructura.archivos.javascript.length}`);
  console.log(`   - JSON: ${estructura.archivos.json.length}`);
  console.log(`   - Otros: ${estructura.archivos.otros.length}`);
  console.log(`   - Total: ${estructura.total_archivos}`);

  reporte.resultados.estructura = estructura;

  // FASE 2: ANÁLISIS DE ARCHIVOS CRÍTICOS
  console.log('\n📋 FASE 2: ANÁLISIS DE ARCHIVOS CRÍTICOS');
  console.log('==========================================');

  const archivosCriticos = [
    'app/api/comandas/create/route.ts',
    'app/api/auth/login/route.ts',
    'app/api/eventos/route.ts',
    'app/api/productos/list/route.ts',
    'lib/supabase.ts',
    'lib/api.ts',
    'components/ventas-section.tsx',
    'components/caja-section.tsx',
    'components/admin-section.tsx'
  ];

  const analisisArchivos = {};

  for (const archivo of archivosCriticos) {
    if (fs.existsSync(archivo)) {
      console.log(`\n2.${archivosCriticos.indexOf(archivo) + 1} Analizando ${archivo}...`);
      const analisis = analizarArchivo(archivo);
      analisisArchivos[archivo] = analisis;

      console.log(`   📊 Tamaño: ${analisis.tamaño} caracteres, ${analisis.lineas} líneas`);
      console.log(`   📦 Imports: ${analisis.imports}`);
      console.log(`   🔒 Validaciones Zod: ${analisis.validaciones_zod}`);
      console.log(`   🛡️  Manejo de errores: ${analisis.manejo_errores.try} try/catch`);
      console.log(`   🔧 Conversiones: ${Object.values(analisis.conversiones).reduce((a, b) => a + b, 0)}`);

      if (analisis.problemas.length > 0) {
        console.log('   ⚠️  Problemas detectados:');
        analisis.problemas.forEach(problema => {
          console.log(`      - ${problema}`);
        });
      }

      if (analisis.advertencias.length > 0) {
        console.log('   ⚠️  Advertencias:');
        analisis.advertencias.forEach(advertencia => {
          console.log(`      - ${advertencia}`);
        });
      }
    } else {
      console.log(`\n2.${archivosCriticos.indexOf(archivo) + 1} ❌ Archivo no encontrado: ${archivo}`);
      analisisArchivos[archivo] = { error: 'Archivo no encontrado' };
    }
  }

  reporte.resultados.analisis_archivos = analisisArchivos;

  // FASE 3: ANÁLISIS DE TIPOS DE DATOS
  console.log('\n📋 FASE 3: ANÁLISIS DE TIPOS DE DATOS');
  console.log('=======================================');

  const resumenTipos = {
    number: 0,
    string: 0,
    boolean: 0,
    any: 0,
    unknown: 0
  };

  const resumenConversiones = {
    parseInt: 0,
    parseFloat: 0,
    toString: 0,
    Number: 0,
    String: 0
  };

  Object.values(analisisArchivos).forEach(analisis => {
    if (analisis.tipos) {
      Object.keys(resumenTipos).forEach(tipo => {
        resumenTipos[tipo] += analisis.tipos[tipo] || 0;
      });
    }
    if (analisis.conversiones) {
      Object.keys(resumenConversiones).forEach(conversion => {
        resumenConversiones[conversion] += analisis.conversiones[conversion] || 0;
      });
    }
  });

  console.log('3.1 Uso de tipos de datos:');
  Object.entries(resumenTipos).forEach(([tipo, cantidad]) => {
    console.log(`   - ${tipo}: ${cantidad} usos`);
  });

  console.log('\n3.2 Conversiones de tipos:');
  Object.entries(resumenConversiones).forEach(([conversion, cantidad]) => {
    console.log(`   - ${conversion}: ${cantidad} usos`);
  });

  reporte.resultados.resumen_tipos = resumenTipos;
  reporte.resultados.resumen_conversiones = resumenConversiones;

  // FASE 4: VERIFICACIÓN DE VALIDACIONES
  console.log('\n📋 FASE 4: VERIFICACIÓN DE VALIDACIONES');
  console.log('=========================================');

  const validacionesPorArchivo = {};
  let totalValidacionesZod = 0;
  let totalValidacionesManuales = 0;

  Object.entries(analisisArchivos).forEach(([archivo, analisis]) => {
    if (analisis.validaciones_zod !== undefined) {
      validacionesPorArchivo[archivo] = {
        zod: analisis.validaciones_zod,
        manuales: analisis.validaciones.if + analisis.validaciones.typeof + analisis.validaciones.isNaN
      };
      totalValidacionesZod += analisis.validaciones_zod;
      totalValidacionesManuales += analisis.validaciones.if + analisis.validaciones.typeof + analisis.validaciones.isNaN;
    }
  });

  console.log('4.1 Validaciones por archivo:');
  Object.entries(validacionesPorArchivo).forEach(([archivo, validaciones]) => {
    console.log(`   - ${archivo}: ${validaciones.zod} Zod, ${validaciones.manuales} manuales`);
  });

  console.log(`\n4.2 Total validaciones: ${totalValidacionesZod} Zod, ${totalValidacionesManuales} manuales`);

  reporte.resultados.validaciones = {
    por_archivo: validacionesPorArchivo,
    totales: {
      zod: totalValidacionesZod,
      manuales: totalValidacionesManuales
    }
  };

  // FASE 5: DETECCIÓN DE PROBLEMAS
  console.log('\n📋 FASE 5: DETECCIÓN DE PROBLEMAS');
  console.log('===================================');

  const problemas = [];
  const advertencias = [];

  Object.entries(analisisArchivos).forEach(([archivo, analisis]) => {
    if (analisis.problemas) {
      analisis.problemas.forEach(problema => {
        problemas.push(`${archivo}: ${problema}`);
      });
    }
    if (analisis.advertencias) {
      analisis.advertencias.forEach(advertencia => {
        advertencias.push(`${archivo}: ${advertencia}`);
      });
    }
  });

  console.log('5.1 Problemas críticos encontrados:');
  if (problemas.length === 0) {
    console.log('   ✅ No se encontraron problemas críticos');
  } else {
    problemas.forEach((problema, index) => {
      console.log(`   ${index + 1}. ${problema}`);
    });
  }

  console.log('\n5.2 Advertencias:');
  if (advertencias.length === 0) {
    console.log('   ✅ No se encontraron advertencias');
  } else {
    advertencias.forEach((advertencia, index) => {
      console.log(`   ${index + 1}. ${advertencia}`);
    });
  }

  reporte.resultados.problemas = {
    criticos: problemas,
    advertencias: advertencias
  };

  // FASE 6: RECOMENDACIONES
  console.log('\n📋 FASE 6: RECOMENDACIONES');
  console.log('===========================');

  const recomendaciones = [];

  if (resumenTipos.any > 0) {
    recomendaciones.push('Reemplazar tipos "any" con tipos más específicos para mejorar la seguridad de tipos');
  }

  if (totalValidacionesZod < 5) {
    recomendaciones.push('Aumentar el uso de validaciones Zod en endpoints críticos');
  }

  if (estructura.archivos.typescript.length < estructura.archivos.javascript.length) {
    recomendaciones.push('Considerar migrar archivos JavaScript a TypeScript para mejor seguridad de tipos');
  }

  if (recomendaciones.length === 0) {
    recomendaciones.push('El código está bien estructurado y con buenas prácticas');
  }

  console.log('6.1 Recomendaciones generales:');
  recomendaciones.forEach((recomendacion, index) => {
    console.log(`   ${index + 1}. ${recomendacion}`);
  });

  reporte.resultados.recomendaciones = recomendaciones;

  // FASE 7: RESUMEN FINAL
  console.log('\n📋 FASE 7: RESUMEN FINAL');
  console.log('=========================');

  const calidad = {
    estructura: estructura.total_archivos > 0 ? 'BUENA' : 'PENDIENTE',
    tipos: resumenTipos.any === 0 ? 'EXCELENTE' : resumenTipos.any < 5 ? 'BUENA' : 'MEJORABLE',
    validaciones: totalValidacionesZod > 10 ? 'EXCELENTE' : totalValidacionesZod > 5 ? 'BUENA' : 'MEJORABLE',
    errores: problemas.length === 0 ? 'EXCELENTE' : problemas.length < 3 ? 'BUENA' : 'MEJORABLE'
  };

  console.log('7.1 Calidad del código:');
  console.log(`   - Estructura: ${calidad.estructura}`);
  console.log(`   - Tipos de datos: ${calidad.tipos}`);
  console.log(`   - Validaciones: ${calidad.validaciones}`);
  console.log(`   - Manejo de errores: ${calidad.errores}`);

  const puntuacion = Object.values(calidad).filter(c => c === 'EXCELENTE').length;
  let estadoFinal = 'EXCELENTE';
  if (puntuacion < 2) estadoFinal = 'MEJORABLE';
  else if (puntuacion < 4) estadoFinal = 'BUENA';

  console.log(`\n7.2 Estado general: ${estadoFinal}`);

  reporte.estado = estadoFinal;
  reporte.calidad = calidad;

  // Guardar reporte
  const reportePath = `auditoria-codigo-${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(reportePath, JSON.stringify(reporte, null, 2));
  console.log(`\n📄 Reporte guardado en: ${reportePath}`);

  console.log('\n🎉 AUDITORÍA DE CÓDIGO COMPLETADA');
  console.log('==================================');
  console.log(`Estado final: ${estadoFinal}`);
  console.log(`Archivos analizados: ${archivosCriticos.length}`);
  console.log(`Problemas encontrados: ${problemas.length}`);
  console.log(`Advertencias: ${advertencias.length}`);
}

// Ejecutar auditoría de código
auditoriaCodigo(); 