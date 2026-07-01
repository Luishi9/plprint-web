import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CONFIGURACION_INICIAL: Array<{ clave: string; valor: string; tipo: string; grupo: string }> = [
  { clave: 'empresa_nombre',          valor: 'PLPrint',                              tipo: 'string',  grupo: 'empresa' },
  { clave: 'empresa_rfc',             valor: '',                                     tipo: 'string',  grupo: 'empresa' },
  { clave: 'empresa_direccion',       valor: '',                                     tipo: 'string',  grupo: 'empresa' },
  { clave: 'empresa_telefono',        valor: '',                                     tipo: 'string',  grupo: 'empresa' },
  { clave: 'empresa_email',           valor: '',                                     tipo: 'string',  grupo: 'empresa' },
  { clave: 'empresa_logo_url',        valor: '/uploads/plprint-logo.png',            tipo: 'string',  grupo: 'empresa' },
  { clave: 'iva_porcentaje',          valor: '16',                                   tipo: 'number',  grupo: 'impuestos' },
  { clave: 'iva_activo',              valor: 'true',                                 tipo: 'boolean', grupo: 'impuestos' },
  { clave: 'moneda_simbolo',          valor: '$',                                    tipo: 'string',  grupo: 'moneda' },
  { clave: 'moneda_codigo',           valor: 'MXN',                                  tipo: 'string',  grupo: 'moneda' },
  { clave: 'moneda_separador_miles',  valor: ',',                                    tipo: 'string',  grupo: 'moneda' },
  { clave: 'moneda_separador_decimal', valor: '.',                                   tipo: 'string',  grupo: 'moneda' },
  { clave: 'moneda_decimales',        valor: '2',                                    tipo: 'number',  grupo: 'moneda' },
  { clave: 'ticket_encabezado',       valor: 'PLPrint',                              tipo: 'string',  grupo: 'ticket' },
  { clave: 'ticket_subtitulo',        valor: 'Punto de Venta',                       tipo: 'string',  grupo: 'ticket' },
  { clave: 'ticket_mensaje_pie',      valor: 'Gracias por su compra!',               tipo: 'string',  grupo: 'ticket' },
  { clave: 'ticket_formato_fecha',    valor: 'dd/MM/yyyy',                           tipo: 'string',  grupo: 'ticket' },
  { clave: 'ticket_formato_hora',     valor: 'HH:mm',                                tipo: 'string',  grupo: 'ticket' },
  { clave: 'ticket_mostrar_logo',     valor: 'true',                                 tipo: 'boolean', grupo: 'ticket' },
  { clave: 'ticket_mostrar_rfc',      valor: 'false',                                tipo: 'boolean', grupo: 'ticket' },
  { clave: 'ticket_mostrar_direccion', valor: 'false',                               tipo: 'boolean', grupo: 'ticket' },
  { clave: 'ticket_mostrar_telefono', valor: 'false',                                tipo: 'boolean', grupo: 'ticket' },
  { clave: 'reportes_formato',        valor: 'pdf',                                  tipo: 'string',  grupo: 'reportes' },
  { clave: 'reportes_incluir_logo',   valor: 'true',                                 tipo: 'boolean', grupo: 'reportes' },
  { clave: 'notif_stock_bajo',        valor: 'true',                                 tipo: 'boolean', grupo: 'notificaciones' },
  { clave: 'notif_stock_bajo_umbral', valor: '10',                                   tipo: 'number',  grupo: 'notificaciones' },
  { clave: 'notif_ventas_dia',        valor: 'false',                                tipo: 'boolean', grupo: 'notificaciones' },
  { clave: 'notif_insumos_bajos',     valor: 'true',                                 tipo: 'boolean', grupo: 'notificaciones' },
  { clave: 'somos_centro_impresion',  valor: 'false',                                tipo: 'boolean', grupo: 'maquinas' },
];

const PERMISOS_INICIALES: Array<{ modulo: string; accion: string; descripcion: string }> = [
  { modulo: 'dashboard',      accion: 'ver',           descripcion: 'Ver dashboard' },
  { modulo: 'productos',      accion: 'ver',           descripcion: 'Ver productos' },
  { modulo: 'productos',      accion: 'crear',         descripcion: 'Crear productos' },
  { modulo: 'productos',      accion: 'editar',        descripcion: 'Editar productos' },
  { modulo: 'productos',      accion: 'eliminar',      descripcion: 'Eliminar productos' },
  { modulo: 'insumos',        accion: 'ver',           descripcion: 'Ver insumos' },
  { modulo: 'insumos',        accion: 'crear',         descripcion: 'Crear insumos' },
  { modulo: 'insumos',        accion: 'editar',        descripcion: 'Editar insumos' },
  { modulo: 'insumos',        accion: 'eliminar',      descripcion: 'Eliminar insumos' },
  { modulo: 'insumos',        accion: 'ajustar_stock', descripcion: 'Ajustar stock de insumos' },
  { modulo: 'ventas',         accion: 'ver',           descripcion: 'Ver ventas' },
  { modulo: 'ventas',         accion: 'crear',         descripcion: 'Crear ventas' },
  { modulo: 'ventas',         accion: 'cancelar',      descripcion: 'Cancelar ventas' },
  { modulo: 'clientes',       accion: 'ver',           descripcion: 'Ver clientes' },
  { modulo: 'clientes',       accion: 'crear',         descripcion: 'Crear clientes' },
  { modulo: 'clientes',       accion: 'editar',        descripcion: 'Editar clientes' },
  { modulo: 'clientes',       accion: 'eliminar',      descripcion: 'Eliminar clientes' },
  { modulo: 'usuarios',       accion: 'ver',           descripcion: 'Ver usuarios' },
  { modulo: 'usuarios',       accion: 'crear',         descripcion: 'Crear usuarios' },
  { modulo: 'usuarios',       accion: 'editar',        descripcion: 'Editar usuarios' },
  { modulo: 'usuarios',       accion: 'eliminar',      descripcion: 'Eliminar usuarios' },
  { modulo: 'categorias',     accion: 'ver',           descripcion: 'Ver categorias' },
  { modulo: 'categorias',     accion: 'crear',         descripcion: 'Crear categorias' },
  { modulo: 'categorias',     accion: 'editar',        descripcion: 'Editar categorias' },
  { modulo: 'categorias',     accion: 'eliminar',      descripcion: 'Eliminar categorias' },
  { modulo: 'proveedores',    accion: 'ver',           descripcion: 'Ver proveedores' },
  { modulo: 'proveedores',    accion: 'crear',         descripcion: 'Crear proveedores' },
  { modulo: 'proveedores',    accion: 'editar',        descripcion: 'Editar proveedores' },
  { modulo: 'proveedores',    accion: 'eliminar',      descripcion: 'Eliminar proveedores' },
  { modulo: 'unidades_medida',accion: 'ver',           descripcion: 'Ver unidades de medida' },
  { modulo: 'unidades_medida',accion: 'gestionar',     descripcion: 'Gestionar unidades de medida' },
  { modulo: 'gastos',         accion: 'ver',           descripcion: 'Ver gastos' },
  { modulo: 'gastos',         accion: 'crear',         descripcion: 'Crear gastos' },
  { modulo: 'gastos',         accion: 'editar',        descripcion: 'Editar gastos' },
  { modulo: 'gastos',         accion: 'eliminar',      descripcion: 'Eliminar gastos' },
  { modulo: 'gastos',         accion: 'categoria_ver',         descripcion: 'Ver categorías de gastos' },
  { modulo: 'gastos',         accion: 'categoria_gestionar',   descripcion: 'Gestionar categorías de gastos' },
  { modulo: 'compras',        accion: 'ver',           descripcion: 'Ver compras de insumos' },
  { modulo: 'compras',        accion: 'crear',         descripcion: 'Registrar compras de insumos' },
  { modulo: 'compras',        accion: 'anular',        descripcion: 'Anular compras de insumos' },
  { modulo: 'cotizaciones',   accion: 'ver',           descripcion: 'Ver cotizaciones' },
  { modulo: 'cotizaciones',   accion: 'crear',         descripcion: 'Crear cotizaciones' },
  { modulo: 'cotizaciones',   accion: 'editar',        descripcion: 'Editar cotizaciones' },
  { modulo: 'cotizaciones',   accion: 'eliminar',      descripcion: 'Eliminar cotizaciones' },
  { modulo: 'cotizaciones',   accion: 'convertir_venta', descripcion: 'Convertir cotización a venta' },
  { modulo: 'cotizaciones',   accion: 'cancelar',      descripcion: 'Cancelar cotizaciones' },
  { modulo: 'cotizaciones',   accion: 'exportar_pdf',  descripcion: 'Exportar cotización a PDF' },
  { modulo: 'mermas',         accion: 'ver',           descripcion: 'Ver mermas' },
  { modulo: 'mermas',         accion: 'crear',         descripcion: 'Crear mermas' },
  { modulo: 'mermas',         accion: 'editar',        descripcion: 'Editar mermas' },
  { modulo: 'mermas',         accion: 'eliminar',      descripcion: 'Eliminar mermas' },
  { modulo: 'mermas',         accion: 'exportar_excel', descripcion: 'Exportar mermas a Excel' },
  { modulo: 'mermas',         accion: 'registrar_desde_venta', descripcion: 'Registrar merma desde venta' },
  { modulo: 'abonos',         accion: 'ver',           descripcion: 'Ver abonos' },
  { modulo: 'abonos',         accion: 'registrar',     descripcion: 'Registrar abonos a ventas pendientes' },
  { modulo: 'maquinas',       accion: 'ver',           descripcion: 'Ver máquinas de impresión' },
  { modulo: 'maquinas',       accion: 'crear',         descripcion: 'Crear máquinas de impresión' },
  { modulo: 'maquinas',       accion: 'editar',        descripcion: 'Editar máquinas de impresión' },
  { modulo: 'maquinas',       accion: 'eliminar',      descripcion: 'Eliminar máquinas de impresión' },
  { modulo: 'maquinas',       accion: 'ver_contador',  descripcion: 'Ver contador de impresiones' },
  { modulo: 'maquinas',       accion: 'reset_contador', descripcion: 'Resetear contador de máquina' },
  { modulo: 'produccion',     accion: 'ver',           descripcion: 'Ver órdenes de producción' },
  { modulo: 'produccion',     accion: 'crear',         descripcion: 'Crear órdenes de producción' },
  { modulo: 'produccion',     accion: 'editar',        descripcion: 'Editar órdenes de producción' },
  { modulo: 'produccion',     accion: 'cambiar_estatus', descripcion: 'Cambiar estatus de órdenes de producción' },
  { modulo: 'produccion',     accion: 'cancelar',      descripcion: 'Cancelar órdenes de producción' },
  { modulo: 'sucursales',     accion: 'ver',           descripcion: 'Ver sucursales' },
  { modulo: 'sucursales',     accion: 'crear',         descripcion: 'Crear sucursales' },
  { modulo: 'sucursales',     accion: 'editar',        descripcion: 'Editar sucursales' },
  { modulo: 'sucursales',     accion: 'eliminar',      descripcion: 'Eliminar sucursales' },
  { modulo: 'configuracion',  accion: 'ver',           descripcion: 'Ver configuracion' },
  { modulo: 'configuracion',  accion: 'editar',        descripcion: 'Editar configuracion' },
  { modulo: 'roles',          accion: 'ver',           descripcion: 'Ver roles' },
  { modulo: 'roles',          accion: 'crear',         descripcion: 'Crear roles' },
  { modulo: 'roles',          accion: 'editar',        descripcion: 'Editar roles' },
  { modulo: 'roles',          accion: 'eliminar',      descripcion: 'Eliminar roles' },
  { modulo: 'reportes',       accion: 'ver',           descripcion: 'Ver reportes' },
  { modulo: 'reportes',       accion: 'exportar',      descripcion: 'Exportar reportes' },
  { modulo: 'respaldo',       accion: 'ver',           descripcion: 'Ver respaldos' },
  { modulo: 'respaldo',       accion: 'crear',         descripcion: 'Crear respaldos' },
  { modulo: 'audit_log',      accion: 'ver',           descripcion: 'Ver bitacora' },
  { modulo: 'notificaciones', accion: 'ver',           descripcion: 'Ver notificaciones' },
  { modulo: 'notificaciones', accion: 'editar',        descripcion: 'Editar configuracion de notificaciones' },
  { modulo: 'caja',           accion: 'ver',           descripcion: 'Ver caja y movimientos' },
  { modulo: 'caja',           accion: 'aperturar',     descripcion: 'Aperturar caja' },
  { modulo: 'caja',           accion: 'cerrar',        descripcion: 'Realizar corte de caja' },
  { modulo: 'caja',           accion: 'ingreso',       descripcion: 'Registrar ingreso a caja' },
  { modulo: 'caja',           accion: 'gasto',         descripcion: 'Registrar gasto desde caja' },
  { modulo: 'caja',           accion: 'retiro',        descripcion: 'Registrar retiro de caja' },
  { modulo: 'caja',           accion: 'reimprimir',    descripcion: 'Reimprimir corte de caja' },
];

const METODOS_PAGO_INICIALES: Array<{ nombre: string; icono: string }> = [
  { nombre: 'Efectivo',      icono: 'Banknote' },
  { nombre: 'Tarjeta',       icono: 'CreditCard' },
  { nombre: 'Transferencia', icono: 'Landmark' },
];

const NOTIFICACIONES_INICIALES: Array<{ tipo: string; activo: boolean; umbral: number | null }> = [
  { tipo: 'stock_bajo_productos', activo: true,  umbral: 10 },
  { tipo: 'stock_bajo_insumos',   activo: true,  umbral: 10 },
  { tipo: 'ventas_dia',           activo: false, umbral: null },
  { tipo: 'venta_cancelada',      activo: true,  umbral: null },
  { tipo: 'producto_sin_stock',   activo: true,  umbral: 0 },
];

async function main() {
  const adminRol = await prisma.roles.upsert({
    where: { nombre: 'admin' },
    update: { es_sistema: true, descripcion: 'Administrador con acceso total al sistema' },
    create: { nombre: 'admin', es_sistema: true, descripcion: 'Administrador con acceso total al sistema' },
  });

  const vendedorRol = await prisma.roles.upsert({
    where: { nombre: 'vendedor' },
    update: { es_sistema: true, descripcion: 'Vendedor con acceso a ventas, clientes y productos' },
    create: { nombre: 'vendedor', es_sistema: true, descripcion: 'Vendedor con acceso a ventas, clientes y productos' },
  });

  const operadorRol = await prisma.roles.upsert({
    where: { nombre: 'operador' },
    update: { es_sistema: true, descripcion: 'Operador con acceso limitado a inventario y ventas' },
    create: { nombre: 'operador', es_sistema: true, descripcion: 'Operador con acceso limitado a inventario y ventas' },
  });

  const roles = [adminRol, vendedorRol, operadorRol];

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
      rol_id: adminRol.id,
    },
  });

  await prisma.usuarios_sucursales.upsert({
    where: { usuario_id_sucursal_id: { usuario_id: admin.id, sucursal_id: sucursal.id } },
    update: {},
    create: { usuario_id: admin.id, sucursal_id: sucursal.id },
  });

  for (const cfg of CONFIGURACION_INICIAL) {
    await prisma.configuracion.upsert({
      where: { clave: cfg.clave },
      update: {},
      create: cfg,
    });
  }

  const permisosCreados: Array<{ id: number; modulo: string; accion: string }> = [];
  for (const p of PERMISOS_INICIALES) {
    const permiso = await prisma.permisos.upsert({
      where: { modulo_accion: { modulo: p.modulo, accion: p.accion } },
      update: { descripcion: p.descripcion },
      create: p,
    });
    permisosCreados.push({ id: permiso.id, modulo: p.modulo, accion: p.accion });
  }

  await prisma.rol_permisos.deleteMany({ where: { rol_id: adminRol.id } });
  await prisma.rol_permisos.createMany({
    data: permisosCreados.map((p) => ({ rol_id: adminRol.id, permiso_id: p.id })),
  });

  const permisosVendedor = permisosCreados.filter((p) => {
    const modulosPermitidos = ['dashboard', 'productos', 'insumos', 'ventas', 'clientes', 'reportes', 'produccion', 'caja'];
    const accionesPermitidas = ['ver', 'crear', 'editar', 'ajustar_stock', 'exportar', 'cambiar_estatus', 'aperturar', 'cerrar', 'ingreso', 'gasto'];
    return modulosPermitidos.includes(p.modulo) && accionesPermitidas.includes(p.accion);
  });

  await prisma.rol_permisos.deleteMany({ where: { rol_id: vendedorRol.id } });
  await prisma.rol_permisos.createMany({
    data: permisosVendedor.map((p) => ({ rol_id: vendedorRol.id, permiso_id: p.id })),
  });

  const permisosOperador = permisosCreados.filter((p) => {
    const modulosPermitidos = ['dashboard', 'productos', 'ventas', 'produccion', 'caja'];
    const accionesPermitidas = ['ver', 'cambiar_estatus'];
    return modulosPermitidos.includes(p.modulo) && accionesPermitidas.includes(p.accion);
  });

  await prisma.rol_permisos.deleteMany({ where: { rol_id: operadorRol.id } });
  await prisma.rol_permisos.createMany({
    data: permisosOperador.map((p) => ({ rol_id: operadorRol.id, permiso_id: p.id })),
  });

  const metodosPagoCreados: Array<{ id: number; nombre: string }> = [];
  for (const m of METODOS_PAGO_INICIALES) {
    const metodoPago = await prisma.metodos_pago.upsert({
      where: { nombre: m.nombre },
      update: { es_sistema: true },
      create: { nombre: m.nombre, icono: m.icono, es_sistema: true },
    });
    metodosPagoCreados.push({ id: metodoPago.id, nombre: metodoPago.nombre });
  }

  const ventasSinMetodoPagoId = await prisma.ventas.findMany({
    where: { metodo_pago_id: null },
    select: { id: true, metodo_pago: true },
  });
  for (const venta of ventasSinMetodoPagoId) {
    const metodo = metodosPagoCreados.find(
      (m) => m.nombre.toLowerCase() === venta.metodo_pago?.toLowerCase(),
    );
    const fallback = metodosPagoCreados.find((m) => m.nombre === 'Efectivo');
    const metodoPagoId = metodo?.id ?? fallback?.id;
    if (metodoPagoId) {
      await prisma.ventas.update({
        where: { id: venta.id },
        data: { metodo_pago_id: metodoPagoId },
      });
    }
  }

  const notificacionesCreadas: Array<{ id: number; tipo: string }> = [];
  for (const n of NOTIFICACIONES_INICIALES) {
    const notif = await prisma.notificaciones_config.upsert({
      where: { tipo: n.tipo },
      update: { activo: n.activo, umbral: n.umbral },
      create: { tipo: n.tipo, activo: n.activo, umbral: n.umbral },
    });
    notificacionesCreadas.push({ id: notif.id, tipo: notif.tipo });
  }

  console.log('Seed completado:');
  console.log('  Roles:', roles.map(r => r.nombre).join(', '));
  console.log('  Sucursal:', sucursal.nombre);
  console.log('  Usuario: admin@plprint.com / admin123');
  console.log('  Configuracion:', CONFIGURACION_INICIAL.length, 'claves');
  console.log('  Permisos:', permisosCreados.length, 'permisos');
  console.log('  Rol admin:', permisosCreados.length, 'permisos asignados (acceso total)');
  console.log('  Rol vendedor:', permisosVendedor.length, 'permisos asignados');
  console.log('  Rol operador:', permisosOperador.length, 'permisos asignados');
  console.log('  Metodos de pago:', metodosPagoCreados.map(m => m.nombre).join(', '));
  console.log('  Ventas migradas a metodo_pago_id:', ventasSinMetodoPagoId.length);
  console.log('  Notificaciones:', notificacionesCreadas.length, 'tipos configurados');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
