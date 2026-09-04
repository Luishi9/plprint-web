-- CreateTable
CREATE TABLE `gastos_categorias` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` VARCHAR(255) NULL,
  `activo` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `gastos_categorias_nombre_key`(`nombre`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gastos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sucursal_id` INT NULL,
  `usuario_id` INT NULL,
  `categoria_id` INT NOT NULL,
  `concepto` VARCHAR(200) NOT NULL,
  `monto` DECIMAL(12, 2) NOT NULL,
  `tipo` VARCHAR(20) NOT NULL DEFAULT 'gasto',
  `autorizado_por` INT NULL,
  `comprobante_url` VARCHAR(500) NULL,
  `notas` TEXT NULL,
  `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `gastos_fecha_idx`(`fecha`),
  INDEX `gastos_categoria_id_idx`(`categoria_id`),
  INDEX `gastos_tipo_idx`(`tipo`),
  INDEX `gastos_sucursal_id_idx`(`sucursal_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `gastos` ADD CONSTRAINT `gastos_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `gastos_categorias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gastos` ADD CONSTRAINT `gastos_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gastos` ADD CONSTRAINT `gastos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gastos` ADD CONSTRAINT `gastos_autorizado_por_fkey` FOREIGN KEY (`autorizado_por`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
