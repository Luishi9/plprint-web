-- CreateTable
CREATE TABLE `compras_insumos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sucursal_id` INT NULL,
  `proveedor_id` INT NULL,
  `usuario_id` INT NULL,
  `insumo_id` INT NOT NULL,
  `cantidad` DECIMAL(12, 3) NOT NULL,
  `precio_unitario` DECIMAL(10, 2) NOT NULL,
  `total` DECIMAL(12, 2) NOT NULL,
  `notas` TEXT NULL,
  `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `compras_insumos_fecha_idx`(`fecha`),
  INDEX `compras_insumos_proveedor_id_idx`(`proveedor_id`),
  INDEX `compras_insumos_insumo_id_idx`(`insumo_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `compras_insumos` ADD CONSTRAINT `compras_insumos_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compras_insumos` ADD CONSTRAINT `compras_insumos_proveedor_id_fkey` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compras_insumos` ADD CONSTRAINT `compras_insumos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compras_insumos` ADD CONSTRAINT `compras_insumos_insumo_id_fkey` FOREIGN KEY (`insumo_id`) REFERENCES `insumos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
