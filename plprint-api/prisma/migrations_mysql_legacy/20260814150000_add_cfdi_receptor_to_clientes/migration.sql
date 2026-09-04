-- AlterTable: agregar campos CFDI 4.0 (receptor) a clientes
ALTER TABLE `clientes`
  ADD COLUMN `rfc` VARCHAR(39) NULL,
  ADD COLUMN `uso_cfdi` VARCHAR(3) NULL,
  ADD COLUMN `regimen_fiscal_receptor` VARCHAR(3) NULL,
  ADD COLUMN `domicilio_fiscal_cp` VARCHAR(5) NULL;
