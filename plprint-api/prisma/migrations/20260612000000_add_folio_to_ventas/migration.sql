ALTER TABLE `ventas` ADD COLUMN `folio` VARCHAR(20) NULL UNIQUE;
CREATE INDEX `ventas_folio_idx` ON `ventas`(`folio`);
