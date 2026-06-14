// ============================================================================
// Seed de datos iniciales — UCT-Vínculo Mayor
// Datos de demostración para el MVP
// ============================================================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ============================================================================
// Categorías predefinidas — RF-SOL-01, RN-07
// ============================================================================
const CATEGORIAS = [
  { nombre: 'Compras', descripcion: 'Ayuda con compras de supermercado, farmacia u otros productos básicos.' },
  { nombre: 'Trámites', descripcion: 'Acompañamiento o gestión de trámites bancarios, municipales o de salud.' },
  { nombre: 'Acompañamiento', descripcion: 'Compañía para paseos, visitas médicas o actividades recreativas.' },
  { nombre: 'Limpieza del hogar', descripcion: 'Ayuda con tareas de limpieza y orden en el hogar.' },
  { nombre: 'Tecnología', descripcion: 'Asistencia con uso de celular, computador o aplicaciones.' },
  { nombre: 'Jardinería', descripcion: 'Mantenimiento básico de jardín: cortar césped, regar plantas.' },
  { nombre: 'Otros', descripcion: 'Otras tareas que no impliquen riesgo físico, legal o médico.' },
];

// ============================================================================
// Usuarios — Variedad de roles y estados
// ============================================================================
const USUARIOS = [
  // --- Adultos Mayores ---
  {
    email: 'maria.lagos@gmail.com',
    password: 'MiPass123',
    rut: '12345678-5',
    nombre: 'María',
    apellido: 'Lagos Sepúlveda',
    telefono: '+56912345678',
    rol: 'ADULTO_MAYOR',
    comuna: 'Temuco',
    direccion: 'Av. Alemania 456, Temuco',
  },
  {
    email: 'jose.huenuman@gmail.com',
    password: 'MiPass123',
    rut: '10234567-8',
    nombre: 'José',
    apellido: 'Huenumán Curiche',
    telefono: '+56987654321',
    rol: 'ADULTO_MAYOR',
    comuna: 'Temuco',
    direccion: 'Calle Lautaro 789, Temuco',
  },
  {
    email: 'rosa.catril@gmail.com',
    password: 'MiPass123',
    rut: '8765432-1',
    nombre: 'Rosa',
    apellido: 'Catril Montecinos',
    telefono: '+56955566777',
    rol: 'ADULTO_MAYOR',
    comuna: 'Padre Las Casas',
    direccion: 'Pasaje Los Aromos 12, Padre Las Casas',
  },
  {
    email: 'carlos.sepulveda@gmail.com',
    password: 'MiPass123',
    rut: '9876543-2',
    nombre: 'Carlos',
    apellido: 'Sepúlveda Riquelme',
    telefono: '+56944433222',
    rol: 'ADULTO_MAYOR',
    comuna: 'Temuco',
    direccion: 'Manuel Montt 1234, Temuco',
  },

  // --- Tutores ---
  {
    email: 'ana.lagos@gmail.com',
    password: 'MiPass123',
    rut: '15678901-3',
    nombre: 'Ana',
    apellido: 'Lagos Sepúlveda',
    telefono: '+56911122333',
    rol: 'TUTOR',
    comuna: 'Temuco',
    direccion: 'Av. Alemania 456, Temuco',
  },

  // --- Estudiantes UCT ---
  {
    email: 'juan.perez@alu.uct.cl',
    password: 'MiPass123',
    rut: '20123456-7',
    nombre: 'Juan',
    apellido: 'Pérez Morales',
    telefono: '+56977788999',
    rol: 'ESTUDIANTE',
    comuna: 'Temuco',
  },
  {
    email: 'camila.silva@alu.uct.cl',
    password: 'MiPass123',
    rut: '21234567-8',
    nombre: 'Camila',
    apellido: 'Silva Contreras',
    telefono: '+56966655444',
    rol: 'ESTUDIANTE',
    comuna: 'Temuco',
  },
  {
    email: 'diego.muñoz@alu.uct.cl',
    password: 'MiPass123',
    rut: '20345678-9',
    nombre: 'Diego',
    apellido: 'Muñoz Aravena',
    telefono: '+56933344555',
    rol: 'ESTUDIANTE',
    comuna: 'Padre Las Casas',
  },
  {
    email: 'valentina.rojas@alu.uct.cl',
    password: 'MiPass123',
    rut: '21456789-0',
    nombre: 'Valentina',
    apellido: 'Rojas Figueroa',
    telefono: '+56922233444',
    rol: 'ESTUDIANTE',
    comuna: 'Temuco',
  },
  {
    email: 'matias.gonzalez@alu.uct.cl',
    password: 'MiPass123',
    rut: '20567890-1',
    nombre: 'Matías',
    apellido: 'González Herrera',
    telefono: '+56911199888',
    rol: 'ESTUDIANTE',
    comuna: 'Temuco',
    inasistencias: 2, // Casi suspendido (RN-09)
  },

  // --- Admin ---
  {
    email: 'admin@uct.cl',
    password: 'AdminUCT2026',
    rut: '11111111-1',
    nombre: 'Administrador',
    apellido: 'UCT Sistema',
    rol: 'ADMIN',
    comuna: 'Temuco',
  },
];

// ============================================================================
// Solicitudes de demostración — 15 solicitudes en distintos estados
// ============================================================================
function buildSolicitudes(userMap, catMap) {
  const hoy = new Date();
  const manana = new Date(hoy); manana.setDate(hoy.getDate() + 1);
  const pasadoManana = new Date(hoy); pasadoManana.setDate(hoy.getDate() + 2);
  const en3Dias = new Date(hoy); en3Dias.setDate(hoy.getDate() + 3);
  const en5Dias = new Date(hoy); en5Dias.setDate(hoy.getDate() + 5);
  const en7Dias = new Date(hoy); en7Dias.setDate(hoy.getDate() + 7);
  const hace2Dias = new Date(hoy); hace2Dias.setDate(hoy.getDate() - 2);
  const hace5Dias = new Date(hoy); hace5Dias.setDate(hoy.getDate() - 5);
  const hace10Dias = new Date(hoy); hace10Dias.setDate(hoy.getDate() - 10);

  return [
    // --- PENDIENTES (4) ---
    {
      titulo: 'Compras de supermercado semanales',
      descripcion: 'Necesito ayuda para comprar víveres en el Líder de Temuco. Es una lista de unos 15 productos básicos.',
      categoriaId: catMap['Compras'],
      solicitanteId: userMap['maria.lagos@gmail.com'],
      estado: 'PENDIENTE',
      fechaProgramada: pasadoManana,
      horaProgramada: '10:00',
      direccion: 'Av. Alemania 456, Temuco',
      comuna: 'Temuco',
    },
    {
      titulo: 'Pago de cuentas en Servipag',
      descripcion: 'Necesito que alguien me acompañe a pagar la cuenta de luz y agua en Servipag del centro.',
      categoriaId: catMap['Trámites'],
      solicitanteId: userMap['jose.huenuman@gmail.com'],
      estado: 'PENDIENTE',
      fechaProgramada: en3Dias,
      horaProgramada: '09:00',
      direccion: 'Calle Lautaro 789, Temuco',
      comuna: 'Temuco',
    },
    {
      titulo: 'Ayuda para configurar celular nuevo',
      descripcion: 'Me regalaron un celular nuevo y no sé cómo configurar WhatsApp y la cámara. Necesito paciencia.',
      categoriaId: catMap['Tecnología'],
      solicitanteId: userMap['rosa.catril@gmail.com'],
      estado: 'PENDIENTE',
      fechaProgramada: en5Dias,
      horaProgramada: '15:00',
      direccion: 'Pasaje Los Aromos 12, Padre Las Casas',
      comuna: 'Padre Las Casas',
    },
    {
      titulo: 'Compra de medicamentos en farmacia',
      descripcion: 'Necesito que me compren los remedios del mes en la farmacia Cruz Verde. Tengo la receta lista.',
      categoriaId: catMap['Compras'],
      solicitanteId: userMap['carlos.sepulveda@gmail.com'],
      estado: 'PENDIENTE',
      fechaProgramada: en7Dias,
      horaProgramada: '11:00',
      direccion: 'Manuel Montt 1234, Temuco',
      comuna: 'Temuco',
    },

    // --- EN CURSO (4) ---
    {
      titulo: 'Acompañamiento a control médico',
      descripcion: 'Tengo hora en el Hospital Regional a las 10:00. Necesito que alguien me acompañe y me ayude con el trámite.',
      categoriaId: catMap['Acompañamiento'],
      solicitanteId: userMap['maria.lagos@gmail.com'],
      voluntarioId: userMap['juan.perez@alu.uct.cl'],
      estado: 'EN_CURSO',
      fechaProgramada: manana,
      horaProgramada: '10:00',
      direccion: 'Av. Alemania 456, Temuco',
      comuna: 'Temuco',
    },
    {
      titulo: 'Limpieza general de cocina y baño',
      descripcion: 'Necesito ayuda para una limpieza profunda de la cocina y el baño. Tengo todos los productos.',
      categoriaId: catMap['Limpieza del hogar'],
      solicitanteId: userMap['jose.huenuman@gmail.com'],
      voluntarioId: userMap['camila.silva@alu.uct.cl'],
      estado: 'EN_CURSO',
      fechaProgramada: pasadoManana,
      horaProgramada: '14:00',
      direccion: 'Calle Lautaro 789, Temuco',
      comuna: 'Temuco',
    },
    {
      titulo: 'Podar arbustos del jardín delantero',
      descripcion: 'Los arbustos del jardín están muy crecidos. Necesito que alguien los pode y barra las hojas.',
      categoriaId: catMap['Jardinería'],
      solicitanteId: userMap['rosa.catril@gmail.com'],
      voluntarioId: userMap['diego.muñoz@alu.uct.cl'],
      estado: 'EN_CURSO',
      fechaProgramada: en3Dias,
      horaProgramada: '09:00',
      direccion: 'Pasaje Los Aromos 12, Padre Las Casas',
      comuna: 'Padre Las Casas',
    },
    {
      titulo: 'Trámite en el Registro Civil',
      descripcion: 'Necesito renovar mi carnet de identidad pero no puedo ir solo. ¿Alguien me puede acompañar?',
      categoriaId: catMap['Trámites'],
      solicitanteId: userMap['carlos.sepulveda@gmail.com'],
      voluntarioId: userMap['valentina.rojas@alu.uct.cl'],
      estado: 'EN_CURSO',
      fechaProgramada: en5Dias,
      horaProgramada: '08:30',
      direccion: 'Manuel Montt 1234, Temuco',
      comuna: 'Temuco',
    },

    // --- COMPLETADAS esperando confirmación (3) ---
    {
      titulo: 'Compras en la feria libre',
      descripcion: 'Comprar frutas y verduras en la feria de Temuco. Ya fue completada por el voluntario.',
      categoriaId: catMap['Compras'],
      solicitanteId: userMap['maria.lagos@gmail.com'],
      voluntarioId: userMap['diego.muñoz@alu.uct.cl'],
      estado: 'COMPLETADA',
      fechaProgramada: hace2Dias,
      horaProgramada: '09:00',
      direccion: 'Av. Alemania 456, Temuco',
      comuna: 'Temuco',
    },
    {
      titulo: 'Enseñar a usar correo electrónico',
      descripcion: 'Quiero aprender a enviar fotos por email a mis nietos. El voluntario ya me enseñó.',
      categoriaId: catMap['Tecnología'],
      solicitanteId: userMap['jose.huenuman@gmail.com'],
      voluntarioId: userMap['juan.perez@alu.uct.cl'],
      estado: 'COMPLETADA',
      fechaProgramada: hace2Dias,
      horaProgramada: '16:00',
      direccion: 'Calle Lautaro 789, Temuco',
      comuna: 'Temuco',
    },
    {
      titulo: 'Ordenar closet y donar ropa',
      descripcion: 'Necesitaba ayuda para sacar ropa vieja, doblar y preparar bolsas para donación.',
      categoriaId: catMap['Limpieza del hogar'],
      solicitanteId: userMap['rosa.catril@gmail.com'],
      voluntarioId: userMap['camila.silva@alu.uct.cl'],
      estado: 'COMPLETADA',
      fechaProgramada: hace5Dias,
      horaProgramada: '11:00',
      direccion: 'Pasaje Los Aromos 12, Padre Las Casas',
      comuna: 'Padre Las Casas',
    },

    // --- FINALIZADAS con confirmación (3) ---
    {
      titulo: 'Paseo por el Parque Cautín',
      descripcion: 'Paseo de una hora por el parque, conversación y compañía. Fue una tarde muy agradable.',
      categoriaId: catMap['Acompañamiento'],
      solicitanteId: userMap['maria.lagos@gmail.com'],
      voluntarioId: userMap['camila.silva@alu.uct.cl'],
      estado: 'FINALIZADA',
      fechaProgramada: hace5Dias,
      horaProgramada: '15:00',
      direccion: 'Av. Alemania 456, Temuco',
      comuna: 'Temuco',
    },
    {
      titulo: 'Regar plantas y arreglar maceteros',
      descripcion: 'Riego de todas las plantas del patio trasero y cambio de tierra en 3 maceteros.',
      categoriaId: catMap['Jardinería'],
      solicitanteId: userMap['carlos.sepulveda@gmail.com'],
      voluntarioId: userMap['juan.perez@alu.uct.cl'],
      estado: 'FINALIZADA',
      fechaProgramada: hace10Dias,
      horaProgramada: '10:00',
      direccion: 'Manuel Montt 1234, Temuco',
      comuna: 'Temuco',
    },
    {
      titulo: 'Acompañamiento a misa dominical',
      descripcion: 'Acompañar a la iglesia del centro los domingos. Fue un domingo muy bonito.',
      categoriaId: catMap['Acompañamiento'],
      solicitanteId: userMap['jose.huenuman@gmail.com'],
      voluntarioId: userMap['valentina.rojas@alu.uct.cl'],
      estado: 'FINALIZADA',
      fechaProgramada: hace10Dias,
      horaProgramada: '09:00',
      direccion: 'Calle Lautaro 789, Temuco',
      comuna: 'Temuco',
    },

    // --- CANCELADA (1) ---
    {
      titulo: 'Compras navideñas en el mall',
      descripcion: 'Iba a necesitar ayuda con compras navideñas pero ya las resolvió mi nieta.',
      categoriaId: catMap['Compras'],
      solicitanteId: userMap['rosa.catril@gmail.com'],
      estado: 'CANCELADA',
      fechaProgramada: en7Dias,
      horaProgramada: '12:00',
      direccion: 'Pasaje Los Aromos 12, Padre Las Casas',
      comuna: 'Padre Las Casas',
    },
  ];
}

// ============================================================================
// Evaluaciones — RF-EJE-04
// ============================================================================
function buildEvaluaciones(userMap, solicitudTitles) {
  return [
    // Evaluaciones de las solicitudes FINALIZADAS
    {
      puntuacion: 5,
      comentario: '¡Excelente! Camila fue muy amable y paciente durante el paseo. La recomiendo totalmente.',
      solicitudTitulo: 'Paseo por el Parque Cautín',
      evaluadorEmail: 'maria.lagos@gmail.com',
      evaluadoEmail: 'camila.silva@alu.uct.cl',
    },
    {
      puntuacion: 5,
      comentario: 'La señora María es muy cariñosa. Fue un gusto acompañarla.',
      solicitudTitulo: 'Paseo por el Parque Cautín',
      evaluadorEmail: 'camila.silva@alu.uct.cl',
      evaluadoEmail: 'maria.lagos@gmail.com',
    },
    {
      puntuacion: 4,
      comentario: 'Juan hizo un buen trabajo con las plantas. Solo le faltó barrer al final.',
      solicitudTitulo: 'Regar plantas y arreglar maceteros',
      evaluadorEmail: 'carlos.sepulveda@gmail.com',
      evaluadoEmail: 'juan.perez@alu.uct.cl',
    },
    {
      puntuacion: 5,
      comentario: 'Don Carlos es muy agradable. Hasta me convidó un tecito al final.',
      solicitudTitulo: 'Regar plantas y arreglar maceteros',
      evaluadorEmail: 'juan.perez@alu.uct.cl',
      evaluadoEmail: 'carlos.sepulveda@gmail.com',
    },
    {
      puntuacion: 5,
      comentario: 'Valentina fue muy respetuosa y puntual. Una excelente voluntaria.',
      solicitudTitulo: 'Acompañamiento a misa dominical',
      evaluadorEmail: 'jose.huenuman@gmail.com',
      evaluadoEmail: 'valentina.rojas@alu.uct.cl',
    },
    {
      puntuacion: 4,
      comentario: 'Don José es muy entretenido, me contó muchas historias de Temuco antiguo.',
      solicitudTitulo: 'Acompañamiento a misa dominical',
      evaluadorEmail: 'valentina.rojas@alu.uct.cl',
      evaluadoEmail: 'jose.huenuman@gmail.com',
    },
  ];
}

// ============================================================================
// Función principal de seed
// ============================================================================
async function main() {
  console.log('🌱 Iniciando seed completo de UCT-Vínculo Mayor...\n');

  // --- 1. Categorías ---
  console.log('📂 Creando categorías...');
  const catMap = {};
  for (const cat of CATEGORIAS) {
    const result = await prisma.categoria.upsert({
      where: { nombre: cat.nombre },
      update: {},
      create: cat,
    });
    catMap[cat.nombre] = result.id;
    console.log(`   ✅ ${result.nombre}`);
  }

  // --- 2. Usuarios ---
  console.log('\n👥 Creando usuarios...');
  const userMap = {};
  for (const user of USUARIOS) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const result = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        passwordHash,
        rut: user.rut,
        nombre: user.nombre,
        apellido: user.apellido,
        telefono: user.telefono || null,
        rol: user.rol,
        comuna: user.comuna || null,
        direccion: user.direccion || null,
        inasistencias: user.inasistencias || 0,
        suspendido: user.suspendido || false,
      },
    });
    userMap[user.email] = result.id;
    const rolTag = { ADULTO_MAYOR: '👴', TUTOR: '👨‍👦', ESTUDIANTE: '🎓', ADMIN: '🛡️' };
    console.log(`   ${rolTag[user.rol]} ${result.nombre} ${result.apellido} (${result.email})`);
  }

  // --- 3. Solicitudes ---
  console.log('\n📋 Creando solicitudes...');
  const solicitudes = buildSolicitudes(userMap, catMap);
  const solicitudMap = {};
  for (const sol of solicitudes) {
    const result = await prisma.solicitud.create({ data: sol });
    solicitudMap[sol.titulo] = result.id;
    const estadoTag = {
      PENDIENTE: '🟡',
      EN_CURSO: '🔵',
      COMPLETADA: '🟠',
      FINALIZADA: '🟢',
      CANCELADA: '🔴',
    };
    console.log(`   ${estadoTag[sol.estado]} [${sol.estado}] ${sol.titulo}`);
  }

  // --- 4. Evaluaciones ---
  console.log('\n⭐ Creando evaluaciones...');
  const evaluaciones = buildEvaluaciones(userMap, solicitudMap);
  for (const eva of evaluaciones) {
    await prisma.evaluacion.create({
      data: {
        puntuacion: eva.puntuacion,
        comentario: eva.comentario,
        solicitudId: solicitudMap[eva.solicitudTitulo],
        evaluadorId: userMap[eva.evaluadorEmail],
        evaluadoId: userMap[eva.evaluadoEmail],
      },
    });
    console.log(`   ⭐ ${'★'.repeat(eva.puntuacion)}${'☆'.repeat(5 - eva.puntuacion)} ${eva.evaluadorEmail.split('@')[0]} → ${eva.evaluadoEmail.split('@')[0]}`);
  }

  // --- Resumen ---
  console.log('\n' + '='.repeat(50));
  console.log('🌱 SEED COMPLETADO');
  console.log('='.repeat(50));
  console.log(`   📂 Categorías:    ${CATEGORIAS.length}`);
  console.log(`   👥 Usuarios:      ${USUARIOS.length}`);
  console.log(`   📋 Solicitudes:   ${solicitudes.length}`);
  console.log(`   ⭐ Evaluaciones:  ${evaluaciones.length}`);
  console.log('='.repeat(50));
  console.log('\n📌 Cuentas de prueba:');
  console.log('   🎓 juan.perez@alu.uct.cl     / MiPass123');
  console.log('   👴 maria.lagos@gmail.com      / MiPass123');
  console.log('   🛡️  admin@uct.cl              / AdminUCT2026');
  console.log('');
}

main()
  .catch((error) => {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
