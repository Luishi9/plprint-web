-- CreateTable
CREATE TABLE `ordenes_produccion` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `sucursal_id` INT NOT NULL,
    `producto_id` INT NOT NULL,
    `cantidad` INT NOT NULL,
    `cantidad_producida` INT NOT NULL DEFAULT 0,
    `estatus` VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    `prioridad` VARCHAR(15) NOT NULL DEFAULT 'normal',
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_inicio` DATETIME(3) NULL,
    `fecha_fin_estimada` DATETIME(3) NULL,
    `fecha_fin_real` DATETIME(3) NULL,
    `usuario_creador_id` INT NULL,
    `usuario_asignado_id` INT NULL,
    `maquina_id` INT NULL,
    `notas` TEXT NULL,
    `motivo_cancelacion` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ordenes_produccion_estatus_idx`(`estatus`),
    INDEX `ordenes_produccion_sucursal_id_idx`(`sucursal_id`),
    INDEX `ordenes_produccion_producto_id_idx`(`producto_id`),
    INDEX `ordenes_produccion_usuario_asignado_id_idx`(`usuario_asignado_id`),
    INDEX `ordenes_produccion_fecha_creacion_idx`(`fecha_creacion`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ordenes_produccion_historial` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `orden_id` INT NOT NULL,
    `estatus_anterior` VARCHAR(20) NULL,
    `estatus_nuevo` VARCHAR(20) NOT NULL,
    `usuario_id` INT NULL,
    `notas` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ordenes_produccion_historial_orden_id_idx`(`orden_id`),
    INDEX `ordenes_produccion_historial_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ordenes_produccion` ADD CONSTRAINT `ordenes_produccion_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordenes_produccion` ADD CONSTRAINT `ordenes_produccion_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordenes_produccion` ADD CONSTRAINT `ordenes_produccion_maquina_id_fkey` FOREIGN KEY (`maquina_id`) REFERENCES `maquinas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordenes_produccion` ADD CONSTRAINT `ordenes_produccion_usuario_creador_id_fkey` FOREIGN KEY (`usuario_creador_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordenes_produccion` ADD CONSTRAINT `ordenes_produccion_usuario_asignado_id_fkey` FOREIGN KEY (`usuario_asignado_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordenes_produccion_historial` ADD CONSTRAINT `ordenes_produccion_historial_orden_id_fkey` FOREIGN KEY (`orden_id`) REFERENCES `ordenes_produccion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordenes_produccion_historial` ADD CONSTRAINT `ordenes_produccion_historial_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
