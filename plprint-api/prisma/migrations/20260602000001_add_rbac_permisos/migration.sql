-- AlterTable: agregar columnas nuevas a roles
ALTER TABLE `roles` ADD COLUMN `descripcion` VARCHAR(200) NULL;
ALTER TABLE `roles` ADD COLUMN `activo` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `roles` ADD COLUMN `es_sistema` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `roles` ADD COLUMN `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `roles` ADD COLUMN `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- CreateTable: permisos
CREATE TABLE `permisos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `modulo` VARCHAR(50) NOT NULL,
    `accion` VARCHAR(50) NOT NULL,
    `descripcion` VARCHAR(200) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `permisos_modulo_accion_key`(`modulo`, `accion`),
    INDEX `permisos_modulo_idx`(`modulo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: rol_permisos
CREATE TABLE `rol_permisos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rol_id` INTEGER NOT NULL,
    `permiso_id` INTEGER NOT NULL,

    UNIQUE INDEX `rol_permisos_rol_id_permiso_id_key`(`rol_id`, `permiso_id`),
    INDEX `rol_permisos_rol_id_idx`(`rol_id`),
    INDEX `rol_permisos_permiso_id_idx`(`permiso_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `rol_permisos` ADD CONSTRAINT `rol_permisos_rol_id_fkey` FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rol_permisos` ADD CONSTRAINT `rol_permisos_permiso_id_fkey` FOREIGN KEY (`permiso_id`) REFERENCES `permisos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
