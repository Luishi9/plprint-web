-- AlterTable
ALTER TABLE `proveedores`
  ADD COLUMN `rfc` VARCHAR(20) NULL AFTER `email`,
  ADD COLUMN `notas` TEXT NULL AFTER `direccion`;

-- CreateIndex
CREATE INDEX `proveedores_activo_idx` ON `proveedores`(`activo`);
