-- Drop unique key on codigo
ALTER TABLE `productos` DROP INDEX `productos_codigo_key`;

-- Add sucursal_id column (nullable first)
ALTER TABLE `productos` ADD COLUMN `sucursal_id` INT NULL AFTER `cobrar_minimo_1`;

-- Add foreign key
ALTER TABLE `productos` ADD CONSTRAINT `productos_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Assign all existing products to Matriz (first active sucursal)
UPDATE `productos` SET `sucursal_id` = (SELECT MIN(`id`) FROM `sucursales` WHERE `activa` = 1) WHERE `sucursal_id` IS NULL;

-- Make sucursal_id NOT NULL
ALTER TABLE `productos` MODIFY `sucursal_id` INT NOT NULL;

-- Add unique index on (codigo, sucursal_id)
CREATE UNIQUE INDEX `productos_codigo_sucursal_id_key` ON `productos`(`codigo`, `sucursal_id`);

-- Add index on sucursal_id
CREATE INDEX `productos_sucursal_id_idx` ON `productos`(`sucursal_id`);
