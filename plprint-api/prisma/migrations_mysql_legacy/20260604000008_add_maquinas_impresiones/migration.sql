-- CreateTable
CREATE TABLE `maquinas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sucursal_id` INT NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  `tipo` VARCHAR(50) NOT NULL,
  `marca` VARCHAR(50) NULL,
  `modelo` VARCHAR(50) NULL,
  `contador_total` INT NOT NULL DEFAULT 0,
  `reset_diario` BOOLEAN NOT NULL DEFAULT false,
  `activo` BOOLEAN NOT NULL DEFAULT true,
  `fecha_instalacion` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `maquinas_sucursal_id_idx`(`sucursal_id`),
  INDEX `maquinas_activo_idx`(`activo`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `impresiones` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `maquina_id` INT NOT NULL,
  `venta_detalle_id` INT NULL,
  `venta_id` INT NULL,
  `producto_id` INT NULL,
  `sucursal_id` INT NOT NULL,
  `usuario_id` INT NULL,
  `fue_merma` BOOLEAN NOT NULL DEFAULT false,
  `merma_id` INT NULL,
  `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `impresiones_maquina_id_fecha_idx`(`maquina_id`, `fecha`),
  INDEX `impresiones_fecha_idx`(`fecha`),
  INDEX `impresiones_producto_id_idx`(`producto_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `maquinas` ADD CONSTRAINT `maquinas_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `impresiones` ADD CONSTRAINT `impresiones_maquina_id_fkey` FOREIGN KEY (`maquina_id`) REFERENCES `maquinas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `impresiones` ADD CONSTRAINT `impresiones_venta_id_fkey` FOREIGN KEY (`venta_id`) REFERENCES `ventas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `impresiones` ADD CONSTRAINT `impresiones_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `impresiones` ADD CONSTRAINT `impresiones_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `impresiones` ADD CONSTRAINT `impresiones_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `impresiones` ADD CONSTRAINT `impresiones_merma_id_fkey` FOREIGN KEY (`merma_id`) REFERENCES `mermas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `productos`
  ADD COLUMN `maquina_id` INT NULL AFTER `imagen_url`;

-- CreateIndex
CREATE INDEX `productos_maquina_id_idx` ON `productos`(`maquina_id`);

-- AddForeignKey
ALTER TABLE `productos` ADD CONSTRAINT `productos_maquina_id_fkey` FOREIGN KEY (`maquina_id`) REFERENCES `maquinas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
