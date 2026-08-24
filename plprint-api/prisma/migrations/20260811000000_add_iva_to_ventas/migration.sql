-- AlterTable
ALTER TABLE `ventas` ADD COLUMN `iva_porcentaje` DECIMAL(5, 2) NULL AFTER `metodo_pago_id`,
                       ADD COLUMN `base_gravable` DECIMAL(10, 2) NULL AFTER `iva_porcentaje`,
                       ADD COLUMN `iva` DECIMAL(10, 2) NOT NULL DEFAULT 0 AFTER `base_gravable`;
