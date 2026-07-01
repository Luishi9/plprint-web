-- AlterTable
ALTER TABLE `mermas`
  ADD COLUMN `maquina_id` INT NULL AFTER `venta_id`;

-- CreateIndex
CREATE INDEX `mermas_maquina_id_idx` ON `mermas`(`maquina_id`);

-- AddForeignKey
ALTER TABLE `mermas` ADD CONSTRAINT `mermas_maquina_id_fkey` FOREIGN KEY (`maquina_id`) REFERENCES `maquinas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
