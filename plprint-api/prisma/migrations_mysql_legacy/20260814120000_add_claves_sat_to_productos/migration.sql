-- AlterTable: agregar claves SAT (CFDI) a productos
ALTER TABLE `productos`
  ADD COLUMN `clave_prod_serv` VARCHAR(20) NULL,
  ADD COLUMN `clave_unidad` VARCHAR(10) NULL;
