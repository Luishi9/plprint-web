-- Tabla de precios por volumen (medio mayoreo, mayoreo, super mayoreo)
CREATE TABLE `producto_precios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `producto_id` INT NOT NULL,
  `nivel` VARCHAR(20) NOT NULL,
  `cantidad_minima` INT NOT NULL,
  `precio` DECIMAL(10, 2) NOT NULL,
  `activo` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `producto_precios_producto_id_nivel_key`(`producto_id`, `nivel`),
  INDEX `producto_precios_producto_id_idx`(`producto_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
