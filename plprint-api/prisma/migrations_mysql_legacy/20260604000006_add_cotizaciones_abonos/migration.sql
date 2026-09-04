-- AlterTable
ALTER TABLE `ventas`
  ADD COLUMN `estado_pago` VARCHAR(20) NOT NULL DEFAULT 'pagada' AFTER `estado`,
  ADD COLUMN `saldo_pendiente` DECIMAL(10, 2) NOT NULL DEFAULT 0 AFTER `estado_pago`,
  ADD COLUMN `fecha_limite_pago` DATETIME(3) NULL AFTER `saldo_pendiente`,
  ADD COLUMN `cotizacion_id` INT NULL AFTER `fecha_limite_pago`;

-- CreateTable
CREATE TABLE `cotizaciones` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `folio` VARCHAR(20) NOT NULL,
  `sucursal_id` INT NULL,
  `cliente_id` INT NULL,
  `usuario_id` INT NULL,
  `total` DECIMAL(10, 2) NOT NULL,
  `descuento` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `descuento_motivo` VARCHAR(255) NULL,
  `notas` TEXT NULL,
  `estado` VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  `venta_id` INT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `cotizaciones_folio_key`(`folio`),
  UNIQUE INDEX `cotizaciones_venta_id_key`(`venta_id`),
  INDEX `cotizaciones_cliente_id_idx`(`cliente_id`),
  INDEX `cotizaciones_estado_idx`(`estado`),
  INDEX `cotizaciones_created_at_idx`(`created_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cotizacion_detalle` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cotizacion_id` INT NOT NULL,
  `producto_id` INT NOT NULL,
  `cantidad` INT NOT NULL,
  `precio_unitario` DECIMAL(10, 2) NOT NULL,
  `descuento` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `subtotal` DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ventas_abonos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `venta_id` INT NOT NULL,
  `usuario_id` INT NULL,
  `monto` DECIMAL(10, 2) NOT NULL,
  `metodo_pago` VARCHAR(30) NOT NULL,
  `notas` VARCHAR(255) NULL,
  `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `ventas_abonos_venta_id_idx`(`venta_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ventas_estado_pago_idx` ON `ventas`(`estado_pago`);

-- AddForeignKey
ALTER TABLE `ventas` ADD CONSTRAINT `ventas_cotizacion_id_fkey` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cotizaciones` ADD CONSTRAINT `cotizaciones_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cotizaciones` ADD CONSTRAINT `cotizaciones_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cotizaciones` ADD CONSTRAINT `cotizaciones_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cotizaciones` ADD CONSTRAINT `cotizaciones_venta_id_fkey` FOREIGN KEY (`venta_id`) REFERENCES `ventas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cotizacion_detalle` ADD CONSTRAINT `cotizacion_detalle_cotizacion_id_fkey` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cotizacion_detalle` ADD CONSTRAINT `cotizacion_detalle_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ventas_abonos` ADD CONSTRAINT `ventas_abonos_venta_id_fkey` FOREIGN KEY (`venta_id`) REFERENCES `ventas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ventas_abonos` ADD CONSTRAINT `ventas_abonos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
