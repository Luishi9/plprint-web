-- AlterTable
ALTER TABLE `categorias`
  ADD COLUMN `tipo` VARCHAR(20) NOT NULL DEFAULT 'venta' AFTER `nombre`,
  ADD COLUMN `descripcion` VARCHAR(255) NULL AFTER `tipo`;

-- CreateIndex
CREATE INDEX `categorias_tipo_idx` ON `categorias`(`tipo`);
