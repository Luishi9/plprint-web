-- ============================================================
-- Script para renombrar base de datos: elovni → plprint
-- MySQL no soporta RENAME DATABASE directamente.
-- Ejecutar estos pasos en orden:
-- ============================================================

-- 1. Crear la nueva base de datos
CREATE DATABASE IF NOT EXISTS plprint
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Desde terminal, hacer dump y restaurar:
--    mysqldump -u root -p elovni > elovni_backup.sql
--    mysql -u root -p plprint < elovni_backup.sql
--
-- 3. Verificar que todo este correcto en plprint, luego eliminar la vieja:
--    DROP DATABASE elovni;
