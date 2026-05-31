import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const roles = await Promise.all([
    prisma.roles.upsert({ where: { nombre: 'admin' }, update: {}, create: { nombre: 'admin' } }),
    prisma.roles.upsert({ where: { nombre: 'vendedor' }, update: {}, create: { nombre: 'vendedor' } }),
    prisma.roles.upsert({ where: { nombre: 'operador' }, update: {}, create: { nombre: 'operador' } }),
  ]);

  const sucursal = await prisma.sucursales.upsert({
    where: { id: 1 },
    update: {},
    create: { nombre: 'Sucursal Principal', direccion: 'Direccion principal' },
  });

  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.usuarios.upsert({
    where: { email: 'admin@plprint.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@plprint.com',
      password_hash: passwordHash,
      rol_id: roles[0].id,
    },
  });

  await prisma.usuarios_sucursales.upsert({
    where: { usuario_id_sucursal_id: { usuario_id: admin.id, sucursal_id: sucursal.id } },
    update: {},
    create: { usuario_id: admin.id, sucursal_id: sucursal.id },
  });

  console.log('Seed completado:');
  console.log('  Roles:', roles.map(r => r.nombre).join(', '));
  console.log('  Sucursal:', sucursal.nombre);
  console.log('  Usuario: admin@plprint.com / admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
