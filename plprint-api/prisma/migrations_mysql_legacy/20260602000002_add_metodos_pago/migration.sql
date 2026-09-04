-- CreateTable: metodos_pago
CREATE TABLE `metodos_pago` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `icono` VARCHAR(30) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `es_sistema` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `metodos_pago_nombre_key`(`nombre`),
    INDEX `metodos_pago_activo_idx`(`activo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insertar metodos de pago del sistema
INSERT INTO `metodos_pago` (`nombre`, `icono`, `es_sistema`) VALUES
  ('Efectivo', 'Banknote', true),
  ('Tarjeta', 'CreditCard', true),
  ('Transferencia', 'Landmark', true);

-- AlterTable: agregar columna metodo_pago_id a ventas
ALTER TABLE `ventas` ADD COLUMN `metodo_pago_id` INTEGER NULL;

-- Migrar ventas existentes: mapear el string al id correspondiente
UPDATE `ventas` v
INNER JOIN `metodos_pago` m ON LOWER(m.nombre) = v.metodo_pago
SET v.metodo_pago_id = m.id
WHERE v.metodo_pago_id IS NULL;

-- Si alguna venta quedó sin metodo_pago_id (por string no reconocido), asignar Efectivo por defecto
UPDATE `ventas` SET metodo_pago_id = (SELECT id FROM metodos_pago WHERE nombre = 'Efectivo' LIMIT 1)
WHERE metodo_pago_id IS NULL;

-- AddForeignKey
ALTER TABLE `ventas` ADD CONSTRAINT `ventas_metodo_pago_id_fkey` FOREIGN KEY (`metodo_pago_id`) REFERENCES `metodos_pago`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX `ventas_metodo_pago_id_idx` ON `ventas`(`metodo_pago_id`);
