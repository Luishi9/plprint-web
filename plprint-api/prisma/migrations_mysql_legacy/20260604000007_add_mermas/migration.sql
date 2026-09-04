-- CreateTable
CREATE TABLE `mermas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo` VARCHAR(20) NOT NULL,
  `producto_id` INT NULL,
  `insumo_id` INT NULL,
  `sucursal_id` INT NULL,
  `usuario_id` INT NULL,
  `venta_id` INT NULL,
  `cantidad` DECIMAL(12, 3) NOT NULL,
  `motivo` VARCHAR(255) NOT NULL,
  `costo_estimado` DECIMAL(12, 2) NULL,
  `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `mermas_tipo_idx`(`tipo`),
  INDEX `mermas_fecha_idx`(`fecha`),
  INDEX `mermas_venta_id_idx`(`venta_id`),
  INDEX `mermas_producto_id_idx`(`producto_id`),
  INDEX `mermas_insumo_id_idx`(`insumo_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mermas` ADD CONSTRAINT `mermas_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mermas` ADD CONSTRAINT `mermas_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mermas` ADD CONSTRAINT `mermas_venta_id_fkey` FOREIGN KEY (`venta_id`) REFERENCES `ventas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mermas` ADD CONSTRAINT `mermas_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mermas` ADD CONSTRAINT `mermas_insumo_id_fkey` FOREIGN KEY (`insumo_id`) REFERENCES `insumos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
