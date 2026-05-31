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
  id     INT          AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50)  UNIQUE NOT NULL  -- admin, vendedor, operador
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
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  sucursal_id INT,
  cliente_id  INT,
  usuario_id  INT,
  total       DECIMAL(10,2) NOT NULL CHECK (total    >= 0),
  descuento   DECIMAL(10,2) DEFAULT 0 CHECK (descuento >= 0),
  metodo_pago VARCHAR(30)   DEFAULT 'efectivo'
                CHECK (metodo_pago IN ('efectivo','tarjeta','transferencia','otro')),
  estado      VARCHAR(20)   DEFAULT 'completada'
                CHECK (estado IN ('completada','cancelada','devuelta','pendiente')),
  notas       TEXT,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_venta_sucursal FOREIGN KEY (sucursal_id) REFERENCES sucursales(id),
  CONSTRAINT fk_venta_cliente  FOREIGN KEY (cliente_id)  REFERENCES clientes(id),
  CONSTRAINT fk_venta_usuario  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)
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
