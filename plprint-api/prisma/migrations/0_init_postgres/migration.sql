-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(200),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "es_sistema" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sucursales" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "direccion" TEXT,
    "telefono" VARCHAR(20),
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sucursales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol_id" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "token_version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_sucursales" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "sucursal_id" INTEGER NOT NULL,

    CONSTRAINT "usuarios_sucursales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(255),
    "tipo" VARCHAR(20) NOT NULL DEFAULT 'venta',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "contacto" VARCHAR(100),
    "telefono" VARCHAR(20),
    "email" VARCHAR(150),
    "rfc" VARCHAR(20),
    "direccion" TEXT,
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50),
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "precio_venta" DECIMAL(10,2) NOT NULL,
    "precio_compra" DECIMAL(10,2),
    "categoria_id" INTEGER,
    "proveedor_id" INTEGER,
    "unidad_medida" VARCHAR(20) NOT NULL DEFAULT 'unidad',
    "clave_prod_serv" VARCHAR(20),
    "clave_unidad" VARCHAR(10),
    "imagen_url" TEXT,
    "maquina_id" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "cobrar_minimo_1" BOOLEAN NOT NULL DEFAULT false,
    "sucursal_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producto_precios" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "nivel" VARCHAR(20) NOT NULL,
    "cantidad_minima" INTEGER NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "producto_precios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maquinas" (
    "id" SERIAL NOT NULL,
    "sucursal_id" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "marca" VARCHAR(50),
    "modelo" VARCHAR(50),
    "contador_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "contador_inicial" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "reset_diario" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_instalacion" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maquinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "impresiones" (
    "id" SERIAL NOT NULL,
    "maquina_id" INTEGER NOT NULL,
    "venta_detalle_id" INTEGER,
    "venta_id" INTEGER,
    "producto_id" INTEGER,
    "sucursal_id" INTEGER NOT NULL,
    "usuario_id" INTEGER,
    "fue_merma" BOOLEAN NOT NULL DEFAULT false,
    "merma_id" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "impresiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "sucursal_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "stock_minimo" INTEGER NOT NULL DEFAULT 0,
    "stock_maximo" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(20),
    "email" VARCHAR(150),
    "direccion" TEXT,
    "rfc" VARCHAR(39),
    "uso_cfdi" VARCHAR(3),
    "regimen_fiscal_receptor" VARCHAR(3),
    "domicilio_fiscal_cp" VARCHAR(5),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas" (
    "id" SERIAL NOT NULL,
    "folio" VARCHAR(20),
    "sucursal_id" INTEGER,
    "cliente_id" INTEGER,
    "usuario_id" INTEGER,
    "total" DECIMAL(10,2) NOT NULL,
    "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "descuento_motivo" VARCHAR(255),
    "metodo_pago" VARCHAR(30) NOT NULL DEFAULT 'efectivo',
    "metodo_pago_id" INTEGER,
    "iva_porcentaje" DECIMAL(5,2),
    "base_gravable" DECIMAL(10,2),
    "iva" DECIMAL(10,2) DEFAULT 0,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'completada',
    "estado_pago" VARCHAR(20) NOT NULL DEFAULT 'pagada',
    "saldo_pendiente" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "fecha_limite_pago" TIMESTAMP(3),
    "cotizacion_id" INTEGER,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venta_detalle" (
    "id" SERIAL NOT NULL,
    "venta_id" INTEGER NOT NULL,
    "producto_id" INTEGER,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "ancho_m" DECIMAL(10,4),
    "alto_m" DECIMAL(10,4),
    "unidad_medida_detalle" VARCHAR(20),

    CONSTRAINT "venta_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mermas" (
    "id" SERIAL NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "producto_id" INTEGER,
    "insumo_id" INTEGER,
    "sucursal_id" INTEGER,
    "usuario_id" INTEGER,
    "venta_id" INTEGER,
    "maquina_id" INTEGER,
    "cantidad" DECIMAL(12,3) NOT NULL,
    "motivo" VARCHAR(255) NOT NULL,
    "costo_estimado" DECIMAL(12,2),
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mermas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kardex_movimientos" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER,
    "sucursal_id" INTEGER,
    "tipo" VARCHAR(20) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "venta_id" INTEGER,
    "referencia" VARCHAR(100),
    "notas" TEXT,
    "usuario_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kardex_movimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insumos" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "unidad_medida" VARCHAR(20) NOT NULL DEFAULT 'unidad',
    "ancho_rollo" DECIMAL(10,4),
    "precio_compra" DECIMAL(10,2),
    "proveedor_id" INTEGER,
    "sucursal_id" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras_insumos" (
    "id" SERIAL NOT NULL,
    "sucursal_id" INTEGER NOT NULL,
    "proveedor_id" INTEGER,
    "usuario_id" INTEGER,
    "insumo_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(12,3) NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "factura" VARCHAR(100),
    "notas" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compras_insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades_medida" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "abreviatura" VARCHAR(10) NOT NULL,
    "es_medida" BOOLEAN NOT NULL DEFAULT false,
    "tipo_medida" VARCHAR(2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unidades_medida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gastos_categorias" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(255),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gastos_categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gastos" (
    "id" SERIAL NOT NULL,
    "sucursal_id" INTEGER,
    "usuario_id" INTEGER,
    "categoria_id" INTEGER NOT NULL,
    "concepto" VARCHAR(200) NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "tipo" VARCHAR(20) NOT NULL DEFAULT 'gasto',
    "autorizado_por" INTEGER,
    "comprobante_url" VARCHAR(500),
    "notas" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gastos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insumos_inventario" (
    "id" SERIAL NOT NULL,
    "insumo_id" INTEGER NOT NULL,
    "sucursal_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "stock_minimo" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insumos_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producto_insumos" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "insumo_id" INTEGER NOT NULL,
    "cantidad_requerida" DECIMAL(12,3) NOT NULL,

    CONSTRAINT "producto_insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion" (
    "id" SERIAL NOT NULL,
    "clave" VARCHAR(100) NOT NULL,
    "valor" TEXT,
    "tipo" VARCHAR(20) NOT NULL DEFAULT 'string',
    "grupo" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotizaciones" (
    "id" SERIAL NOT NULL,
    "folio" VARCHAR(20) NOT NULL,
    "sucursal_id" INTEGER,
    "cliente_id" INTEGER,
    "usuario_id" INTEGER,
    "total" DECIMAL(10,2) NOT NULL,
    "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "descuento_motivo" VARCHAR(255),
    "notas" TEXT,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    "venta_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cotizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotizacion_detalle" (
    "id" SERIAL NOT NULL,
    "cotizacion_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "ancho_m" DECIMAL(10,4),
    "alto_m" DECIMAL(10,4),
    "unidad_medida_detalle" VARCHAR(20),

    CONSTRAINT "cotizacion_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas_abonos" (
    "id" SERIAL NOT NULL,
    "venta_id" INTEGER NOT NULL,
    "usuario_id" INTEGER,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo_pago" VARCHAR(30) NOT NULL,
    "notas" VARCHAR(255),
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ventas_abonos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permisos" (
    "id" SERIAL NOT NULL,
    "modulo" VARCHAR(50) NOT NULL,
    "accion" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(200),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rol_permisos" (
    "id" SERIAL NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "permiso_id" INTEGER NOT NULL,

    CONSTRAINT "rol_permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metodos_pago" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "icono" VARCHAR(30),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "es_sistema" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metodos_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER,
    "accion" VARCHAR(50) NOT NULL,
    "modulo" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "detalle" TEXT,
    "ip" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones_config" (
    "id" SERIAL NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "umbral" DECIMAL(12,3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_produccion" (
    "id" SERIAL NOT NULL,
    "sucursal_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "cantidad_producida" INTEGER NOT NULL DEFAULT 0,
    "estatus" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    "prioridad" VARCHAR(15) NOT NULL DEFAULT 'normal',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_inicio" TIMESTAMP(3),
    "fecha_fin_estimada" TIMESTAMP(3),
    "fecha_fin_real" TIMESTAMP(3),
    "usuario_creador_id" INTEGER,
    "usuario_asignado_id" INTEGER,
    "maquina_id" INTEGER,
    "notas" TEXT,
    "motivo_cancelacion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ordenes_produccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_produccion_historial" (
    "id" SERIAL NOT NULL,
    "orden_id" INTEGER NOT NULL,
    "estatus_anterior" VARCHAR(20),
    "estatus_nuevo" VARCHAR(20) NOT NULL,
    "usuario_id" INTEGER,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ordenes_produccion_historial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cortes_caja" (
    "id" SERIAL NOT NULL,
    "sucursal_id" INTEGER NOT NULL,
    "usuario_apertura_id" INTEGER NOT NULL,
    "fecha_apertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto_inicial" DECIMAL(12,2) NOT NULL,
    "fecha_cierre" TIMESTAMP(3),
    "usuario_cierre_id" INTEGER,
    "monto_final_esperado" DECIMAL(12,2),
    "monto_final_real" DECIMAL(12,2),
    "diferencia" DECIMAL(12,2),
    "observaciones" TEXT,
    "estado" VARCHAR(10) NOT NULL DEFAULT 'abierta',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cortes_caja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cortes_maquinas" (
    "id" SERIAL NOT NULL,
    "corte_caja_id" INTEGER NOT NULL,
    "sucursal_id" INTEGER NOT NULL,
    "fecha_apertura" TIMESTAMP(3) NOT NULL,
    "fecha_cierre" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cortes_maquinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cortes_maquinas_detalle" (
    "id" SERIAL NOT NULL,
    "cortes_maquinas_id" INTEGER NOT NULL,
    "maquina_id" INTEGER NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "contador_inicial" DECIMAL(12,2) NOT NULL,
    "contador_actual" DECIMAL(12,2) NOT NULL,
    "contador_final" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cortes_maquinas_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temp_store" (
    "key" VARCHAR(64) NOT NULL,
    "data" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temp_store_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "folio_counter" (
    "id" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "seq" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "folio_counter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_rol_id_idx" ON "usuarios"("rol_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_sucursales_usuario_id_sucursal_id_key" ON "usuarios_sucursales"("usuario_id", "sucursal_id");

-- CreateIndex
CREATE INDEX "categorias_tipo_idx" ON "categorias"("tipo");

-- CreateIndex
CREATE INDEX "proveedores_activo_idx" ON "proveedores"("activo");

-- CreateIndex
CREATE INDEX "productos_categoria_id_idx" ON "productos"("categoria_id");

-- CreateIndex
CREATE INDEX "productos_activo_idx" ON "productos"("activo");

-- CreateIndex
CREATE INDEX "productos_maquina_id_idx" ON "productos"("maquina_id");

-- CreateIndex
CREATE INDEX "productos_sucursal_id_idx" ON "productos"("sucursal_id");

-- CreateIndex
CREATE UNIQUE INDEX "productos_codigo_sucursal_id_key" ON "productos"("codigo", "sucursal_id");

-- CreateIndex
CREATE INDEX "producto_precios_producto_id_idx" ON "producto_precios"("producto_id");

-- CreateIndex
CREATE UNIQUE INDEX "producto_precios_producto_id_nivel_key" ON "producto_precios"("producto_id", "nivel");

-- CreateIndex
CREATE INDEX "maquinas_sucursal_id_idx" ON "maquinas"("sucursal_id");

-- CreateIndex
CREATE INDEX "maquinas_activo_idx" ON "maquinas"("activo");

-- CreateIndex
CREATE INDEX "impresiones_maquina_id_fecha_idx" ON "impresiones"("maquina_id", "fecha");

-- CreateIndex
CREATE INDEX "impresiones_fecha_idx" ON "impresiones"("fecha");

-- CreateIndex
CREATE INDEX "impresiones_producto_id_idx" ON "impresiones"("producto_id");

-- CreateIndex
CREATE INDEX "inventario_producto_id_sucursal_id_idx" ON "inventario"("producto_id", "sucursal_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventario_producto_id_sucursal_id_key" ON "inventario"("producto_id", "sucursal_id");

-- CreateIndex
CREATE UNIQUE INDEX "ventas_folio_key" ON "ventas"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "ventas_cotizacion_id_key" ON "ventas"("cotizacion_id");

-- CreateIndex
CREATE INDEX "ventas_sucursal_id_idx" ON "ventas"("sucursal_id");

-- CreateIndex
CREATE INDEX "ventas_cliente_id_idx" ON "ventas"("cliente_id");

-- CreateIndex
CREATE INDEX "ventas_created_at_idx" ON "ventas"("created_at");

-- CreateIndex
CREATE INDEX "ventas_metodo_pago_id_idx" ON "ventas"("metodo_pago_id");

-- CreateIndex
CREATE INDEX "ventas_estado_pago_idx" ON "ventas"("estado_pago");

-- CreateIndex
CREATE INDEX "mermas_tipo_idx" ON "mermas"("tipo");

-- CreateIndex
CREATE INDEX "mermas_fecha_idx" ON "mermas"("fecha");

-- CreateIndex
CREATE INDEX "mermas_venta_id_idx" ON "mermas"("venta_id");

-- CreateIndex
CREATE INDEX "mermas_producto_id_idx" ON "mermas"("producto_id");

-- CreateIndex
CREATE INDEX "mermas_insumo_id_idx" ON "mermas"("insumo_id");

-- CreateIndex
CREATE INDEX "mermas_maquina_id_idx" ON "mermas"("maquina_id");

-- CreateIndex
CREATE INDEX "kardex_movimientos_producto_id_sucursal_id_idx" ON "kardex_movimientos"("producto_id", "sucursal_id");

-- CreateIndex
CREATE INDEX "kardex_movimientos_created_at_idx" ON "kardex_movimientos"("created_at");

-- CreateIndex
CREATE INDEX "insumos_activo_idx" ON "insumos"("activo");

-- CreateIndex
CREATE INDEX "insumos_sucursal_id_idx" ON "insumos"("sucursal_id");

-- CreateIndex
CREATE UNIQUE INDEX "insumos_codigo_sucursal_id_key" ON "insumos"("codigo", "sucursal_id");

-- CreateIndex
CREATE INDEX "compras_insumos_fecha_idx" ON "compras_insumos"("fecha");

-- CreateIndex
CREATE INDEX "compras_insumos_proveedor_id_idx" ON "compras_insumos"("proveedor_id");

-- CreateIndex
CREATE INDEX "compras_insumos_insumo_id_idx" ON "compras_insumos"("insumo_id");

-- CreateIndex
CREATE INDEX "compras_insumos_sucursal_id_idx" ON "compras_insumos"("sucursal_id");

-- CreateIndex
CREATE UNIQUE INDEX "unidades_medida_nombre_key" ON "unidades_medida"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "gastos_categorias_nombre_key" ON "gastos_categorias"("nombre");

-- CreateIndex
CREATE INDEX "gastos_fecha_idx" ON "gastos"("fecha");

-- CreateIndex
CREATE INDEX "gastos_categoria_id_idx" ON "gastos"("categoria_id");

-- CreateIndex
CREATE INDEX "gastos_tipo_idx" ON "gastos"("tipo");

-- CreateIndex
CREATE INDEX "gastos_sucursal_id_idx" ON "gastos"("sucursal_id");

-- CreateIndex
CREATE INDEX "insumos_inventario_insumo_id_sucursal_id_idx" ON "insumos_inventario"("insumo_id", "sucursal_id");

-- CreateIndex
CREATE UNIQUE INDEX "insumos_inventario_insumo_id_sucursal_id_key" ON "insumos_inventario"("insumo_id", "sucursal_id");

-- CreateIndex
CREATE INDEX "producto_insumos_producto_id_idx" ON "producto_insumos"("producto_id");

-- CreateIndex
CREATE INDEX "producto_insumos_insumo_id_idx" ON "producto_insumos"("insumo_id");

-- CreateIndex
CREATE UNIQUE INDEX "producto_insumos_producto_id_insumo_id_key" ON "producto_insumos"("producto_id", "insumo_id");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_clave_key" ON "configuracion"("clave");

-- CreateIndex
CREATE INDEX "configuracion_grupo_idx" ON "configuracion"("grupo");

-- CreateIndex
CREATE UNIQUE INDEX "cotizaciones_folio_key" ON "cotizaciones"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "cotizaciones_venta_id_key" ON "cotizaciones"("venta_id");

-- CreateIndex
CREATE INDEX "cotizaciones_cliente_id_idx" ON "cotizaciones"("cliente_id");

-- CreateIndex
CREATE INDEX "cotizaciones_estado_idx" ON "cotizaciones"("estado");

-- CreateIndex
CREATE INDEX "cotizaciones_created_at_idx" ON "cotizaciones"("created_at");

-- CreateIndex
CREATE INDEX "ventas_abonos_venta_id_idx" ON "ventas_abonos"("venta_id");

-- CreateIndex
CREATE INDEX "permisos_modulo_idx" ON "permisos"("modulo");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_modulo_accion_key" ON "permisos"("modulo", "accion");

-- CreateIndex
CREATE INDEX "rol_permisos_rol_id_idx" ON "rol_permisos"("rol_id");

-- CreateIndex
CREATE INDEX "rol_permisos_permiso_id_idx" ON "rol_permisos"("permiso_id");

-- CreateIndex
CREATE UNIQUE INDEX "rol_permisos_rol_id_permiso_id_key" ON "rol_permisos"("rol_id", "permiso_id");

-- CreateIndex
CREATE INDEX "metodos_pago_activo_idx" ON "metodos_pago"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "metodos_pago_nombre_key" ON "metodos_pago"("nombre");

-- CreateIndex
CREATE INDEX "audit_log_usuario_id_idx" ON "audit_log"("usuario_id");

-- CreateIndex
CREATE INDEX "audit_log_modulo_idx" ON "audit_log"("modulo");

-- CreateIndex
CREATE INDEX "audit_log_created_at_idx" ON "audit_log"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "notificaciones_config_tipo_key" ON "notificaciones_config"("tipo");

-- CreateIndex
CREATE INDEX "ordenes_produccion_estatus_idx" ON "ordenes_produccion"("estatus");

-- CreateIndex
CREATE INDEX "ordenes_produccion_sucursal_id_idx" ON "ordenes_produccion"("sucursal_id");

-- CreateIndex
CREATE INDEX "ordenes_produccion_producto_id_idx" ON "ordenes_produccion"("producto_id");

-- CreateIndex
CREATE INDEX "ordenes_produccion_usuario_asignado_id_idx" ON "ordenes_produccion"("usuario_asignado_id");

-- CreateIndex
CREATE INDEX "ordenes_produccion_fecha_creacion_idx" ON "ordenes_produccion"("fecha_creacion");

-- CreateIndex
CREATE INDEX "ordenes_produccion_historial_orden_id_idx" ON "ordenes_produccion_historial"("orden_id");

-- CreateIndex
CREATE INDEX "ordenes_produccion_historial_created_at_idx" ON "ordenes_produccion_historial"("created_at");

-- CreateIndex
CREATE INDEX "cortes_caja_sucursal_id_idx" ON "cortes_caja"("sucursal_id");

-- CreateIndex
CREATE INDEX "cortes_caja_fecha_apertura_idx" ON "cortes_caja"("fecha_apertura");

-- CreateIndex
CREATE INDEX "cortes_caja_estado_idx" ON "cortes_caja"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "cortes_maquinas_corte_caja_id_key" ON "cortes_maquinas"("corte_caja_id");

-- CreateIndex
CREATE INDEX "cortes_maquinas_sucursal_id_idx" ON "cortes_maquinas"("sucursal_id");

-- CreateIndex
CREATE INDEX "cortes_maquinas_detalle_maquina_id_idx" ON "cortes_maquinas_detalle"("maquina_id");

-- CreateIndex
CREATE UNIQUE INDEX "cortes_maquinas_detalle_cortes_maquinas_id_maquina_id_key" ON "cortes_maquinas_detalle"("cortes_maquinas_id", "maquina_id");

-- CreateIndex
CREATE INDEX "temp_store_expires_at_idx" ON "temp_store"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "folio_counter_fecha_key" ON "folio_counter"("fecha");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_sucursales" ADD CONSTRAINT "usuarios_sucursales_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_sucursales" ADD CONSTRAINT "usuarios_sucursales_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_maquina_id_fkey" FOREIGN KEY ("maquina_id") REFERENCES "maquinas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_precios" ADD CONSTRAINT "producto_precios_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maquinas" ADD CONSTRAINT "maquinas_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impresiones" ADD CONSTRAINT "impresiones_maquina_id_fkey" FOREIGN KEY ("maquina_id") REFERENCES "maquinas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impresiones" ADD CONSTRAINT "impresiones_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impresiones" ADD CONSTRAINT "impresiones_venta_detalle_id_fkey" FOREIGN KEY ("venta_detalle_id") REFERENCES "venta_detalle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impresiones" ADD CONSTRAINT "impresiones_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impresiones" ADD CONSTRAINT "impresiones_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impresiones" ADD CONSTRAINT "impresiones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impresiones" ADD CONSTRAINT "impresiones_merma_id_fkey" FOREIGN KEY ("merma_id") REFERENCES "mermas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_metodo_pago_id_fkey" FOREIGN KEY ("metodo_pago_id") REFERENCES "metodos_pago"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta_detalle" ADD CONSTRAINT "venta_detalle_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta_detalle" ADD CONSTRAINT "venta_detalle_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mermas" ADD CONSTRAINT "mermas_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mermas" ADD CONSTRAINT "mermas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mermas" ADD CONSTRAINT "mermas_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mermas" ADD CONSTRAINT "mermas_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mermas" ADD CONSTRAINT "mermas_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mermas" ADD CONSTRAINT "mermas_maquina_id_fkey" FOREIGN KEY ("maquina_id") REFERENCES "maquinas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kardex_movimientos" ADD CONSTRAINT "kardex_movimientos_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kardex_movimientos" ADD CONSTRAINT "kardex_movimientos_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kardex_movimientos" ADD CONSTRAINT "kardex_movimientos_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kardex_movimientos" ADD CONSTRAINT "kardex_movimientos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insumos" ADD CONSTRAINT "insumos_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insumos" ADD CONSTRAINT "insumos_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras_insumos" ADD CONSTRAINT "compras_insumos_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras_insumos" ADD CONSTRAINT "compras_insumos_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras_insumos" ADD CONSTRAINT "compras_insumos_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras_insumos" ADD CONSTRAINT "compras_insumos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "gastos_categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_autorizado_por_fkey" FOREIGN KEY ("autorizado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insumos_inventario" ADD CONSTRAINT "insumos_inventario_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insumos_inventario" ADD CONSTRAINT "insumos_inventario_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_insumos" ADD CONSTRAINT "producto_insumos_producto_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_insumos" ADD CONSTRAINT "producto_insumos_insumo_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizacion_detalle" ADD CONSTRAINT "cotizacion_detalle_cotizacion_id_fkey" FOREIGN KEY ("cotizacion_id") REFERENCES "cotizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizacion_detalle" ADD CONSTRAINT "cotizacion_detalle_producto_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas_abonos" ADD CONSTRAINT "ventas_abonos_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas_abonos" ADD CONSTRAINT "ventas_abonos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permisos" ADD CONSTRAINT "rol_permisos_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permisos" ADD CONSTRAINT "rol_permisos_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "permisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_produccion" ADD CONSTRAINT "ordenes_produccion_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_produccion" ADD CONSTRAINT "ordenes_produccion_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_produccion" ADD CONSTRAINT "ordenes_produccion_maquina_id_fkey" FOREIGN KEY ("maquina_id") REFERENCES "maquinas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_produccion" ADD CONSTRAINT "ordenes_produccion_usuario_creador_id_fkey" FOREIGN KEY ("usuario_creador_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_produccion" ADD CONSTRAINT "ordenes_produccion_usuario_asignado_id_fkey" FOREIGN KEY ("usuario_asignado_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_produccion_historial" ADD CONSTRAINT "ordenes_produccion_historial_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes_produccion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_produccion_historial" ADD CONSTRAINT "ordenes_produccion_historial_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cortes_caja" ADD CONSTRAINT "cortes_caja_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cortes_caja" ADD CONSTRAINT "cortes_caja_usuario_apertura_id_fkey" FOREIGN KEY ("usuario_apertura_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cortes_caja" ADD CONSTRAINT "cortes_caja_usuario_cierre_id_fkey" FOREIGN KEY ("usuario_cierre_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cortes_maquinas" ADD CONSTRAINT "cortes_maquinas_corte_caja_id_fkey" FOREIGN KEY ("corte_caja_id") REFERENCES "cortes_caja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cortes_maquinas" ADD CONSTRAINT "cortes_maquinas_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cortes_maquinas_detalle" ADD CONSTRAINT "cortes_maquinas_detalle_cortes_maquinas_id_fkey" FOREIGN KEY ("cortes_maquinas_id") REFERENCES "cortes_maquinas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cortes_maquinas_detalle" ADD CONSTRAINT "cortes_maquinas_detalle_maquina_id_fkey" FOREIGN KEY ("maquina_id") REFERENCES "maquinas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

