ALTER TABLE `venta_detalle`
  ADD COLUMN `ancho_m` DECIMAL(10, 4) NULL,
  ADD COLUMN `alto_m` DECIMAL(10, 4) NULL,
  ADD COLUMN `unidad_medida_detalle` VARCHAR(20) NULL;

ALTER TABLE `cotizacion_detalle`
  ADD COLUMN `ancho_m` DECIMAL(10, 4) NULL,
  ADD COLUMN `alto_m` DECIMAL(10, 4) NULL,
  ADD COLUMN `unidad_medida_detalle` VARCHAR(20) NULL;
