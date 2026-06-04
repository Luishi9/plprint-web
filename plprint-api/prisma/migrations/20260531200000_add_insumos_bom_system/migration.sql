-- CreateTable
CREATE TABLE `insumos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(50) NULL,
    `nombre` VARCHAR(150) NOT NULL,
    `descripcion` TEXT NULL,
    `unidad_medida` VARCHAR(20) NOT NULL DEFAULT 'unidad',
    `precio_compra` DECIMAL(10, 2) NULL,
    `proveedor_id` INTEGER NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `insumos_codigo_key`(`codigo`),
    INDEX `insumos_activo_idx`(`activo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `insumos_inventario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `insumo_id` INTEGER NOT NULL,
    `sucursal_id` INTEGER NOT NULL,
    `cantidad` DECIMAL(12, 3) NOT NULL DEFAULT 0,
    `stock_minimo` DECIMAL(12, 3) NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `insumos_inventario_insumo_id_sucursal_id_key`(`insumo_id`, `sucursal_id`),
    INDEX `insumos_inventario_insumo_id_sucursal_id_idx`(`insumo_id`, `sucursal_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `producto_insumos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `producto_id` INTEGER NOT NULL,
    `insumo_id` INTEGER NOT NULL,
    `cantidad_requerida` DECIMAL(12, 3) NOT NULL,

    UNIQUE INDEX `producto_insumos_producto_id_insumo_id_key`(`producto_id`, `insumo_id`),
    INDEX `producto_insumos_producto_id_idx`(`producto_id`),
    INDEX `producto_insumos_insumo_id_idx`(`insumo_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `insumos` ADD CONSTRAINT `insumos_proveedor_id_fkey` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `insumos_inventario` ADD CONSTRAINT `insumos_inventario_insumo_id_fkey` FOREIGN KEY (`insumo_id`) REFERENCES `insumos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `insumos_inventario` ADD CONSTRAINT `insumos_inventario_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `producto_insumos` ADD CONSTRAINT `producto_insumos_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `producto_insumos` ADD CONSTRAINT `producto_insumos_insumo_id_fkey` FOREIGN KEY (`insumo_id`) REFERENCES `insumos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
