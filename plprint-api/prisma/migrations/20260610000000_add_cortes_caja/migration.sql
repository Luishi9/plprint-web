-- CreateTable: cortes_caja
CREATE TABLE `cortes_caja` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sucursal_id` INTEGER NOT NULL,
    `usuario_apertura_id` INTEGER NOT NULL,
    `fecha_apertura` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `monto_inicial` DECIMAL(12, 2) NOT NULL,
    `fecha_cierre` DATETIME(3) NULL,
    `usuario_cierre_id` INTEGER NULL,
    `monto_final_esperado` DECIMAL(12, 2) NULL,
    `monto_final_real` DECIMAL(12, 2) NULL,
    `diferencia` DECIMAL(12, 2) NULL,
    `observaciones` TEXT NULL,
    `estado` VARCHAR(10) NOT NULL DEFAULT 'abierta',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `cortes_caja_sucursal_id_idx` ON `cortes_caja`(`sucursal_id`);
CREATE INDEX `cortes_caja_fecha_apertura_idx` ON `cortes_caja`(`fecha_apertura`);
CREATE INDEX `cortes_caja_estado_idx` ON `cortes_caja`(`estado`);

-- AddForeignKey
ALTER TABLE `cortes_caja` ADD CONSTRAINT `cortes_caja_sucursal_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cortes_caja` ADD CONSTRAINT `cortes_caja_usuario_apertura_fkey` FOREIGN KEY (`usuario_apertura_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cortes_caja` ADD CONSTRAINT `cortes_caja_usuario_cierre_fkey` FOREIGN KEY (`usuario_cierre_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
