-- ============================================================
-- SISTEMA POS + INVENTARIO MULTI-SUCURSAL
-- Motor: MySQL 8.0+ con InnoDB
-- ============================================================

CREATE DATABASE IF NOT EXISTS plprint
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE plprint;

-- ------------------------------------------------------------
-- Roles de usuarios
-- ------------------------------------------------------------
CREATE TABLE roles (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(50)  UNIQUE NOT NULL,  -- admin, vendedor, operador
  descripcion VARCHAR(200),
  activo      BOOLEAN      DEFAULT TRUE,
  es_sistema  BOOLEAN      DEFAULT FALSE,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Sucursales
-- ------------------------------------------------------------
CREATE TABLE sucursales (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL,
  direccion  TEXT,
  telefono   VARCHAR(20),
  activa     BOOLEAN      DEFAULT true,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Usuarios
-- ------------------------------------------------------------
CREATE TABLE usuarios (
  id            INT          AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT         NOT NULL,
  rol_id        INT,
  activo        BOOLEAN      DEFAULT true,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles(id)
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Usuarios <-> Sucursales (un usuario puede operar en varias)
-- ------------------------------------------------------------
CREATE TABLE usuarios_sucursales (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  sucursal_id INT NOT NULL,
  UNIQUE KEY uq_usuario_sucursal (usuario_id, sucursal_id),
  CONSTRAINT fk_us_usuario  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)   ON DELETE CASCADE,
  CONSTRAINT fk_us_sucursal FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Categorias de productos
-- ------------------------------------------------------------
CREATE TABLE categorias (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL,
  activo     BOOLEAN      DEFAULT true,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Proveedores (stub Fase 2 — arquitectura preparada)
-- ------------------------------------------------------------
CREATE TABLE proveedores (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(150) NOT NULL,
  contacto   VARCHAR(100),
  telefono   VARCHAR(20),
  email      VARCHAR(150),
  direccion  TEXT,
  activo     BOOLEAN      DEFAULT true,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Productos (catalogo global; el stock vive en inventario)
-- ------------------------------------------------------------
CREATE TABLE productos (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  codigo        VARCHAR(50)   UNIQUE,
  nombre        VARCHAR(150)  NOT NULL,
  descripcion   TEXT,
  precio_venta  DECIMAL(10,2) NOT NULL CHECK (precio_venta  >= 0),
  precio_compra DECIMAL(10,2)           CHECK (precio_compra >= 0),
  categoria_id  INT,
  proveedor_id  INT,
  unidad_medida VARCHAR(20)   DEFAULT 'unidad',
  imagen_url    TEXT,
  activo        BOOLEAN       DEFAULT true,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  CONSTRAINT fk_producto_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Inventario por sucursal
-- ------------------------------------------------------------
CREATE TABLE inventario (
  id           INT       AUTO_INCREMENT PRIMARY KEY,
  producto_id  INT       NOT NULL,
  sucursal_id  INT       NOT NULL,
  cantidad     INT       NOT NULL DEFAULT 0 CHECK (cantidad    >= 0),
  stock_minimo INT                DEFAULT 0 CHECK (stock_minimo >= 0),
  stock_maximo INT                          CHECK (stock_maximo >= 0),
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_inventario (producto_id, sucursal_id),
  CONSTRAINT fk_inv_producto  FOREIGN KEY (producto_id) REFERENCES productos(id)  ON DELETE CASCADE,
  CONSTRAINT fk_inv_sucursal  FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Clientes
-- ------------------------------------------------------------
CREATE TABLE clientes (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(150) NOT NULL,
  telefono   VARCHAR(20),
  email      VARCHAR(150),
  direccion  TEXT,
  activo     BOOLEAN      DEFAULT true,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Ventas
-- ------------------------------------------------------------
CREATE TABLE ventas (
  id             INT           AUTO_INCREMENT PRIMARY KEY,
  sucursal_id    INT,
  cliente_id     INT,
  usuario_id     INT,
  total          DECIMAL(10,2) NOT NULL CHECK (total    >= 0),
  descuento      DECIMAL(10,2) DEFAULT 0 CHECK (descuento >= 0),
  metodo_pago    VARCHAR(30)   DEFAULT 'efectivo'
                  CHECK (metodo_pago IN ('efectivo','tarjeta','transferencia','otro')),
  metodo_pago_id INT,
  estado         VARCHAR(20)   DEFAULT 'completada'
                  CHECK (estado IN ('completada','cancelada','devuelta','pendiente')),
  notas          TEXT,
  created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_venta_sucursal     FOREIGN KEY (sucursal_id)    REFERENCES sucursales(id),
  CONSTRAINT fk_venta_cliente      FOREIGN KEY (cliente_id)     REFERENCES clientes(id),
  CONSTRAINT fk_venta_usuario      FOREIGN KEY (usuario_id)     REFERENCES usuarios(id),
  CONSTRAINT fk_venta_metodo_pago  FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id)
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Detalle de venta (lineas de producto)
-- ------------------------------------------------------------
CREATE TABLE venta_detalle (
  id              INT           AUTO_INCREMENT PRIMARY KEY,
  venta_id        INT           NOT NULL,
  producto_id     INT,
  cantidad        INT           NOT NULL CHECK (cantidad        > 0),
  precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
  descuento       DECIMAL(10,2) DEFAULT 0 CHECK (descuento      >= 0),
  subtotal        DECIMAL(10,2) NOT NULL CHECK (subtotal        >= 0),
  CONSTRAINT fk_detalle_venta    FOREIGN KEY (venta_id)   REFERENCES ventas(id)    ON DELETE CASCADE,
  CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Kardex — historial de movimientos de inventario por sucursal
-- (declarado despues de ventas para poder referenciarla via FK)
-- ------------------------------------------------------------
CREATE TABLE kardex_movimientos (
  id          INT         AUTO_INCREMENT PRIMARY KEY,
  producto_id INT,
  sucursal_id INT,
  tipo        VARCHAR(20) NOT NULL
                CHECK (tipo IN ('entrada','salida','ajuste')),
  cantidad    INT         NOT NULL,
  venta_id    INT,
  referencia  VARCHAR(100),
  notas       TEXT,
  usuario_id  INT,
  created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_kardex_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
  CONSTRAINT fk_kardex_sucursal FOREIGN KEY (sucursal_id) REFERENCES sucursales(id),
  CONSTRAINT fk_kardex_venta    FOREIGN KEY (venta_id)    REFERENCES ventas(id)    ON DELETE SET NULL,
  CONSTRAINT fk_kardex_usuario  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)
) ENGINE = InnoDB;

-- ============================================================
-- INDICES PARA PERFORMANCE
-- ============================================================

CREATE INDEX idx_inventario_producto_sucursal
  ON inventario(producto_id, sucursal_id);

CREATE INDEX idx_kardex_producto_sucursal
  ON kardex_movimientos(producto_id, sucursal_id);

CREATE INDEX idx_kardex_created_at
  ON kardex_movimientos(created_at);

CREATE INDEX idx_ventas_sucursal
  ON ventas(sucursal_id);

CREATE INDEX idx_ventas_cliente
  ON ventas(cliente_id);

CREATE INDEX idx_ventas_created_at
  ON ventas(created_at);

CREATE INDEX idx_productos_categoria
  ON productos(categoria_id);

CREATE INDEX idx_productos_activo
  ON productos(activo);

CREATE INDEX idx_productos_codigo
  ON productos(codigo);

-- ============================================================
-- INSUMOS — SISTEMA BOM (BILL OF MATERIALS)
-- ============================================================

-- ------------------------------------------------------------
-- Insumos (materias primas)
-- ------------------------------------------------------------
CREATE TABLE insumos (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  codigo        VARCHAR(50)   UNIQUE,
  nombre        VARCHAR(150)  NOT NULL,
  descripcion   TEXT,
  unidad_medida VARCHAR(20)   DEFAULT 'unidad',
  precio_compra DECIMAL(10,2),
  proveedor_id  INT,
  activo        BOOLEAN       DEFAULT TRUE,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_insumo_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
  INDEX idx_insumos_activo (activo)
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Inventario de insumos por sucursal
-- ------------------------------------------------------------
CREATE TABLE insumos_inventario (
  id           INT          AUTO_INCREMENT PRIMARY KEY,
  insumo_id    INT          NOT NULL,
  sucursal_id  INT          NOT NULL,
  cantidad     DECIMAL(12,3) DEFAULT 0,
  stock_minimo DECIMAL(12,3) DEFAULT 0,
  updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_insumos_inv_insumo   FOREIGN KEY (insumo_id)   REFERENCES insumos(id)   ON DELETE CASCADE,
  CONSTRAINT fk_insumos_inv_sucursal FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE CASCADE,
  UNIQUE KEY uk_insumo_sucursal (insumo_id, sucursal_id),
  INDEX idx_insumos_inv_insumo_sucursal (insumo_id, sucursal_id)
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Producto-Insumos (receta/BOM)
-- ------------------------------------------------------------
CREATE TABLE producto_insumos (
  id                 INT          AUTO_INCREMENT PRIMARY KEY,
  producto_id        INT          NOT NULL,
  insumo_id          INT          NOT NULL,
  cantidad_requerida DECIMAL(12,3) NOT NULL,
  CONSTRAINT fk_prod_ins_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  CONSTRAINT fk_prod_ins_insumo   FOREIGN KEY (insumo_id)   REFERENCES insumos(id)   ON DELETE CASCADE,
  UNIQUE KEY uk_producto_insumo (producto_id, insumo_id),
  INDEX idx_prod_ins_producto (producto_id),
  INDEX idx_prod_ins_insumo (insumo_id)
) ENGINE = InnoDB;

-- ============================================================
-- CONFIGURACION DEL SISTEMA (key-value store)
-- Almacena ajustes generales: empresa, IVA, moneda, ticket, etc.
-- ============================================================

CREATE TABLE configuracion (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  clave      VARCHAR(100) NOT NULL UNIQUE,
  valor      TEXT,
  tipo       VARCHAR(20)  DEFAULT 'string',
  grupo      VARCHAR(50),
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_grupo (grupo)
) ENGINE = InnoDB;

-- ============================================================
-- RBAC DINAMICO — Permisos por rol
-- ============================================================

-- ------------------------------------------------------------
-- Catalogo de permisos (modulo + accion)
-- ------------------------------------------------------------
CREATE TABLE permisos (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  modulo      VARCHAR(50)  NOT NULL,
  accion      VARCHAR(50)  NOT NULL,
  descripcion VARCHAR(200),
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_modulo_accion (modulo, accion),
  INDEX idx_modulo (modulo)
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Relacion rol <-> permisos (muchos a muchos)
-- ------------------------------------------------------------
CREATE TABLE rol_permisos (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  rol_id     INT NOT NULL,
  permiso_id INT NOT NULL,
  CONSTRAINT fk_rol_permiso_rol     FOREIGN KEY (rol_id)     REFERENCES roles(id)     ON DELETE CASCADE,
  CONSTRAINT fk_rol_permiso_permiso FOREIGN KEY (permiso_id) REFERENCES permisos(id)   ON DELETE CASCADE,
  UNIQUE KEY uk_rol_permiso (rol_id, permiso_id),
  INDEX idx_rol_permiso_rol (rol_id),
  INDEX idx_rol_permiso_permiso (permiso_id)
) ENGINE = InnoDB;

-- ============================================================
-- METODOS DE PAGO CONFIGURABLES
-- ============================================================

-- ------------------------------------------------------------
-- Catalogo de metodos de pago
-- ------------------------------------------------------------
CREATE TABLE metodos_pago (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(50)  NOT NULL UNIQUE,
  icono      VARCHAR(30),
  activo     BOOLEAN      DEFAULT TRUE,
  es_sistema BOOLEAN      DEFAULT FALSE,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_metodos_pago_activo (activo)
) ENGINE = InnoDB;

-- Datos iniciales del sistema
INSERT INTO metodos_pago (nombre, icono, es_sistema) VALUES
  ('Efectivo', 'Banknote', TRUE),
  ('Tarjeta', 'CreditCard', TRUE),
  ('Transferencia', 'Landmark', TRUE);

-- ============================================================
-- AUDIT LOG — Bitacora de acciones
-- ============================================================

-- ------------------------------------------------------------
-- Registro de acciones de usuarios
-- ------------------------------------------------------------
CREATE TABLE audit_log (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  accion     VARCHAR(50)  NOT NULL,  -- crear, editar, eliminar, login, logout, etc.
  modulo     VARCHAR(50)  NOT NULL,  -- productos, ventas, configuracion, etc.
  detalle    TEXT,                   -- JSON con informacion adicional
  ip         VARCHAR(45),            -- IPv4 o IPv6
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_audit_usuario (usuario_id),
  INDEX idx_audit_modulo (modulo),
  INDEX idx_audit_created_at (created_at)
) ENGINE = InnoDB;

-- ============================================================
-- NOTIFICACIONES — Configuracion de alertas
-- ============================================================

-- ------------------------------------------------------------
-- Configuracion de tipos de notificacion
-- ------------------------------------------------------------
CREATE TABLE notificaciones_config (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  tipo       VARCHAR(50)  NOT NULL UNIQUE,  -- stock_bajo, insumos_bajos, ventas_dia, etc.
  activo     BOOLEAN      DEFAULT TRUE,
  umbral     DECIMAL(12,3),                  -- umbral configurable (stock minimo, etc.)
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB;
