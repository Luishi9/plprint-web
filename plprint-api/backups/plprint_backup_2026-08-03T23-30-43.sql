-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: plprint
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.22.04.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('1087896c-f7bc-4f41-84a4-847005711de9','8794e173812538f267ce92120cdebcc3e5530926aca19501990d114781f8688b',NULL,'20260604000007_add_mermas','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260604000007_add_mermas\n\nDatabase error code: 1050\n\nDatabase error:\nTable \'mermas\' already exists\n\nPlease check the query number 1 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20260604000007_add_mermas\"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name=\"20260604000007_add_mermas\"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226','2026-06-04 21:37:43.982','2026-06-04 21:37:26.056',0),('13f6b065-8f03-414a-8fdd-00d32c1d304b','d0918cd1513f7c2750946f015e8df8e249acd2acf10c799919df64cda437f814','2026-06-10 19:55:57.946','20260610000000_add_cortes_caja','',NULL,'2026-06-10 19:55:57.946',0),('152deddb-6c93-482a-a6b4-eca6c6700f87','8794e173812538f267ce92120cdebcc3e5530926aca19501990d114781f8688b','2026-06-04 21:37:45.305','20260604000007_add_mermas',NULL,NULL,'2026-06-04 21:37:44.810',1),('18cccbf2-50f7-4918-b763-d006fbfd11b7','d450d416e6bed4133b97ff4f29751929e98aa3a46c146aabee647a176611c87c','2026-06-05 03:14:07.932','20260604000008_add_maquinas_impresiones',NULL,NULL,'2026-06-05 03:14:07.123',1),('310d7dcc-0212-4363-946a-fd93dd14fa16','808d493fed31d125f2427b30b572bc849353cda0983b1d365795a76fdbecc43b',NULL,'20260602000002_add_metodos_pago','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260602000002_add_metodos_pago\n\nDatabase error code: 1364\n\nDatabase error:\nField \'updated_at\' doesn\'t have a default value\n\nPlease check the query number 2 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20260602000002_add_metodos_pago\"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name=\"20260602000002_add_metodos_pago\"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226','2026-06-03 00:39:45.892','2026-06-03 00:39:23.750',0),('335d962b-d7de-41e4-878c-c3dce9fa95d5','53fa517491954a72a9561da2d4c71410f00cbf4566629bff4db17b7448b32aa6','2026-06-03 00:44:29.525','20260602000004_add_notificaciones_config',NULL,NULL,'2026-06-03 00:44:29.484',1),('33e3a4fd-fff1-4f29-be91-524202dd0e29','541ace24e39c6c234075adabab43c824796e4b3a735077c57e996abbd5dd029c','2026-06-03 00:34:11.087','20260602000001_add_rbac_permisos',NULL,NULL,'2026-06-03 00:34:10.711',1),('35fed187-ddfa-4fcf-ac80-e7165ccc2739','f86b17d7f4d9bb8a498cede5ffc53c6e74500ccc438a5bc5a834c2a17bb83309','2026-06-07 01:00:12.032','20260606000002_add_medidas_to_detalle',NULL,NULL,'2026-06-07 01:00:11.951',1),('410af28b-66af-11f1-9808-fa163e7fbbdf','4abc88f07e66ba62be4dd195152800a85f06f84515f5f656dc18c92a18c2be48','2026-06-12 16:37:12.000','20260612000000_add_folio_to_ventas','Applied manually',NULL,'2026-06-12 16:37:12.000',1),('42294841-fde2-4289-92c1-51ed1725fb26','10e5a607cc8194cf5ab98e4fa1a8baaa0b7553f32b5d3bba949c9499984f6405','2026-06-04 20:39:19.946','20260604000004_add_compras_insumos',NULL,NULL,'2026-06-04 20:39:19.625',1),('51ee1a10-5290-4094-a888-df5a68c6997f','0f85ff0d324f18ad1204a6ba7182fe3ec37ed1bde2df3f6d9e4237ae826982b9','2026-06-05 18:56:51.723','20260605000000_add_ordenes_produccion',NULL,NULL,'2026-06-05 18:56:51.056',1),('53d3e95b-a17f-4df4-93a7-30ce1fb1d6ee','dd678a58e200680f9eadbdb0c2895c4d2e3bdcaeff309a9162b5ad9128e251b7','2026-06-07 01:00:11.948','20260606000001_add_medida_to_unidades',NULL,NULL,'2026-06-07 01:00:11.888',1),('57d2991d-b65b-484e-a9e6-8e78110f6814','8cc8e0547989248e539fc0c36f9cf7db833346f9e6496a05518f8ce960db52a5','2026-06-06 21:13:08.457','20260606000000_add_producto_precios',NULL,NULL,'2026-06-06 21:13:08.339',1),('5bd1a09d-74c7-460b-89a7-5c111b79e0c3','1779e5826e2e7de8718a1fcc883336cbf88878a213bfacda9a1abd8be6ea4ec9','2026-05-31 21:27:09.008','20260410194635_elovnii','',NULL,'2026-05-31 21:27:09.008',0),('63658974-1ca5-4787-957f-8ae2583e8011','9cc43b1db8e450a8abbdaf4c1f3430ea4e5e5cdd621a365ea2348d847d563931','2026-07-30 23:44:38.337','20260729000000_add_cortes_maquinas','',NULL,'2026-07-30 23:44:38.337',0),('6650a759-ebae-4a78-8ee9-57dda170f548','6e701964f17b449120b1152ba5c329d3afa1d2cb4c65536303489f62fc7c6778','2026-05-31 21:27:14.728','20260411010036_add_token_version',NULL,NULL,'2026-05-31 21:27:14.549',1),('687e07e3-cbaa-4c6a-b05b-9b58eea261e2','15da43dc363ca5d37f0cb08ec766de26c29b3b58acc6628d5a734b5a1d449654','2026-06-04 20:25:14.744','20260604000002_add_unidades_medida',NULL,NULL,'2026-06-04 20:25:14.710',1),('6e9c04da-7935-4357-bbaa-32fc9a9ef9ea','c5a67bc71fef6cec9462fe654c1f7300efe6417d07dc6b8e42e8512875e5219d','2026-08-01 23:44:52.748','20260729000001_contadores_machine_decimal','',NULL,'2026-08-01 23:44:52.748',0),('7b15f4a9-0754-4073-a7a0-d7e40f26b3a0','cf11088125667eac91636cc000cb5bcebef640acd7bf5a36c6d0a71964bffa2c','2026-06-04 19:03:07.360','20260604000000_add_descuento_motivo',NULL,NULL,'2026-06-04 19:03:07.324',1),('7cd6b631-a151-4f93-abbd-48347b6fe581','68fccbdd12a69bd2ee2c97159744afbcf0f55d963f8535d2e16a6b5f22c32a04','2026-06-01 01:23:59.182','20260531200000_add_insumos_bom_system',NULL,NULL,'2026-06-01 01:23:58.575',1),('81a49b6d-2a7c-4d3d-a7a0-c390939fa232','f79a5999f5a6c0869ed1aa921598b466566c0eabb3884c4d438f53910e12c174','2026-06-04 20:20:50.236','20260604000001_add_proveedores_fields',NULL,NULL,'2026-06-04 20:20:50.140',1),('87e8ff9c-355f-4724-9b6c-34422dd6f625','cdc9b591d31b1f47f130bf59bfd9f9803f4e3b5e700f6dcbc71fd756e33b8e40','2026-06-03 00:39:56.243','20260602000002_add_metodos_pago',NULL,NULL,'2026-06-03 00:39:55.968',1),('8a181951-65f1-43fd-ac06-221d9d73e862','f35b9e5b125086496a2b70290ddc53dadf2b965d8a25e226afe4bcdfce5346f3','2026-06-04 21:25:11.796','20260604000006_add_cotizaciones_abonos',NULL,NULL,'2026-06-04 21:25:10.882',1),('9c61a12e-403d-4a9e-85b3-62e051c844f1','6f6973a7571ac3b5a93e705564649b7893ec1e5349f6a0054e956ada0b775a4c','2026-06-03 00:42:28.888','20260602000003_add_audit_log',NULL,NULL,'2026-06-03 00:42:28.750',1),('ab92b08c-1c95-4690-a4a4-010a63b12c5f','d502ba69314f1446a0d8676b3189183325292b887a21a5a5e38e0fdd654eda8c','2026-06-30 23:20:44.500','20260630000000_add_impresion_categoria_and_maquina_to_mermas',NULL,NULL,'2026-06-30 23:20:44.211',1),('add_sucursal_id_to_productos_manual','bbee525aa42ca1ce8fb8fa8e749b5c93ebc92963e4b9f3248283e03d9e59c948','2026-07-17 16:44:44.000','20260717000000_add_sucursal_id_to_productos','Manual migration: added sucursal_id to productos',NULL,'2026-07-17 16:44:44.000',1),('b47c6716-487e-4d59-8439-b2969a3c7fc1','da2b56a2f0fc151b969dd1637e4fd41bc22f16d200481c62d4a648892a8fa3f0',NULL,'20260604000008_add_maquinas_impresiones','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260604000008_add_maquinas_impresiones\n\nDatabase error code: 1824\n\nDatabase error:\nFailed to open the referenced table \'maquinas\'\n\nPlease check the query number 3 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20260604000008_add_maquinas_impresiones\"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name=\"20260604000008_add_maquinas_impresiones\"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226','2026-06-05 03:13:14.099','2026-06-05 03:11:47.513',0),('bec692a4-ddd8-45a9-8f45-cfd9180bb655','236ea60459ac87544d31b4f199b291453e5ad3a8de7f743edbf13056a7f89ae5','2026-06-04 20:28:44.599','20260604000003_add_gastos',NULL,NULL,'2026-06-04 20:28:44.054',1),('c2bffd46-4896-41f4-be8c-728a49023733','329eea8cb3970be43c80e0617ce169f930f30a968386e769a6ea70bc5ecd0deb','2026-07-30 00:52:14.539','20260729000000_add_impresiones_venta_detalle_relation','',NULL,'2026-07-30 00:52:14.539',0),('c5741444-c429-4d8b-a430-016deb62371f','9fe7b0f4020e19eeafaa82b8f90741075bedd1f99a370f4848f50b3013699d26','2026-06-03 00:30:45.189','20260602000000_add_configuracion',NULL,NULL,'2026-06-03 00:30:45.110',1),('c939526c-92e4-4f27-b47f-088bcfab9f73','d450d416e6bed4133b97ff4f29751929e98aa3a46c146aabee647a176611c87c',NULL,'20260604000008_add_maquinas_impresiones','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260604000008_add_maquinas_impresiones\n\nDatabase error code: 1060\n\nDatabase error:\nDuplicate column name \'maquina_id\'\n\nPlease check the query number 10 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20260604000008_add_maquinas_impresiones\"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name=\"20260604000008_add_maquinas_impresiones\"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226','2026-06-05 03:13:40.178','2026-06-05 03:13:14.991',0),('c9810fa9-2f23-46ea-bc66-e5c7f52f0714','8c8b3dac90d311631c35bbc9b113675f1dd09ab22e716d14f6a4261d4c2e834a',NULL,'20260604000007_add_mermas','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260604000007_add_mermas\n\nDatabase error code: 1064\n\nDatabase error:\nYou have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near \'.`insumo_id`) REFERENCES `insumos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE\' at line 2\n\nPlease check the query number 6 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20260604000007_add_mermas\"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name=\"20260604000007_add_mermas\"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226','2026-06-04 21:37:25.182','2026-06-04 21:36:59.278',0),('c9ab2425-d8dd-4a62-a8f1-a19166c108d0','6d300e784a1e14959736f57539f735fa5220e65d525ed3a2721fbe25e4247df2','2026-06-04 20:47:43.703','20260604000005_add_categorias_tipo',NULL,NULL,'2026-06-04 20:47:43.658',1),('d5107573-1323-446c-9758-f9773ec07462','d450d416e6bed4133b97ff4f29751929e98aa3a46c146aabee647a176611c87c',NULL,'20260604000008_add_maquinas_impresiones','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260604000008_add_maquinas_impresiones\n\nDatabase error code: 1050\n\nDatabase error:\nTable \'maquinas\' already exists\n\nPlease check the query number 1 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20260604000008_add_maquinas_impresiones\"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name=\"20260604000008_add_maquinas_impresiones\"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226','2026-06-05 03:14:06.276','2026-06-05 03:13:41.015',0);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `accion` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `modulo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detalle` text COLLATE utf8mb4_unicode_ci,
  `ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `audit_log_usuario_id_idx` (`usuario_id`),
  KEY `audit_log_modulo_idx` (`modulo`),
  KEY `audit_log_created_at_idx` (`created_at`),
  CONSTRAINT `audit_log_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_log`
--

LOCK TABLES `audit_log` WRITE;
/*!40000 ALTER TABLE `audit_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'venta',
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `categorias_tipo_idx` (`tipo`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Impresion','impresion',NULL,1,'2026-06-01 01:02:51.000','2026-07-01 19:54:58.477'),(2,'Papeleria','venta',NULL,1,'2026-06-03 01:08:39.000','2026-06-03 01:08:39.000'),(3,'Produccion','produccion','Trabajos de impresión bajo pedido',1,'2026-06-04 20:50:51.000','2026-06-06 20:17:30.000'),(4,'Alimentos','venta',NULL,1,'2026-07-06 20:04:03.244','2026-07-06 20:04:03.244'),(5,'COP / IMP COLOR','impresion','Impresion o copia a color',1,'2026-07-30 22:34:36.587','2026-07-30 22:34:36.587');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'Cliente Prueba','5555555555','cliente@ejemplo.com',NULL,1,'2026-07-06 20:01:33.693','2026-07-06 20:01:33.693');
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compras_insumos`
--

DROP TABLE IF EXISTS `compras_insumos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compras_insumos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sucursal_id` int DEFAULT NULL,
  `proveedor_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `insumo_id` int NOT NULL,
  `cantidad` decimal(12,3) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `fecha` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `factura` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `compras_insumos_fecha_idx` (`fecha`),
  KEY `compras_insumos_proveedor_id_idx` (`proveedor_id`),
  KEY `compras_insumos_insumo_id_idx` (`insumo_id`),
  KEY `compras_insumos_sucursal_id_fkey` (`sucursal_id`),
  KEY `compras_insumos_usuario_id_fkey` (`usuario_id`),
  CONSTRAINT `compras_insumos_insumo_id_fkey` FOREIGN KEY (`insumo_id`) REFERENCES `insumos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `compras_insumos_proveedor_id_fkey` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `compras_insumos_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `compras_insumos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compras_insumos`
--

LOCK TABLES `compras_insumos` WRITE;
/*!40000 ALTER TABLE `compras_insumos` DISABLE KEYS */;
INSERT INTO `compras_insumos` VALUES (1,1,1,1,1,50.000,12.50,625.00,'Compra de prueba','2026-06-04 20:40:56.506','2026-06-04 20:40:56.506',NULL),(2,1,1,1,1,1000.000,12.50,12500.00,'Ajuste de existencias','2026-06-05 19:15:51.489','2026-06-05 19:15:51.489',NULL),(3,1,NULL,1,2,1000.000,1.20,1200.00,NULL,'2026-06-06 16:53:28.172','2026-06-06 16:53:28.172',NULL),(4,1,NULL,1,12,2.000,85.00,170.00,NULL,'2026-06-07 02:51:13.511','2026-06-07 02:51:13.511',NULL),(5,1,NULL,1,67,1000.000,1.20,1200.00,NULL,'2026-06-14 19:42:05.468','2026-06-14 19:42:05.468',NULL),(6,1,NULL,1,68,1000.000,1.20,1200.00,NULL,'2026-06-14 19:42:51.700','2026-06-14 19:42:51.700',NULL),(7,1,NULL,1,67,1000.000,1.20,1200.00,NULL,'2026-06-14 19:56:18.106','2026-06-14 19:56:18.106',NULL),(8,1,NULL,1,68,1000.000,1.20,1200.00,NULL,'2026-06-14 19:56:23.474','2026-06-14 19:56:23.474',NULL),(9,1,NULL,1,70,100.000,5.00,500.00,NULL,'2026-06-14 20:18:52.387','2026-06-14 20:18:52.387',NULL),(10,1,1,1,71,100.000,150.00,15000.00,NULL,'2026-06-17 20:16:55.120','2026-06-17 20:16:55.120',NULL),(11,1,1,1,67,1.000,1.20,1.20,NULL,'2026-06-18 00:00:00.000','2026-06-18 20:33:17.085',NULL),(12,1,NULL,1,68,10.000,1.20,12.00,'prueba2','2026-06-18 00:00:00.000','2026-06-18 20:33:17.102',NULL),(13,1,1,1,67,5.000,1.20,6.00,NULL,'2026-06-19 00:00:00.000','2026-06-19 21:57:33.234',NULL),(14,1,1,1,68,5.000,1.20,6.00,NULL,'2026-06-19 00:00:00.000','2026-06-19 21:57:33.258',NULL),(15,1,1,1,72,10.000,11.00,110.00,NULL,'2026-06-20 20:16:20.600','2026-06-20 20:16:20.600',NULL);
/*!40000 ALTER TABLE `compras_insumos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion`
--

DROP TABLE IF EXISTS `configuracion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` text COLLATE utf8mb4_unicode_ci,
  `tipo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string',
  `grupo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `configuracion_clave_key` (`clave`),
  KEY `configuracion_grupo_idx` (`grupo`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion`
--

LOCK TABLES `configuracion` WRITE;
/*!40000 ALTER TABLE `configuracion` DISABLE KEYS */;
INSERT INTO `configuracion` VALUES (1,'empresa_nombre','PLPrint','string','empresa','2026-06-03 00:31:07.750','2026-06-03 00:31:07.750'),(2,'empresa_rfc','','string','empresa','2026-06-03 00:31:07.801','2026-06-03 00:31:07.801'),(3,'empresa_direccion','278 Bleecker St','string','empresa','2026-06-03 00:31:07.806','2026-07-24 21:21:44.728'),(4,'empresa_telefono','555-1234','string','empresa','2026-06-03 00:31:07.809','2026-06-03 01:01:47.670'),(5,'empresa_email','','string','empresa','2026-06-03 00:31:07.814','2026-06-03 00:31:07.814'),(6,'empresa_logo_url','/uploads/logo-1784928071076-67398491.png','string','empresa','2026-06-03 00:31:07.819','2026-07-24 21:21:11.168'),(7,'iva_porcentaje','16','number','impuestos','2026-06-03 00:31:07.824','2026-06-03 01:01:47.670'),(8,'iva_activo','true','boolean','impuestos','2026-06-03 00:31:07.829','2026-07-06 20:05:05.902'),(9,'moneda_simbolo','$','string','moneda','2026-06-03 00:31:07.835','2026-06-03 00:31:07.835'),(10,'moneda_codigo','MXN','string','moneda','2026-06-03 00:31:07.840','2026-06-03 00:31:07.840'),(11,'moneda_separador_miles',',','string','moneda','2026-06-03 00:31:07.845','2026-06-03 00:31:07.845'),(12,'moneda_separador_decimal','.','string','moneda','2026-06-03 00:31:07.849','2026-06-03 00:31:07.849'),(13,'moneda_decimales','2','number','moneda','2026-06-03 00:31:07.855','2026-06-03 00:31:07.855'),(14,'ticket_encabezado','PLPrint','string','ticket','2026-06-03 00:31:07.859','2026-06-03 00:31:07.859'),(15,'ticket_subtitulo','Punto de Venta','string','ticket','2026-06-03 00:31:07.864','2026-06-03 00:31:07.864'),(16,'ticket_mensaje_pie','Gracias por su compra!','string','ticket','2026-06-03 00:31:07.868','2026-06-03 00:31:07.868'),(17,'ticket_formato_fecha','DD/MM/YYYY','string','ticket','2026-06-03 00:31:07.873','2026-06-03 20:17:36.441'),(18,'ticket_formato_hora','12h','string','ticket','2026-06-03 00:31:07.877','2026-06-03 20:17:36.441'),(19,'ticket_mostrar_logo','true','boolean','ticket','2026-06-03 00:31:07.882','2026-06-03 01:01:47.670'),(20,'ticket_mostrar_rfc','false','boolean','ticket','2026-06-03 00:31:07.887','2026-06-03 00:31:07.887'),(21,'ticket_mostrar_direccion','false','boolean','ticket','2026-06-03 00:31:07.892','2026-06-03 00:31:07.892'),(22,'ticket_mostrar_telefono','true','boolean','ticket','2026-06-03 00:31:07.898','2026-06-03 20:17:36.441'),(23,'reportes_formato','pdf','string','reportes','2026-06-03 00:31:07.904','2026-06-03 00:31:07.904'),(24,'reportes_incluir_logo','true','boolean','reportes','2026-06-03 00:31:07.908','2026-06-03 20:17:14.454'),(25,'notif_stock_bajo','true','boolean','notificaciones','2026-06-03 00:31:07.913','2026-06-03 00:31:07.913'),(26,'notif_stock_bajo_umbral','10','number','notificaciones','2026-06-03 00:31:07.916','2026-06-03 00:31:07.916'),(27,'notif_ventas_dia','false','boolean','notificaciones','2026-06-03 00:31:07.920','2026-06-03 00:31:07.920'),(28,'notif_insumos_bajos','true','boolean','notificaciones','2026-06-03 00:31:07.924','2026-06-03 00:31:07.924'),(29,'somos_centro_impresion','true','boolean','maquinas','2026-07-01 00:49:55.236','2026-07-29 21:49:24.493');
/*!40000 ALTER TABLE `configuracion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cortes_caja`
--

DROP TABLE IF EXISTS `cortes_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cortes_caja` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sucursal_id` int NOT NULL,
  `usuario_apertura_id` int NOT NULL,
  `fecha_apertura` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `monto_inicial` decimal(12,2) NOT NULL,
  `fecha_cierre` datetime(3) DEFAULT NULL,
  `usuario_cierre_id` int DEFAULT NULL,
  `monto_final_esperado` decimal(12,2) DEFAULT NULL,
  `monto_final_real` decimal(12,2) DEFAULT NULL,
  `diferencia` decimal(12,2) DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `estado` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'abierta',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `cortes_caja_sucursal_id_idx` (`sucursal_id`),
  KEY `cortes_caja_fecha_apertura_idx` (`fecha_apertura`),
  KEY `cortes_caja_estado_idx` (`estado`),
  KEY `cortes_caja_usuario_apertura_id_fkey` (`usuario_apertura_id`),
  KEY `cortes_caja_usuario_cierre_id_fkey` (`usuario_cierre_id`),
  CONSTRAINT `cortes_caja_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `cortes_caja_usuario_apertura_id_fkey` FOREIGN KEY (`usuario_apertura_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `cortes_caja_usuario_cierre_id_fkey` FOREIGN KEY (`usuario_cierre_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cortes_caja`
--

LOCK TABLES `cortes_caja` WRITE;
/*!40000 ALTER TABLE `cortes_caja` DISABLE KEYS */;
INSERT INTO `cortes_caja` VALUES (1,1,1,'2026-06-10 20:02:09.152',500.00,'2026-06-10 20:02:15.258',1,700.00,700.00,0.00,'Cierre de prueba','cerrada','2026-06-10 20:02:09.152','2026-06-10 20:02:15.258'),(2,1,1,'2026-06-10 22:01:40.441',100.00,'2026-07-29 21:47:51.399',1,5072.00,100.00,-4972.00,'cerrar para abrir caja nueva','cerrada','2026-06-10 22:01:40.441','2026-07-29 21:47:51.399'),(3,1,1,'2026-07-29 21:48:27.685',100.00,'2026-07-30 19:49:17.658',1,184.50,184.50,0.00,'Cierre de caja de prueba','cerrada','2026-07-29 21:48:27.685','2026-07-30 19:49:17.661'),(4,1,1,'2026-08-01 23:03:22.232',150.00,'2026-08-02 01:05:33.556',1,697.00,697.00,0.00,NULL,'cerrada','2026-08-01 23:03:22.232','2026-08-02 01:05:33.557'),(5,1,1,'2026-08-02 01:06:49.051',150.00,'2026-08-02 01:28:19.183',1,150.00,150.00,0.00,NULL,'cerrada','2026-08-02 01:06:49.051','2026-08-02 01:28:19.184'),(6,1,1,'2026-08-02 01:28:37.969',100.00,'2026-08-02 01:33:00.401',1,100.00,100.00,0.00,NULL,'cerrada','2026-08-02 01:28:37.969','2026-08-02 01:33:00.401');
/*!40000 ALTER TABLE `cortes_caja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cortes_maquinas`
--

DROP TABLE IF EXISTS `cortes_maquinas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cortes_maquinas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `corte_caja_id` int NOT NULL,
  `sucursal_id` int NOT NULL,
  `fecha_apertura` datetime(3) NOT NULL,
  `fecha_cierre` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cortes_maquinas_corte_caja_id_key` (`corte_caja_id`),
  KEY `cortes_maquinas_sucursal_id_idx` (`sucursal_id`),
  CONSTRAINT `cortes_maquinas_corte_caja_id_fkey` FOREIGN KEY (`corte_caja_id`) REFERENCES `cortes_caja` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cortes_maquinas_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cortes_maquinas`
--

LOCK TABLES `cortes_maquinas` WRITE;
/*!40000 ALTER TABLE `cortes_maquinas` DISABLE KEYS */;
INSERT INTO `cortes_maquinas` VALUES (1,4,1,'2026-08-01 23:03:22.232','2026-08-02 01:05:33.556','2026-08-01 23:03:22.245','2026-08-02 01:05:33.603'),(2,5,1,'2026-08-02 01:06:49.051','2026-08-02 01:28:19.183','2026-08-02 01:06:49.066','2026-08-02 01:28:19.231'),(3,6,1,'2026-08-02 01:28:37.969','2026-08-02 01:33:00.401','2026-08-02 01:28:37.980','2026-08-02 01:33:00.444');
/*!40000 ALTER TABLE `cortes_maquinas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cortes_maquinas_detalle`
--

DROP TABLE IF EXISTS `cortes_maquinas_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cortes_maquinas_detalle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cortes_maquinas_id` int NOT NULL,
  `maquina_id` int NOT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contador_inicial` decimal(12,2) NOT NULL,
  `contador_actual` decimal(12,2) NOT NULL,
  `contador_final` decimal(12,2) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cortes_maquinas_detalle_cortes_maquinas_id_maquina_id_key` (`cortes_maquinas_id`,`maquina_id`),
  KEY `cortes_maquinas_detalle_maquina_id_idx` (`maquina_id`),
  CONSTRAINT `cortes_maquinas_detalle_cortes_maquinas_id_fkey` FOREIGN KEY (`cortes_maquinas_id`) REFERENCES `cortes_maquinas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cortes_maquinas_detalle_maquina_id_fkey` FOREIGN KEY (`maquina_id`) REFERENCES `maquinas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cortes_maquinas_detalle`
--

LOCK TABLES `cortes_maquinas_detalle` WRITE;
/*!40000 ALTER TABLE `cortes_maquinas_detalle` DISABLE KEYS */;
INSERT INTO `cortes_maquinas_detalle` VALUES (1,1,1,'C70','INYECCION',35.00,50.00,50.00,'2026-08-01 23:03:22.245','2026-08-02 01:05:33.576'),(2,1,2,'Plotter','Inyeccion',12.00,13.00,13.60,'2026-08-01 23:03:22.245','2026-08-02 01:05:33.592'),(3,2,1,'C70','INYECCION',50.00,50.00,51.00,'2026-08-02 01:06:49.066','2026-08-02 01:28:19.201'),(4,2,2,'Plotter','Inyeccion',13.60,13.60,14.60,'2026-08-02 01:06:49.066','2026-08-02 01:28:19.217'),(5,3,1,'C70','INYECCION',51.00,51.00,51.00,'2026-08-02 01:28:37.980','2026-08-02 01:33:00.414'),(6,3,2,'Plotter','Inyeccion',14.60,14.60,14.60,'2026-08-02 01:28:37.980','2026-08-02 01:33:00.433');
/*!40000 ALTER TABLE `cortes_maquinas_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cotizacion_detalle`
--

DROP TABLE IF EXISTS `cotizacion_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cotizacion_detalle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cotizacion_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `descuento` decimal(10,2) NOT NULL DEFAULT '0.00',
  `subtotal` decimal(10,2) NOT NULL,
  `ancho_m` decimal(10,4) DEFAULT NULL,
  `alto_m` decimal(10,4) DEFAULT NULL,
  `unidad_medida_detalle` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cotizacion_detalle_cotizacion_id_fkey` (`cotizacion_id`),
  KEY `cotizacion_detalle_producto_fkey` (`producto_id`),
  CONSTRAINT `cotizacion_detalle_cotizacion_id_fkey` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cotizacion_detalle_producto_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cotizacion_detalle`
--

LOCK TABLES `cotizacion_detalle` WRITE;
/*!40000 ALTER TABLE `cotizacion_detalle` DISABLE KEYS */;
INSERT INTO `cotizacion_detalle` VALUES (1,2,1,2,50.00,0.00,100.00,NULL,NULL,NULL),(2,3,2,1,2.00,0.00,2.00,NULL,NULL,NULL),(3,3,3,1,4.00,0.00,4.00,NULL,NULL,NULL),(4,4,3,1,4.00,0.00,4.00,NULL,NULL,NULL),(5,4,2,1,2.00,0.00,2.00,NULL,NULL,NULL),(6,5,16,40,12.00,0.00,480.00,NULL,NULL,NULL),(7,6,15,1,12.00,0.00,12.00,NULL,NULL,NULL),(8,6,16,1,12.00,0.00,12.00,NULL,NULL,NULL),(9,7,18,1,45.00,0.00,45.00,1.2000,NULL,'m2'),(10,8,33,10,0.49,0.00,4.90,NULL,NULL,NULL),(11,8,30,5,10.00,0.00,50.00,NULL,NULL,NULL);
/*!40000 ALTER TABLE `cotizacion_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cotizaciones`
--

DROP TABLE IF EXISTS `cotizaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cotizaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `folio` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sucursal_id` int DEFAULT NULL,
  `cliente_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `descuento` decimal(10,2) NOT NULL DEFAULT '0.00',
  `descuento_motivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `venta_id` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cotizaciones_folio_key` (`folio`),
  UNIQUE KEY `cotizaciones_venta_id_key` (`venta_id`),
  KEY `cotizaciones_cliente_id_idx` (`cliente_id`),
  KEY `cotizaciones_estado_idx` (`estado`),
  KEY `cotizaciones_created_at_idx` (`created_at`),
  KEY `cotizaciones_sucursal_id_fkey` (`sucursal_id`),
  KEY `cotizaciones_usuario_id_fkey` (`usuario_id`),
  CONSTRAINT `cotizaciones_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `cotizaciones_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `cotizaciones_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `cotizaciones_venta_id_fkey` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cotizaciones`
--

LOCK TABLES `cotizaciones` WRITE;
/*!40000 ALTER TABLE `cotizaciones` DISABLE KEYS */;
INSERT INTO `cotizaciones` VALUES (2,'COT-MQ00HBJX',1,NULL,1,100.00,0.00,NULL,NULL,'convertida',6,'2026-06-04 21:32:38.973','2026-06-04 21:34:42.986'),(3,'COT-MQ01HRJ8',1,NULL,1,6.00,0.00,NULL,'Prueba','convertida',9,'2026-06-04 22:00:59.301','2026-06-04 22:01:09.581'),(4,'COT-MQ01XLAL',1,NULL,1,6.00,0.00,NULL,NULL,'convertida',14,'2026-06-04 22:13:17.710','2026-06-14 20:56:51.529'),(5,'COT-MQE9MCMP',1,NULL,1,480.00,0.00,NULL,NULL,'pendiente',NULL,'2026-06-14 20:57:16.658','2026-06-14 20:57:16.658'),(6,'COT-MQED0IPB',1,NULL,1,24.00,0.00,NULL,NULL,'pendiente',NULL,'2026-06-14 22:32:16.560','2026-06-14 22:32:16.560'),(7,'COT-MR9NBXQ0',1,1,1,45.00,0.00,NULL,NULL,'pendiente',NULL,'2026-07-06 20:01:56.857','2026-07-06 20:01:56.857'),(8,'COT-MSAZ40VI',1,NULL,1,54.90,0.00,NULL,NULL,'pendiente',NULL,'2026-08-01 22:59:11.599','2026-08-01 22:59:11.599');
/*!40000 ALTER TABLE `cotizaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `folio_counter`
--

DROP TABLE IF EXISTS `folio_counter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `folio_counter` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `seq` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `folio_counter_fecha_key` (`fecha`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `folio_counter`
--

LOCK TABLES `folio_counter` WRITE;
/*!40000 ALTER TABLE `folio_counter` DISABLE KEYS */;
INSERT INTO `folio_counter` VALUES (1,'2026-06-14',7,'2026-06-14 16:25:18.000','2026-06-14 17:26:27.000'),(12,'2026-06-19',1,'2026-06-19 17:07:38.084','2026-06-19 17:07:38.084'),(13,'2026-06-20',1,'2026-06-20 16:49:20.349','2026-06-20 16:49:20.349'),(14,'2026-07-06',1,'2026-07-06 13:58:38.752','2026-07-06 13:58:38.752'),(15,'2026-07-15',4,'2026-07-15 14:03:38.316','2026-07-15 14:03:38.316'),(19,'2026-07-29',9,'2026-07-29 15:52:10.919','2026-07-29 15:52:10.919'),(28,'2026-08-01',9,'2026-08-01 16:56:56.633','2026-08-01 16:56:56.633');
/*!40000 ALTER TABLE `folio_counter` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gastos`
--

DROP TABLE IF EXISTS `gastos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gastos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sucursal_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `categoria_id` int NOT NULL,
  `concepto` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `tipo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'gasto',
  `autorizado_por` int DEFAULT NULL,
  `comprobante_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `fecha` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `gastos_fecha_idx` (`fecha`),
  KEY `gastos_categoria_id_idx` (`categoria_id`),
  KEY `gastos_tipo_idx` (`tipo`),
  KEY `gastos_sucursal_id_idx` (`sucursal_id`),
  KEY `gastos_usuario_id_fkey` (`usuario_id`),
  KEY `gastos_autorizado_por_fkey` (`autorizado_por`),
  CONSTRAINT `gastos_autorizado_por_fkey` FOREIGN KEY (`autorizado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `gastos_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `gastos_categorias` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `gastos_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `gastos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gastos`
--

LOCK TABLES `gastos` WRITE;
/*!40000 ALTER TABLE `gastos` DISABLE KEYS */;
INSERT INTO `gastos` VALUES (1,1,1,1,'Pago de luz',500.50,'gasto',NULL,NULL,NULL,'2026-06-04 20:33:55.496','2026-06-04 20:33:55.496','2026-06-04 20:33:55.496'),(2,1,1,1,'Venta de material reciclado',200.00,'ingreso',NULL,NULL,NULL,'2026-06-10 20:02:09.292','2026-06-10 20:02:09.292','2026-06-10 20:02:09.292'),(3,1,1,1,'Compra de papel',50.00,'gasto',NULL,NULL,NULL,'2026-06-10 20:02:21.620','2026-06-10 20:02:21.620','2026-06-10 20:02:21.620'),(4,1,1,1,'Retiro para cambio',300.00,'retiro',NULL,NULL,NULL,'2026-06-10 20:02:21.689','2026-06-10 20:02:21.689','2026-06-10 20:02:21.689'),(5,1,1,4,'Pedido de paquetes de hojas',250.00,'gasto',NULL,NULL,'Se pedio por paqueteria un paquete de hojas','2026-07-30 00:59:43.900','2026-07-30 00:59:43.900','2026-07-30 00:59:43.900'),(6,1,1,6,'Retiro',100.00,'retiro',1,NULL,'para cambio','2026-07-30 01:01:34.359','2026-07-30 01:01:34.359','2026-07-30 01:01:34.359'),(7,1,1,3,'prueba',10.00,'ingreso',NULL,NULL,NULL,'2026-07-30 01:02:09.076','2026-07-30 01:02:09.076','2026-07-30 01:02:09.076');
/*!40000 ALTER TABLE `gastos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gastos_categorias`
--

DROP TABLE IF EXISTS `gastos_categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gastos_categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `gastos_categorias_nombre_key` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gastos_categorias`
--

LOCK TABLES `gastos_categorias` WRITE;
/*!40000 ALTER TABLE `gastos_categorias` DISABLE KEYS */;
INSERT INTO `gastos_categorias` VALUES (1,'Servicios','Luz, agua, internet',1,'2026-06-04 20:33:55.479','2026-06-04 20:33:55.479'),(2,'Luz',NULL,1,'2026-06-10 22:09:35.575','2026-06-10 22:09:35.575'),(3,'Internet',NULL,1,'2026-06-10 22:09:43.027','2026-06-10 22:09:43.027'),(4,'Paqueteria',NULL,1,'2026-06-10 22:09:51.794','2026-06-10 22:09:51.794'),(5,'Renta local',NULL,1,'2026-07-06 20:04:16.031','2026-07-06 20:04:16.031'),(6,'Retiro de dinero',NULL,1,'2026-07-30 01:01:05.257','2026-07-30 01:01:05.257');
/*!40000 ALTER TABLE `gastos_categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `impresiones`
--

DROP TABLE IF EXISTS `impresiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `impresiones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `maquina_id` int NOT NULL,
  `venta_detalle_id` int DEFAULT NULL,
  `venta_id` int DEFAULT NULL,
  `producto_id` int DEFAULT NULL,
  `sucursal_id` int NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `fue_merma` tinyint(1) NOT NULL DEFAULT '0',
  `merma_id` int DEFAULT NULL,
  `fecha` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `impresiones_maquina_id_fecha_idx` (`maquina_id`,`fecha`),
  KEY `impresiones_fecha_idx` (`fecha`),
  KEY `impresiones_producto_id_idx` (`producto_id`),
  KEY `impresiones_venta_id_fkey` (`venta_id`),
  KEY `impresiones_sucursal_id_fkey` (`sucursal_id`),
  KEY `impresiones_usuario_id_fkey` (`usuario_id`),
  KEY `impresiones_merma_id_fkey` (`merma_id`),
  KEY `impresiones_venta_detalle_id_fkey` (`venta_detalle_id`),
  CONSTRAINT `impresiones_maquina_id_fkey` FOREIGN KEY (`maquina_id`) REFERENCES `maquinas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `impresiones_merma_id_fkey` FOREIGN KEY (`merma_id`) REFERENCES `mermas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `impresiones_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `impresiones_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `impresiones_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `impresiones_venta_detalle_id_fkey` FOREIGN KEY (`venta_detalle_id`) REFERENCES `venta_detalle` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `impresiones_venta_id_fkey` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `impresiones`
--

LOCK TABLES `impresiones` WRITE;
/*!40000 ALTER TABLE `impresiones` DISABLE KEYS */;
INSERT INTO `impresiones` VALUES (1,1,NULL,79,15,1,1,0,NULL,'2026-07-06 19:58:38.778'),(2,2,NULL,84,35,1,1,0,NULL,'2026-07-29 21:52:10.961'),(3,2,NULL,85,35,1,1,0,NULL,'2026-07-29 21:53:45.612'),(4,2,NULL,86,35,1,1,0,NULL,'2026-07-29 22:14:55.992'),(5,2,NULL,87,35,1,1,0,NULL,'2026-07-29 22:34:11.293'),(6,2,NULL,88,29,1,1,0,NULL,'2026-07-29 22:34:46.131'),(7,2,NULL,89,29,1,1,0,NULL,'2026-07-29 22:35:50.802'),(8,1,NULL,90,31,1,1,0,NULL,'2026-07-29 23:52:49.358'),(9,1,56,91,31,1,1,0,NULL,'2026-07-30 00:56:33.584'),(10,1,59,92,31,1,1,0,NULL,'2026-07-30 01:03:10.537'),(11,2,64,95,29,1,1,0,NULL,'2026-08-01 22:57:27.170'),(12,1,70,98,31,1,1,0,NULL,'2026-08-01 23:09:42.646'),(13,2,71,98,29,1,1,0,NULL,'2026-08-01 23:09:42.659');
/*!40000 ALTER TABLE `impresiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `insumos`
--

DROP TABLE IF EXISTS `insumos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `insumos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `unidad_medida` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unidad',
  `ancho_rollo` decimal(10,4) DEFAULT NULL,
  `precio_compra` decimal(10,2) DEFAULT NULL,
  `proveedor_id` int DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `insumos_codigo_key` (`codigo`),
  KEY `insumos_activo_idx` (`activo`),
  KEY `insumos_proveedor_id_fkey` (`proveedor_id`),
  CONSTRAINT `insumos_proveedor_id_fkey` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `insumos`
--

LOCK TABLES `insumos` WRITE;
/*!40000 ALTER TABLE `insumos` DISABLE KEYS */;
INSERT INTO `insumos` VALUES (1,'PABO-0001','Papel Bond','','PZ',NULL,12.50,NULL,0,'2026-06-01 01:39:05.161','2026-06-14 19:36:51.873'),(2,'COM3-0001','COUCHE MATE 300GR','','PZ',NULL,1.20,NULL,0,'2026-06-06 16:47:17.621','2026-06-14 19:36:57.988'),(12,'LONA-0001','Lona','','ML',NULL,85.00,NULL,0,'2026-06-07 02:50:21.091','2026-06-14 19:36:54.765'),(67,'COB1-0001','COUCHE BRILLANTE 150GR','Papel chouche, prueba','PZ',NULL,1.20,NULL,1,'2026-06-14 19:41:41.792','2026-08-03 23:23:14.486'),(68,'COB3-0001','COUCHE BRILLANTE 300GR','','PZ',NULL,1.20,NULL,1,'2026-06-14 19:42:43.891','2026-06-19 21:57:33.261'),(69,'IMDP-0001','IMPRESION DE PLANOS ','','ML',NULL,5.00,NULL,0,'2026-06-14 20:16:38.000','2026-06-14 20:18:00.023'),(70,'ROPP-0001','ROLLO PARA PLANOS',NULL,'ML',NULL,5.00,NULL,1,'2026-06-14 20:18:37.447','2026-08-03 23:18:21.901'),(71,'ROLO-0001','ROLLO PARA LONA','ROLLO PARA IMPRESION DE LONAS','M.2',1.2000,150.00,NULL,1,'2026-06-17 20:16:20.874','2026-06-18 01:11:49.369'),(72,'PRST-0001','prueba stock','Prueba de insumo poco stock','PZ',NULL,11.00,NULL,1,'2026-06-20 20:16:12.302','2026-06-20 22:04:30.957'),(74,'COB3-0002','COUCHE BRILLANTE 300GR',NULL,'PZ',NULL,1.20,NULL,0,'2026-08-03 22:31:20.879','2026-08-03 23:22:30.521'),(76,'PRST-0002','prueba stock','Prueba de insumo poco stock','PZ',NULL,11.00,NULL,0,'2026-08-03 22:31:20.889','2026-08-03 23:22:26.087'),(78,'ROPL-0001','ROLLO PARA LONA','ROLLO PARA IMPRESION DE LONAS','M.2',1.2000,150.00,NULL,0,'2026-08-03 22:31:20.900','2026-08-03 23:22:36.862'),(80,'ROPP-0002','ROLLO PARA PLANOS',NULL,'ML',NULL,5.00,NULL,0,'2026-08-03 22:31:20.911','2026-08-03 23:22:41.000');
/*!40000 ALTER TABLE `insumos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `insumos_inventario`
--

DROP TABLE IF EXISTS `insumos_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `insumos_inventario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `insumo_id` int NOT NULL,
  `sucursal_id` int NOT NULL,
  `cantidad` decimal(12,3) NOT NULL DEFAULT '0.000',
  `stock_minimo` decimal(12,3) NOT NULL DEFAULT '0.000',
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `insumos_inventario_insumo_id_sucursal_id_key` (`insumo_id`,`sucursal_id`),
  KEY `insumos_inventario_insumo_id_sucursal_id_idx` (`insumo_id`,`sucursal_id`),
  KEY `insumos_inventario_sucursal_id_fkey` (`sucursal_id`),
  CONSTRAINT `insumos_inventario_insumo_id_fkey` FOREIGN KEY (`insumo_id`) REFERENCES `insumos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `insumos_inventario_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `insumos_inventario`
--

LOCK TABLES `insumos_inventario` WRITE;
/*!40000 ALTER TABLE `insumos_inventario` DISABLE KEYS */;
INSERT INTO `insumos_inventario` VALUES (1,1,1,1536.000,0.000,'2026-06-05 19:15:51.491'),(2,2,1,1000.000,0.000,'2026-06-06 16:53:28.177'),(3,12,1,2.000,0.000,'2026-06-07 02:51:13.520'),(4,67,1,968.000,0.000,'2026-07-06 19:58:38.789'),(5,68,1,2007.000,0.000,'2026-07-06 19:58:38.773'),(6,70,1,95.800,0.000,'2026-08-01 23:09:42.662'),(7,71,1,92.000,0.000,'2026-07-15 22:16:53.188'),(8,72,1,8.000,0.000,'2026-07-06 19:58:38.793');
/*!40000 ALTER TABLE `insumos_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_id` int NOT NULL,
  `sucursal_id` int NOT NULL,
  `cantidad` int NOT NULL DEFAULT '0',
  `stock_minimo` int NOT NULL DEFAULT '0',
  `stock_maximo` int DEFAULT NULL,
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventario_producto_id_sucursal_id_key` (`producto_id`,`sucursal_id`),
  KEY `inventario_producto_id_sucursal_id_idx` (`producto_id`,`sucursal_id`),
  KEY `inventario_sucursal_id_fkey` (`sucursal_id`),
  CONSTRAINT `inventario_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `inventario_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `inventario_chk_1` CHECK ((`cantidad` >= 0)),
  CONSTRAINT `inventario_chk_2` CHECK ((`stock_minimo` >= 0)),
  CONSTRAINT `inventario_chk_3` CHECK ((`stock_maximo` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario`
--

LOCK TABLES `inventario` WRITE;
/*!40000 ALTER TABLE `inventario` DISABLE KEYS */;
INSERT INTO `inventario` VALUES (1,2,1,11,7,NULL,'2026-08-02 04:50:01.312'),(2,3,1,21,0,NULL,'2026-06-14 20:56:51.000'),(3,4,1,500,0,NULL,'2026-06-06 16:48:29.000'),(4,12,1,7,0,NULL,'2026-06-07 01:18:54.000'),(5,13,1,19,0,NULL,'2026-06-07 01:19:07.000'),(6,21,1,100,0,NULL,'2026-07-17 02:05:26.578'),(7,22,1,0,0,NULL,'2026-07-17 02:13:46.274'),(8,33,1,10,5,NULL,'2026-08-02 17:49:59.254');
/*!40000 ALTER TABLE `inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kardex_movimientos`
--

DROP TABLE IF EXISTS `kardex_movimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kardex_movimientos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_id` int DEFAULT NULL,
  `sucursal_id` int DEFAULT NULL,
  `tipo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` int NOT NULL,
  `venta_id` int DEFAULT NULL,
  `referencia` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `usuario_id` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `kardex_movimientos_producto_id_sucursal_id_idx` (`producto_id`,`sucursal_id`),
  KEY `kardex_movimientos_created_at_idx` (`created_at`),
  KEY `kardex_movimientos_sucursal_id_fkey` (`sucursal_id`),
  KEY `kardex_movimientos_venta_id_fkey` (`venta_id`),
  KEY `kardex_movimientos_usuario_id_fkey` (`usuario_id`),
  CONSTRAINT `kardex_movimientos_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `kardex_movimientos_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `kardex_movimientos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `kardex_movimientos_venta_id_fkey` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `kardex_movimientos_chk_1` CHECK ((`tipo` in (_utf8mb4'entrada',_utf8mb4'salida',_utf8mb4'ajuste')))
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kardex_movimientos`
--

LOCK TABLES `kardex_movimientos` WRITE;
/*!40000 ALTER TABLE `kardex_movimientos` DISABLE KEYS */;
INSERT INTO `kardex_movimientos` VALUES (1,2,1,'entrada',10,NULL,NULL,'Stock inicial para prueba',1,'2026-06-01 01:41:10.000'),(2,2,1,'salida',5,1,NULL,NULL,1,'2026-06-01 01:41:26.000'),(3,3,1,'entrada',24,NULL,NULL,'Inventario inicial al crear el producto',1,'2026-06-01 01:45:31.000'),(4,2,1,'entrada',5,NULL,'cancelacion_venta_1',NULL,1,'2026-06-04 20:47:13.000'),(5,1,1,'salida',2,6,'Cotización COT-MQ00HBJX',NULL,1,'2026-06-04 21:34:43.000'),(6,1,1,'salida',1,NULL,'Merma #1','Impresión defectuosa',1,'2026-06-04 21:41:56.000'),(7,2,1,'salida',1,7,NULL,NULL,1,'2026-06-04 21:51:19.000'),(8,3,1,'salida',1,8,NULL,NULL,1,'2026-06-04 21:59:54.000'),(9,2,1,'salida',1,8,NULL,NULL,1,'2026-06-04 21:59:54.000'),(10,2,1,'salida',1,9,'Cotización COT-MQ01HRJ8',NULL,1,'2026-06-04 22:01:10.000'),(11,3,1,'salida',1,9,'Cotización COT-MQ01HRJ8',NULL,1,'2026-06-04 22:01:10.000'),(12,2,1,'salida',2,10,NULL,NULL,1,'2026-06-05 01:43:49.000'),(13,NULL,1,'salida',5,NULL,'Orden de producción #1','Consumo de insumo #1 para producción',NULL,'2026-06-05 19:11:34.000'),(14,2,1,'entrada',5,NULL,'Orden de producción #1','Producto terminado',NULL,'2026-06-05 19:11:34.000'),(15,4,1,'entrada',500,NULL,NULL,'Inventario inicial al crear el producto',1,'2026-06-06 16:48:29.000'),(16,2,1,'entrada',2,NULL,'cancelacion_venta_10',NULL,1,'2026-06-06 23:06:00.000'),(17,12,1,'entrada',10,NULL,NULL,'Inventario inicial al crear el producto',1,'2026-06-07 01:17:14.000'),(18,12,1,'salida',1,11,NULL,NULL,1,'2026-06-07 01:17:14.000'),(19,12,1,'salida',2,12,NULL,NULL,1,'2026-06-07 01:18:54.000'),(20,13,1,'entrada',20,NULL,NULL,'Inventario inicial al crear el producto',1,'2026-06-07 01:19:07.000'),(21,13,1,'salida',1,13,NULL,NULL,1,'2026-06-07 01:19:07.000'),(22,3,1,'salida',1,14,'Cotización COT-MQ01XLAL',NULL,1,'2026-06-14 20:56:52.000'),(23,2,1,'salida',1,14,'Cotización COT-MQ01XLAL',NULL,1,'2026-06-14 20:56:52.000'),(24,15,1,'salida',310,23,NULL,NULL,1,'2026-06-14 21:40:06.000'),(25,15,1,'salida',200,24,NULL,NULL,1,'2026-06-14 21:54:03.000'),(26,15,1,'salida',1,72,NULL,NULL,1,'2026-06-14 23:01:32.000'),(27,16,1,'salida',1,72,NULL,NULL,1,'2026-06-14 23:01:32.000'),(28,15,1,'salida',1,73,NULL,NULL,1,'2026-06-14 23:01:47.000'),(29,16,1,'salida',1,73,NULL,NULL,1,'2026-06-14 23:01:47.000'),(30,15,1,'salida',2,74,NULL,NULL,1,'2026-06-14 23:05:14.000'),(31,16,1,'salida',1,74,NULL,NULL,1,'2026-06-14 23:05:14.000'),(32,15,1,'salida',2,75,NULL,NULL,1,'2026-06-14 23:05:33.000'),(33,16,1,'salida',1,75,NULL,NULL,1,'2026-06-14 23:05:33.000'),(34,16,1,'salida',2,76,NULL,NULL,1,'2026-06-14 23:26:28.000'),(35,15,1,'salida',2,76,NULL,NULL,1,'2026-06-14 23:26:28.000'),(36,18,1,'salida',1,77,NULL,NULL,1,'2026-06-19 23:07:38.107'),(37,18,1,'salida',1,78,NULL,NULL,1,'2026-06-20 22:49:20.388'),(38,16,1,'salida',2,79,NULL,NULL,1,'2026-07-06 19:58:38.768'),(39,15,1,'salida',2,79,NULL,NULL,1,'2026-07-06 19:58:38.787'),(40,19,1,'salida',2,79,NULL,NULL,1,'2026-07-06 19:58:38.792'),(41,17,1,'salida',1,79,NULL,NULL,1,'2026-07-06 19:58:38.796'),(42,18,1,'salida',1,79,NULL,NULL,1,'2026-07-06 19:58:38.799'),(43,18,1,'salida',2,80,NULL,NULL,1,'2026-07-15 20:03:38.330'),(44,18,1,'salida',1,81,NULL,NULL,1,'2026-07-15 20:38:28.401'),(45,18,1,'salida',1,82,NULL,NULL,1,'2026-07-15 22:09:08.689'),(46,18,1,'salida',1,83,NULL,NULL,1,'2026-07-15 22:16:53.185'),(47,18,1,'entrada',1,NULL,'cancelacion_venta_83',NULL,1,'2026-07-15 22:29:50.231'),(48,18,1,'entrada',1,NULL,'cancelacion_venta_82',NULL,1,'2026-07-15 22:29:53.071'),(49,18,1,'entrada',1,NULL,'cancelacion_venta_81',NULL,1,'2026-07-15 22:30:04.135'),(50,21,1,'entrada',100,NULL,NULL,'Inventario inicial al crear el producto',1,'2026-07-17 02:05:26.580'),(51,35,1,'salida',1,84,NULL,NULL,1,'2026-07-29 21:52:10.980'),(52,35,1,'salida',1,85,NULL,NULL,1,'2026-07-29 21:53:45.645'),(53,35,1,'salida',1,86,NULL,NULL,1,'2026-07-29 22:14:55.998'),(54,35,1,'salida',1,87,NULL,NULL,1,'2026-07-29 22:34:11.302'),(55,29,1,'salida',1,88,NULL,NULL,1,'2026-07-29 22:34:46.152'),(56,29,1,'salida',1,89,NULL,NULL,1,'2026-07-29 22:35:50.806'),(57,29,1,'entrada',1,NULL,'cancelacion_venta_89',NULL,1,'2026-07-29 22:52:44.710'),(58,29,1,'entrada',1,NULL,'cancelacion_venta_88',NULL,1,'2026-07-29 23:50:39.730'),(59,31,1,'salida',5,90,NULL,NULL,1,'2026-07-29 23:52:49.373'),(60,31,1,'salida',6,91,NULL,NULL,1,'2026-07-30 00:56:33.593'),(61,41,1,'salida',1,92,NULL,NULL,1,'2026-07-30 01:03:10.530'),(62,37,1,'salida',6,92,NULL,NULL,1,'2026-07-30 01:03:10.534'),(63,31,1,'salida',10,92,NULL,NULL,1,'2026-07-30 01:03:10.540'),(64,41,1,'salida',2,93,NULL,NULL,1,'2026-08-01 22:56:56.654'),(65,36,1,'salida',2,93,NULL,NULL,1,'2026-08-01 22:56:56.665'),(66,34,1,'salida',1,94,NULL,NULL,1,'2026-08-01 22:57:08.722'),(67,28,1,'salida',1,95,NULL,NULL,1,'2026-08-01 22:57:27.167'),(68,29,1,'salida',1,95,NULL,NULL,1,'2026-08-01 22:57:27.191'),(69,39,1,'salida',4,96,NULL,NULL,1,'2026-08-01 22:58:39.841'),(70,33,1,'entrada',10,NULL,NULL,'Entrada manual desde edición de producto',1,'2026-08-01 23:00:11.654'),(71,41,1,'salida',20,97,NULL,NULL,1,'2026-08-01 23:09:14.611'),(72,36,1,'salida',10,97,NULL,NULL,1,'2026-08-01 23:09:14.624'),(73,34,1,'salida',2,97,NULL,NULL,1,'2026-08-01 23:09:14.632'),(74,28,1,'salida',2,98,NULL,NULL,1,'2026-08-01 23:09:42.643'),(75,31,1,'salida',15,98,NULL,NULL,1,'2026-08-01 23:09:42.656'),(76,29,1,'salida',1,98,NULL,NULL,1,'2026-08-01 23:09:42.661'),(77,39,1,'salida',5,99,NULL,NULL,1,'2026-08-01 23:09:53.249'),(78,37,1,'salida',4,100,NULL,NULL,1,'2026-08-01 23:10:05.737'),(79,41,1,'salida',4,101,NULL,NULL,1,'2026-08-02 01:41:05.561');
/*!40000 ALTER TABLE `kardex_movimientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maquinas`
--

DROP TABLE IF EXISTS `maquinas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maquinas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sucursal_id` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `marca` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `modelo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contador_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `contador_inicial` decimal(12,2) NOT NULL DEFAULT '0.00',
  `reset_diario` tinyint(1) NOT NULL DEFAULT '0',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_instalacion` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `maquinas_sucursal_id_idx` (`sucursal_id`),
  KEY `maquinas_activo_idx` (`activo`),
  CONSTRAINT `maquinas_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maquinas`
--

LOCK TABLES `maquinas` WRITE;
/*!40000 ALTER TABLE `maquinas` DISABLE KEYS */;
INSERT INTO `maquinas` VALUES (1,1,'C70','INYECCION','XEROX','C70',51.00,12.00,0,1,'2026-07-01 03:13:20.621','2026-07-01 03:13:20.622','2026-08-02 01:33:00.423'),(2,1,'Plotter','Inyeccion','Epson','T5470',14.60,5.00,0,1,'2026-07-29 21:50:09.807','2026-07-29 21:50:09.808','2026-08-02 01:33:00.438');
/*!40000 ALTER TABLE `maquinas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mermas`
--

DROP TABLE IF EXISTS `mermas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mermas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `producto_id` int DEFAULT NULL,
  `insumo_id` int DEFAULT NULL,
  `sucursal_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `venta_id` int DEFAULT NULL,
  `maquina_id` int DEFAULT NULL,
  `cantidad` decimal(12,3) NOT NULL,
  `motivo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `costo_estimado` decimal(12,2) DEFAULT NULL,
  `fecha` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `mermas_tipo_idx` (`tipo`),
  KEY `mermas_fecha_idx` (`fecha`),
  KEY `mermas_venta_id_idx` (`venta_id`),
  KEY `mermas_producto_id_idx` (`producto_id`),
  KEY `mermas_insumo_id_idx` (`insumo_id`),
  KEY `mermas_sucursal_id_fkey` (`sucursal_id`),
  KEY `mermas_usuario_id_fkey` (`usuario_id`),
  KEY `mermas_maquina_id_idx` (`maquina_id`),
  CONSTRAINT `mermas_insumo_id_fkey` FOREIGN KEY (`insumo_id`) REFERENCES `insumos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `mermas_maquina_id_fkey` FOREIGN KEY (`maquina_id`) REFERENCES `maquinas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `mermas_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `mermas_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `mermas_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `mermas_venta_id_fkey` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mermas`
--

LOCK TABLES `mermas` WRITE;
/*!40000 ALTER TABLE `mermas` DISABLE KEYS */;
INSERT INTO `mermas` VALUES (1,'producto',1,NULL,1,1,NULL,NULL,1.000,'Impresión defectuosa',25.00,'2026-06-04 21:41:55.667','2026-06-04 21:41:55.667'),(2,'insumo',NULL,70,1,1,88,NULL,0.400,'Cancelación venta VEN-20260729-0004',NULL,'2026-07-29 23:50:39.738','2026-07-29 23:50:39.738');
/*!40000 ALTER TABLE `mermas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metodos_pago`
--

DROP TABLE IF EXISTS `metodos_pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metodos_pago` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icono` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `es_sistema` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `metodos_pago_nombre_key` (`nombre`),
  KEY `metodos_pago_activo_idx` (`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metodos_pago`
--

LOCK TABLES `metodos_pago` WRITE;
/*!40000 ALTER TABLE `metodos_pago` DISABLE KEYS */;
INSERT INTO `metodos_pago` VALUES (1,'Efectivo','Banknote',1,1,'2026-06-02 18:39:56.025','2026-07-01 00:49:55.397'),(2,'Tarjeta','CreditCard',1,1,'2026-06-02 18:39:56.025','2026-07-01 00:49:55.403'),(3,'Transferencia','Landmark',1,1,'2026-06-02 18:39:56.025','2026-07-01 00:49:55.408');
/*!40000 ALTER TABLE `metodos_pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones_config`
--

DROP TABLE IF EXISTS `notificaciones_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `umbral` decimal(12,3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `notificaciones_config_tipo_key` (`tipo`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones_config`
--

LOCK TABLES `notificaciones_config` WRITE;
/*!40000 ALTER TABLE `notificaciones_config` DISABLE KEYS */;
INSERT INTO `notificaciones_config` VALUES (1,'stock_bajo_productos',1,10.000,'2026-06-03 00:44:37.457','2026-07-01 00:49:55.473'),(2,'stock_bajo_insumos',1,10.000,'2026-06-03 00:44:37.464','2026-07-01 00:49:55.479'),(3,'ventas_dia',0,NULL,'2026-06-03 00:44:37.467','2026-07-01 00:49:55.485'),(4,'venta_cancelada',1,NULL,'2026-06-03 00:44:37.470','2026-07-01 00:49:55.491'),(5,'producto_sin_stock',1,0.000,'2026-06-03 00:44:37.475','2026-07-01 00:49:55.495');
/*!40000 ALTER TABLE `notificaciones_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordenes_produccion`
--

DROP TABLE IF EXISTS `ordenes_produccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordenes_produccion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sucursal_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` int NOT NULL,
  `cantidad_producida` int NOT NULL DEFAULT '0',
  `estatus` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `prioridad` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `fecha_creacion` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `fecha_inicio` datetime(3) DEFAULT NULL,
  `fecha_fin_estimada` datetime(3) DEFAULT NULL,
  `fecha_fin_real` datetime(3) DEFAULT NULL,
  `usuario_creador_id` int DEFAULT NULL,
  `usuario_asignado_id` int DEFAULT NULL,
  `maquina_id` int DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `motivo_cancelacion` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ordenes_produccion_estatus_idx` (`estatus`),
  KEY `ordenes_produccion_sucursal_id_idx` (`sucursal_id`),
  KEY `ordenes_produccion_producto_id_idx` (`producto_id`),
  KEY `ordenes_produccion_usuario_asignado_id_idx` (`usuario_asignado_id`),
  KEY `ordenes_produccion_fecha_creacion_idx` (`fecha_creacion`),
  KEY `ordenes_produccion_maquina_id_fkey` (`maquina_id`),
  KEY `ordenes_produccion_usuario_creador_id_fkey` (`usuario_creador_id`),
  CONSTRAINT `ordenes_produccion_maquina_id_fkey` FOREIGN KEY (`maquina_id`) REFERENCES `maquinas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ordenes_produccion_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ordenes_produccion_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ordenes_produccion_usuario_asignado_id_fkey` FOREIGN KEY (`usuario_asignado_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ordenes_produccion_usuario_creador_id_fkey` FOREIGN KEY (`usuario_creador_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordenes_produccion`
--

LOCK TABLES `ordenes_produccion` WRITE;
/*!40000 ALTER TABLE `ordenes_produccion` DISABLE KEYS */;
INSERT INTO `ordenes_produccion` VALUES (1,1,2,5,5,'entregado','alta','2026-06-05 19:11:34.258','2026-06-05 19:11:34.366','2026-06-06 00:00:00.000','2026-06-05 19:11:34.415',NULL,NULL,NULL,'Orden de prueba',NULL,'2026-06-05 19:11:34.258','2026-06-05 19:14:00.562'),(3,1,18,1,0,'pendiente','normal','2026-07-15 22:16:53.180',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,'2026-07-15 22:16:53.180','2026-07-15 22:16:53.180'),(4,1,34,1,0,'pendiente','normal','2026-08-01 22:57:08.703',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,'2026-08-01 22:57:08.703','2026-08-01 22:57:08.703'),(5,1,28,1,0,'pendiente','normal','2026-08-01 22:57:27.160',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,'2026-08-01 22:57:27.160','2026-08-01 22:57:27.160'),(6,1,34,2,0,'pendiente','normal','2026-08-01 23:09:14.627',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,'2026-08-01 23:09:14.627','2026-08-01 23:09:14.627'),(7,1,28,2,0,'pendiente','normal','2026-08-01 23:09:42.641',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,'2026-08-01 23:09:42.641','2026-08-01 23:09:42.641');
/*!40000 ALTER TABLE `ordenes_produccion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordenes_produccion_historial`
--

DROP TABLE IF EXISTS `ordenes_produccion_historial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordenes_produccion_historial` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orden_id` int NOT NULL,
  `estatus_anterior` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estatus_nuevo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ordenes_produccion_historial_orden_id_idx` (`orden_id`),
  KEY `ordenes_produccion_historial_created_at_idx` (`created_at`),
  KEY `ordenes_produccion_historial_usuario_id_fkey` (`usuario_id`),
  CONSTRAINT `ordenes_produccion_historial_orden_id_fkey` FOREIGN KEY (`orden_id`) REFERENCES `ordenes_produccion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ordenes_produccion_historial_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordenes_produccion_historial`
--

LOCK TABLES `ordenes_produccion_historial` WRITE;
/*!40000 ALTER TABLE `ordenes_produccion_historial` DISABLE KEYS */;
INSERT INTO `ordenes_produccion_historial` VALUES (1,1,NULL,'pendiente',NULL,'Orden creada','2026-06-05 19:11:34.261'),(2,1,'pendiente','en_proceso',NULL,NULL,'2026-06-05 19:11:34.382'),(3,1,'en_proceso','terminado',NULL,NULL,'2026-06-05 19:11:34.424'),(6,1,'terminado','entregado',NULL,'Producto terminado y entregado al cliente','2026-06-05 19:14:00.563');
/*!40000 ALTER TABLE `ordenes_produccion_historial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permisos`
--

DROP TABLE IF EXISTS `permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permisos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `modulo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accion` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `permisos_modulo_accion_key` (`modulo`,`accion`),
  KEY `permisos_modulo_idx` (`modulo`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permisos`
--

LOCK TABLES `permisos` WRITE;
/*!40000 ALTER TABLE `permisos` DISABLE KEYS */;
INSERT INTO `permisos` VALUES (1,'dashboard','ver','Ver dashboard','2026-06-03 00:34:21.528'),(2,'productos','ver','Ver productos','2026-06-03 00:34:21.535'),(3,'productos','crear','Crear productos','2026-06-03 00:34:21.539'),(4,'productos','editar','Editar productos','2026-06-03 00:34:21.542'),(5,'productos','eliminar','Eliminar productos','2026-06-03 00:34:21.546'),(6,'insumos','ver','Ver insumos','2026-06-03 00:34:21.550'),(7,'insumos','crear','Crear insumos','2026-06-03 00:34:21.553'),(8,'insumos','editar','Editar insumos','2026-06-03 00:34:21.557'),(9,'insumos','eliminar','Eliminar insumos','2026-06-03 00:34:21.563'),(10,'insumos','ajustar_stock','Ajustar stock de insumos','2026-06-03 00:34:21.566'),(11,'ventas','ver','Ver ventas','2026-06-03 00:34:21.570'),(12,'ventas','crear','Crear ventas','2026-06-03 00:34:21.573'),(13,'ventas','cancelar','Cancelar ventas','2026-06-03 00:34:21.576'),(14,'clientes','ver','Ver clientes','2026-06-03 00:34:21.581'),(15,'clientes','crear','Crear clientes','2026-06-03 00:34:21.584'),(16,'clientes','editar','Editar clientes','2026-06-03 00:34:21.588'),(17,'clientes','eliminar','Eliminar clientes','2026-06-03 00:34:21.592'),(18,'usuarios','ver','Ver usuarios','2026-06-03 00:34:21.596'),(19,'usuarios','crear','Crear usuarios','2026-06-03 00:34:21.603'),(20,'usuarios','editar','Editar usuarios','2026-06-03 00:34:21.607'),(21,'usuarios','eliminar','Eliminar usuarios','2026-06-03 00:34:21.610'),(22,'categorias','ver','Ver categorias','2026-06-03 00:34:21.613'),(23,'categorias','crear','Crear categorias','2026-06-03 00:34:21.617'),(24,'categorias','editar','Editar categorias','2026-06-03 00:34:21.621'),(25,'categorias','eliminar','Eliminar categorias','2026-06-03 00:34:21.624'),(26,'sucursales','ver','Ver sucursales','2026-06-03 00:34:21.628'),(27,'sucursales','crear','Crear sucursales','2026-06-03 00:34:21.633'),(28,'sucursales','editar','Editar sucursales','2026-06-03 00:34:21.637'),(29,'sucursales','eliminar','Eliminar sucursales','2026-06-03 00:34:21.641'),(30,'configuracion','ver','Ver configuracion','2026-06-03 00:34:21.644'),(31,'configuracion','editar','Editar configuracion','2026-06-03 00:34:21.648'),(32,'roles','ver','Ver roles','2026-06-03 00:34:21.651'),(33,'roles','crear','Crear roles','2026-06-03 00:34:21.654'),(34,'roles','editar','Editar roles','2026-06-03 00:34:21.657'),(35,'roles','eliminar','Eliminar roles','2026-06-03 00:34:21.661'),(36,'reportes','ver','Ver reportes','2026-06-03 00:34:21.664'),(37,'reportes','exportar','Exportar reportes','2026-06-03 00:34:21.667'),(38,'respaldo','ver','Ver respaldos','2026-06-03 00:34:21.670'),(39,'respaldo','crear','Crear respaldos','2026-06-03 00:34:21.674'),(40,'audit_log','ver','Ver bitacora','2026-06-03 00:34:21.677'),(41,'notificaciones','ver','Ver notificaciones','2026-06-03 00:34:21.680'),(42,'notificaciones','editar','Editar configuracion de notificaciones','2026-06-03 00:34:21.683'),(43,'proveedores','ver','Ver proveedores','2026-06-04 20:24:17.212'),(44,'proveedores','crear','Crear proveedores','2026-06-04 20:24:17.217'),(45,'proveedores','editar','Editar proveedores','2026-06-04 20:24:17.220'),(46,'proveedores','eliminar','Eliminar proveedores','2026-06-04 20:24:17.223'),(47,'unidades_medida','ver','Ver unidades de medida','2026-06-04 20:24:17.226'),(48,'unidades_medida','gestionar','Gestionar unidades de medida','2026-06-04 20:24:17.230'),(49,'gastos','ver','Ver gastos','2026-06-04 20:24:17.236'),(50,'gastos','crear','Crear gastos','2026-06-04 20:24:17.241'),(51,'gastos','editar','Editar gastos','2026-06-04 20:24:17.244'),(52,'gastos','eliminar','Eliminar gastos','2026-06-04 20:24:17.247'),(53,'gastos','categoria_ver','Ver categorías de gastos','2026-06-04 20:24:17.250'),(54,'gastos','categoria_gestionar','Gestionar categorías de gastos','2026-06-04 20:24:17.254'),(55,'compras','ver','Ver compras de insumos','2026-06-04 20:24:17.257'),(56,'compras','crear','Registrar compras de insumos','2026-06-04 20:24:17.260'),(57,'compras','anular','Anular compras de insumos','2026-06-04 20:24:17.264'),(58,'cotizaciones','ver','Ver cotizaciones','2026-06-04 21:35:05.213'),(59,'cotizaciones','crear','Crear cotizaciones','2026-06-04 21:35:05.219'),(60,'cotizaciones','editar','Editar cotizaciones','2026-06-04 21:35:05.223'),(61,'cotizaciones','eliminar','Eliminar cotizaciones','2026-06-04 21:35:05.228'),(62,'cotizaciones','convertir_venta','Convertir cotización a venta','2026-06-04 21:35:05.231'),(63,'cotizaciones','cancelar','Cancelar cotizaciones','2026-06-04 21:35:05.234'),(64,'cotizaciones','exportar_pdf','Exportar cotización a PDF','2026-06-04 21:35:05.238'),(65,'mermas','ver','Ver mermas','2026-06-04 21:35:05.241'),(66,'mermas','crear','Crear mermas','2026-06-04 21:35:05.248'),(67,'mermas','editar','Editar mermas','2026-06-04 21:35:05.251'),(68,'mermas','eliminar','Eliminar mermas','2026-06-04 21:35:05.255'),(69,'mermas','exportar_excel','Exportar mermas a Excel','2026-06-04 21:35:05.258'),(70,'mermas','registrar_desde_venta','Registrar merma desde venta','2026-06-04 21:35:05.263'),(71,'abonos','ver','Ver abonos','2026-06-04 21:35:05.266'),(72,'abonos','registrar','Registrar abonos a ventas pendientes','2026-06-04 21:35:05.270'),(73,'maquinas','ver','Ver máquinas de impresión','2026-06-05 03:19:39.823'),(74,'maquinas','crear','Crear máquinas de impresión','2026-06-05 03:19:39.827'),(75,'maquinas','editar','Editar máquinas de impresión','2026-06-05 03:19:39.833'),(76,'maquinas','eliminar','Eliminar máquinas de impresión','2026-06-05 03:19:39.838'),(77,'maquinas','ver_contador','Ver contador de impresiones','2026-06-05 03:19:39.842'),(78,'maquinas','reset_contador','Resetear contador de máquina','2026-06-05 03:19:39.846'),(79,'produccion','ver','Ver órdenes de producción','2026-06-05 18:58:06.810'),(80,'produccion','crear','Crear órdenes de producción','2026-06-05 18:58:06.814'),(81,'produccion','editar','Editar órdenes de producción','2026-06-05 18:58:06.817'),(82,'produccion','cambiar_estatus','Cambiar estatus de órdenes de producción','2026-06-05 18:58:06.821'),(83,'produccion','cancelar','Cancelar órdenes de producción','2026-06-05 18:58:06.824'),(84,'caja','ver','Ver caja y movimientos','2026-06-10 19:56:12.755'),(85,'caja','aperturar','Aperturar caja','2026-06-10 19:56:12.762'),(86,'caja','cerrar','Realizar corte de caja','2026-06-10 19:56:12.767'),(87,'caja','ingreso','Registrar ingreso a caja','2026-06-10 19:56:12.771'),(88,'caja','gasto','Registrar gasto desde caja','2026-06-10 19:56:12.775'),(89,'caja','retiro','Registrar retiro de caja','2026-06-10 19:56:12.779'),(90,'caja','reimprimir','Reimprimir corte de caja','2026-06-10 19:56:12.782');
/*!40000 ALTER TABLE `permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto_insumos`
--

DROP TABLE IF EXISTS `producto_insumos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto_insumos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_id` int NOT NULL,
  `insumo_id` int NOT NULL,
  `cantidad_requerida` decimal(12,3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `producto_insumos_producto_id_insumo_id_key` (`producto_id`,`insumo_id`),
  KEY `producto_insumos_producto_id_idx` (`producto_id`),
  KEY `producto_insumos_insumo_id_idx` (`insumo_id`),
  CONSTRAINT `producto_insumos_insumo_fkey` FOREIGN KEY (`insumo_id`) REFERENCES `insumos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `producto_insumos_producto_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto_insumos`
--

LOCK TABLES `producto_insumos` WRITE;
/*!40000 ALTER TABLE `producto_insumos` DISABLE KEYS */;
INSERT INTO `producto_insumos` VALUES (4,4,2,500.000),(5,5,2,1.000),(6,6,2,1.000),(7,2,1,1.000),(8,14,12,1.000),(12,16,68,1.000),(22,19,72,1.000),(25,15,67,1.000),(26,18,71,1.000),(27,35,70,1.000),(28,29,70,1.000);
/*!40000 ALTER TABLE `producto_insumos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto_precios`
--

DROP TABLE IF EXISTS `producto_precios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto_precios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_id` int NOT NULL,
  `nivel` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad_minima` int NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `producto_precios_producto_id_nivel_key` (`producto_id`,`nivel`),
  KEY `producto_precios_producto_id_idx` (`producto_id`),
  CONSTRAINT `producto_precios_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto_precios`
--

LOCK TABLES `producto_precios` WRITE;
/*!40000 ALTER TABLE `producto_precios` DISABLE KEYS */;
INSERT INTO `producto_precios` VALUES (4,2,'medio_mayoreo',15,1.80,1,'2026-06-06 21:42:45.630','2026-06-06 21:42:45.630'),(5,15,'medio_mayoreo',1,12.00,1,'2026-06-14 19:39:58.159','2026-07-01 20:07:27.083'),(6,15,'mayoreo',16,10.00,1,'2026-06-14 19:39:58.242','2026-07-01 20:07:27.756'),(7,15,'super_mayoreo',301,8.00,1,'2026-06-14 19:39:58.323','2026-07-01 20:07:28.079'),(8,16,'medio_mayoreo',1,12.00,1,'2026-06-14 19:41:06.876','2026-06-14 21:29:16.825'),(9,16,'mayoreo',16,10.00,1,'2026-06-14 19:41:06.960','2026-06-14 21:29:16.989'),(10,16,'super_mayoreo',301,8.00,1,'2026-06-14 19:41:07.041','2026-06-14 21:29:17.145'),(11,17,'medio_mayoreo',1,25.00,1,'2026-06-14 20:21:00.627','2026-06-19 22:57:20.796'),(12,17,'mayoreo',21,22.00,1,'2026-06-14 20:21:00.712','2026-06-19 22:57:21.074'),(13,17,'super_mayoreo',100,18.00,1,'2026-06-14 20:21:00.793','2026-06-19 22:57:21.756'),(15,22,'medio_mayoreo',10,90.00,1,'2026-07-17 02:16:07.781','2026-07-17 02:16:07.781'),(16,24,'medio_mayoreo',1,25.00,1,'2026-07-17 02:16:07.801','2026-07-17 02:16:07.801'),(17,24,'mayoreo',21,22.00,1,'2026-07-17 02:16:07.801','2026-07-17 02:16:07.801'),(18,24,'super_mayoreo',100,18.00,1,'2026-07-17 02:16:07.801','2026-07-17 02:16:07.801'),(19,26,'medio_mayoreo',1,12.00,1,'2026-07-17 02:16:07.830','2026-07-17 02:16:07.830'),(20,26,'mayoreo',16,10.00,1,'2026-07-17 02:16:07.830','2026-07-17 02:16:07.830'),(21,26,'super_mayoreo',301,8.00,1,'2026-07-17 02:16:07.830','2026-07-17 02:16:07.830'),(37,29,'medio_mayoreo',1,25.00,1,'2026-07-17 20:23:18.179','2026-07-29 22:35:30.131'),(38,29,'mayoreo',21,22.00,1,'2026-07-17 20:23:18.179','2026-07-29 22:35:30.612'),(39,29,'super_mayoreo',100,18.00,1,'2026-07-17 20:23:18.179','2026-07-29 22:35:30.607'),(40,35,'medio_mayoreo',1,25.00,1,'2026-07-17 20:23:18.195','2026-07-29 21:53:04.678'),(41,35,'mayoreo',21,22.00,1,'2026-07-17 20:23:18.195','2026-07-29 21:53:05.164'),(42,35,'super_mayoreo',100,18.00,1,'2026-07-17 20:23:18.195','2026-07-29 21:53:05.160'),(43,31,'medio_mayoreo',1,12.00,1,'2026-07-17 20:23:18.234','2026-07-29 23:52:22.284'),(44,31,'mayoreo',16,10.00,1,'2026-07-17 20:23:18.234','2026-07-29 23:52:22.663'),(45,31,'super_mayoreo',301,8.00,1,'2026-07-17 20:23:18.234','2026-07-29 23:52:22.680'),(46,37,'medio_mayoreo',1,12.00,1,'2026-07-17 20:23:18.248','2026-07-17 20:23:18.248'),(47,37,'mayoreo',16,10.00,1,'2026-07-17 20:23:18.248','2026-07-17 20:23:18.248'),(48,37,'super_mayoreo',301,8.00,1,'2026-07-17 20:23:18.248','2026-07-17 20:23:18.248'),(49,39,'medio_mayoreo',1,12.00,1,'2026-07-17 20:23:18.258','2026-07-17 20:23:18.258'),(50,39,'mayoreo',16,10.00,1,'2026-07-17 20:23:18.258','2026-07-17 20:23:18.258'),(51,39,'super_mayoreo',301,8.00,1,'2026-07-17 20:23:18.258','2026-07-17 20:23:18.258'),(53,41,'medio_mayoreo',5,0.40,1,'2026-07-24 21:10:48.935','2026-07-24 21:10:48.935'),(54,43,'medio_mayoreo',5,0.40,1,'2026-08-02 21:34:25.767','2026-08-02 21:34:25.767'),(55,49,'medio_mayoreo',1,25.00,1,'2026-08-02 21:34:25.811','2026-08-02 21:34:25.811'),(56,49,'mayoreo',21,22.00,1,'2026-08-02 21:34:25.811','2026-08-02 21:34:25.811'),(57,49,'super_mayoreo',100,18.00,1,'2026-08-02 21:34:25.811','2026-08-02 21:34:25.811'),(58,51,'medio_mayoreo',1,25.00,1,'2026-08-02 21:34:25.829','2026-08-02 21:34:25.829'),(59,51,'mayoreo',21,22.00,1,'2026-08-02 21:34:25.829','2026-08-02 21:34:25.829'),(60,51,'super_mayoreo',100,18.00,1,'2026-08-02 21:34:25.829','2026-08-02 21:34:25.829'),(61,57,'medio_mayoreo',1,12.00,1,'2026-08-02 21:34:25.881','2026-08-02 21:34:25.881'),(62,57,'mayoreo',16,10.00,1,'2026-08-02 21:34:25.881','2026-08-02 21:34:25.881'),(63,57,'super_mayoreo',301,8.00,1,'2026-08-02 21:34:25.881','2026-08-02 21:34:25.881'),(64,59,'medio_mayoreo',1,12.00,1,'2026-08-02 21:34:25.900','2026-08-02 21:34:25.900'),(65,59,'mayoreo',16,10.00,1,'2026-08-02 21:34:25.900','2026-08-02 21:34:25.900'),(66,59,'super_mayoreo',301,8.00,1,'2026-08-02 21:34:25.900','2026-08-02 21:34:25.900'),(67,61,'medio_mayoreo',1,12.00,1,'2026-08-02 21:34:25.915','2026-08-02 21:34:25.915'),(68,61,'mayoreo',16,10.00,1,'2026-08-02 21:34:25.915','2026-08-02 21:34:25.915'),(69,61,'super_mayoreo',301,8.00,1,'2026-08-02 21:34:25.915','2026-08-02 21:34:25.915');
/*!40000 ALTER TABLE `producto_precios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `precio_venta` decimal(10,2) NOT NULL,
  `precio_compra` decimal(10,2) DEFAULT NULL,
  `categoria_id` int DEFAULT NULL,
  `proveedor_id` int DEFAULT NULL,
  `unidad_medida` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unidad',
  `imagen_url` text COLLATE utf8mb4_unicode_ci,
  `maquina_id` int DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `cobrar_minimo_1` tinyint(1) NOT NULL DEFAULT '0',
  `sucursal_id` int NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `productos_codigo_sucursal_id_key` (`codigo`,`sucursal_id`),
  KEY `productos_categoria_id_idx` (`categoria_id`),
  KEY `productos_activo_idx` (`activo`),
  KEY `productos_maquina_id_idx` (`maquina_id`),
  KEY `productos_proveedor_id_fkey` (`proveedor_id`),
  KEY `productos_sucursal_id_idx` (`sucursal_id`),
  CONSTRAINT `productos_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `productos_maquina_id_fkey` FOREIGN KEY (`maquina_id`) REFERENCES `maquinas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `productos_proveedor_id_fkey` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `productos_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `productos_chk_1` CHECK ((`precio_venta` >= 0)),
  CONSTRAINT `productos_chk_2` CHECK ((`precio_compra` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,NULL,'Foto Copia',NULL,2.00,NULL,1,NULL,'pieza',NULL,NULL,0,0,1,'2026-06-01 01:03:22.000','2026-06-01 01:58:04.000'),(2,NULL,'Fotocopia',NULL,2.00,NULL,1,NULL,'unidad','/uploads/producto-1780279079080-370872396.png',NULL,0,0,1,'2026-06-01 01:40:53.000','2026-06-14 19:36:14.000'),(3,NULL,'Lapiz N.2','Lapiz de madera',4.00,NULL,NULL,NULL,'pieza','/uploads/producto-1780278331098-603388466.jpg',NULL,0,0,1,'2026-06-01 01:45:31.000','2026-06-14 19:36:24.000'),(4,NULL,'COUCHE MATE 300GR',NULL,12.00,2.00,1,NULL,'pieza',NULL,NULL,0,0,1,'2026-06-06 16:48:29.000','2026-06-06 17:03:41.000'),(5,NULL,'COUCHE MATE 300GR',NULL,15.00,3.00,1,NULL,'pieza',NULL,NULL,0,0,1,'2026-06-06 17:02:28.000','2026-06-06 17:03:39.000'),(6,NULL,'IMPRESION COUCHE MATE DE 300GR ',NULL,12.00,1.30,1,NULL,'pieza',NULL,NULL,0,0,1,'2026-06-06 17:04:48.000','2026-06-14 19:36:21.000'),(7,NULL,'Goma de borrar',NULL,5.00,NULL,2,NULL,'pieza',NULL,NULL,0,0,1,'2026-06-06 22:02:14.000','2026-06-14 19:36:19.000'),(8,NULL,'Libreta',NULL,20.00,NULL,NULL,NULL,'pieza',NULL,NULL,0,0,1,'2026-06-06 22:02:26.000','2026-06-14 19:36:27.000'),(9,NULL,'Lona M2',NULL,85.00,NULL,NULL,NULL,'M.2',NULL,NULL,0,0,1,'2026-06-07 01:05:08.000','2026-06-07 01:05:22.000'),(11,NULL,'Lona Test',NULL,85.00,NULL,NULL,NULL,'M.2',NULL,NULL,0,0,1,'2026-06-07 01:16:53.000','2026-06-07 01:19:15.000'),(12,NULL,'Lona Stock',NULL,85.00,NULL,NULL,NULL,'M.2',NULL,NULL,0,0,1,'2026-06-07 01:17:14.000','2026-06-07 01:19:15.000'),(13,NULL,'Cable ML',NULL,50.00,NULL,NULL,NULL,'ML',NULL,NULL,0,0,1,'2026-06-07 01:19:07.000','2026-06-07 01:19:15.000'),(14,NULL,'Lona Brillante',NULL,85.00,NULL,3,NULL,'M.2',NULL,NULL,0,0,1,'2026-06-09 21:34:47.000','2026-06-14 19:36:10.000'),(15,NULL,'V280 IMPRESION COUCHE BRILLANTE 150GR',NULL,12.00,1.20,1,NULL,'PZ',NULL,1,0,1,1,'2026-06-14 19:39:58.000','2026-07-17 19:43:54.090'),(16,NULL,'V280 IMPRESION COUCHE BRILLANTE 300GR',NULL,12.00,1.20,1,NULL,'PZ',NULL,NULL,0,0,1,'2026-06-14 19:41:07.000','2026-07-17 19:46:08.974'),(17,NULL,'IMPRESION DE PLANOS ',NULL,25.00,5.00,1,NULL,'ML',NULL,NULL,0,0,1,'2026-06-14 20:21:00.000','2026-07-17 19:43:38.615'),(18,NULL,'IMPRESION DE LONA BRILLANTE',NULL,45.00,7.00,3,NULL,'M.2',NULL,NULL,0,1,1,'2026-06-17 20:17:53.000','2026-07-17 19:43:33.388'),(19,NULL,'Prueba de stock',NULL,10.00,NULL,2,NULL,'PZ',NULL,NULL,0,1,1,'2026-06-20 22:50:08.314','2026-07-17 19:43:47.076'),(20,NULL,'prueba',NULL,5.00,NULL,NULL,NULL,'PZ',NULL,NULL,0,1,1,'2026-06-20 22:53:11.823','2026-06-20 22:53:32.569'),(21,NULL,'PRODUCTO CUCOUS','Prueba de producto para codigo',0.49,10.00,2,NULL,'PZ','/uploads/producto-1784253926560-715558901.jpg',NULL,0,1,1,'2026-07-17 02:05:26.571','2026-07-17 20:05:47.751'),(22,NULL,'Ejemplo de producto',NULL,100.00,50.00,1,NULL,'unidad',NULL,NULL,0,0,1,'2026-07-17 02:13:46.272','2026-07-17 19:43:30.836'),(23,NULL,'IMPRESION DE LONA BRILLANTE',NULL,45.00,7.00,3,NULL,'M.2',NULL,NULL,0,0,1,'2026-07-17 02:16:07.793','2026-07-17 19:43:35.947'),(24,NULL,'IMPRESION DE PLANOS',NULL,25.00,5.00,1,NULL,'ML',NULL,NULL,0,0,1,'2026-07-17 02:16:07.799','2026-07-17 19:43:41.439'),(25,NULL,'Prueba de stock',NULL,10.00,NULL,2,NULL,'PZ',NULL,NULL,0,0,1,'2026-07-17 02:16:07.822','2026-07-17 19:43:49.769'),(26,NULL,'V280 IMPRESION COUCHE BRILLANTE 150GR',NULL,12.00,1.20,1,NULL,'PZ',NULL,NULL,0,0,1,'2026-07-17 02:16:07.828','2026-07-17 19:44:05.071'),(28,'IMDL-0002','IMPRESION DE LONA BRILLANTE',NULL,45.00,7.00,3,NULL,'M.2',NULL,NULL,1,0,1,'2026-07-17 20:05:47.773','2026-07-17 20:23:18.160'),(29,'IMDP-0002','IMPRESION DE PLANOS',NULL,25.00,5.00,1,NULL,'ML',NULL,2,1,1,1,'2026-07-17 20:05:47.782','2026-07-29 22:35:29.890'),(30,'PRDS-0002','Prueba de stock',NULL,10.00,NULL,2,NULL,'PZ',NULL,NULL,1,0,1,'2026-07-17 20:05:47.795','2026-07-17 20:23:18.213'),(31,'V2IC-0002','V280 IMPRESION COUCHE BRILLANTE 150GR',NULL,12.00,1.20,1,NULL,'PZ',NULL,1,1,1,1,'2026-07-17 20:05:47.803','2026-07-29 23:52:21.992'),(33,'PRCO-0001','PRODUCTO CUCOUS xd','Prueba de producto para codigo',0.49,10.00,2,NULL,'PZ',NULL,NULL,1,1,1,'2026-07-17 20:20:59.670','2026-08-02 21:34:25.837'),(34,'IMDL-0003','IMPRESION DE LONA',NULL,45.00,7.00,3,NULL,'M.2',NULL,NULL,1,0,1,'2026-07-17 20:20:59.687','2026-07-17 20:23:18.169'),(35,'IMDP-0003','IMPRESION DE PLANOS B/N',NULL,25.00,5.00,1,NULL,'ML',NULL,2,1,1,1,'2026-07-17 20:20:59.694','2026-07-29 21:53:04.447'),(36,'PRDS-0003','Prueba',NULL,10.00,NULL,2,NULL,'PZ',NULL,NULL,1,0,1,'2026-07-17 20:20:59.705','2026-07-17 20:23:18.223'),(37,'V2IC-0003','V280 IMPRESION COUCHE BRILLANTE 250GR',NULL,12.00,1.20,1,NULL,'PZ',NULL,NULL,1,0,1,'2026-07-17 20:20:59.711','2026-07-17 20:23:18.244'),(39,'V2IC-0004','V280 IMPRESION COUCHE BRILLANTE 300GR',NULL,12.00,1.20,1,NULL,'PZ',NULL,NULL,1,0,1,'2026-07-17 20:20:59.753','2026-07-17 20:23:18.256'),(41,'FOTO-0001','Fotocopia INE','Fotocopia de algo',0.50,0.10,1,NULL,'PZ',NULL,NULL,1,1,1,'2026-07-24 21:09:19.064','2026-07-24 21:10:48.902'),(43,'FOIN-0001','Fotocopia INE','Fotocopia de algo',0.50,0.10,1,NULL,'PZ',NULL,NULL,1,0,1,'2026-08-02 21:34:25.760','2026-08-02 21:34:25.760'),(45,'IMDL-0004','IMPRESION DE LONA',NULL,45.00,7.00,3,NULL,'M.2',NULL,NULL,1,0,1,'2026-08-02 21:34:25.785','2026-08-02 21:34:25.785'),(47,'IMDL-0005','IMPRESION DE LONA BRILLANTE',NULL,45.00,7.00,3,NULL,'M.2',NULL,NULL,1,0,1,'2026-08-02 21:34:25.798','2026-08-02 21:34:25.798'),(49,'IMDP-0004','IMPRESION DE PLANOS',NULL,25.00,5.00,1,NULL,'ML',NULL,NULL,1,0,1,'2026-08-02 21:34:25.809','2026-08-02 21:34:25.809'),(51,'IMDP-0005','IMPRESION DE PLANOS B/N',NULL,25.00,5.00,1,NULL,'ML',NULL,NULL,1,0,1,'2026-08-02 21:34:25.827','2026-08-02 21:34:25.827'),(53,'PRUE-0001','Prueba',NULL,10.00,NULL,2,NULL,'PZ',NULL,NULL,1,0,1,'2026-08-02 21:34:25.857','2026-08-02 21:34:25.857'),(55,'PRDS-0004','Prueba de stock',NULL,10.00,NULL,2,NULL,'PZ',NULL,NULL,1,0,1,'2026-08-02 21:34:25.868','2026-08-02 21:34:25.868'),(57,'V2IC-0005','V280 IMPRESION COUCHE BRILLANTE 150GR',NULL,12.00,1.20,1,NULL,'PZ',NULL,NULL,1,0,1,'2026-08-02 21:34:25.878','2026-08-02 21:34:25.878'),(59,'V2IC-0006','V280 IMPRESION COUCHE BRILLANTE 250GR',NULL,12.00,1.20,1,NULL,'PZ',NULL,NULL,1,0,1,'2026-08-02 21:34:25.897','2026-08-02 21:34:25.897'),(61,'V2IC-0007','V280 IMPRESION COUCHE BRILLANTE 300GR',NULL,12.00,1.20,1,NULL,'PZ',NULL,NULL,1,0,1,'2026-08-02 21:34:25.912','2026-08-02 21:34:25.912');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contacto` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rfc` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_unicode_ci,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `proveedores_activo_idx` (`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedores`
--

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
INSERT INTO `proveedores` VALUES (1,'Distribuidora Test','Juan Pérez','555-1234','test@test.com','XAXX010101000',NULL,NULL,1,'2026-06-04 20:24:42.000','2026-06-04 20:24:42.000');
/*!40000 ALTER TABLE `proveedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol_permisos`
--

DROP TABLE IF EXISTS `rol_permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol_permisos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rol_id` int NOT NULL,
  `permiso_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rol_permisos_rol_id_permiso_id_key` (`rol_id`,`permiso_id`),
  KEY `rol_permisos_rol_id_idx` (`rol_id`),
  KEY `rol_permisos_permiso_id_idx` (`permiso_id`),
  CONSTRAINT `rol_permisos_permiso_id_fkey` FOREIGN KEY (`permiso_id`) REFERENCES `permisos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `rol_permisos_rol_id_fkey` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol_permisos`
--

LOCK TABLES `rol_permisos` WRITE;
/*!40000 ALTER TABLE `rol_permisos` DISABLE KEYS */;
INSERT INTO `rol_permisos` VALUES (972,1,1),(973,1,2),(974,1,3),(975,1,4),(976,1,5),(977,1,6),(978,1,7),(979,1,8),(980,1,9),(981,1,10),(982,1,11),(983,1,12),(984,1,13),(985,1,14),(986,1,15),(987,1,16),(988,1,17),(989,1,18),(990,1,19),(991,1,20),(992,1,21),(993,1,22),(994,1,23),(995,1,24),(996,1,25),(1038,1,26),(1039,1,27),(1040,1,28),(1041,1,29),(1042,1,30),(1043,1,31),(1044,1,32),(1045,1,33),(1046,1,34),(1047,1,35),(1048,1,36),(1049,1,37),(1050,1,38),(1051,1,39),(1052,1,40),(1053,1,41),(1054,1,42),(997,1,43),(998,1,44),(999,1,45),(1000,1,46),(1001,1,47),(1002,1,48),(1003,1,49),(1004,1,50),(1005,1,51),(1006,1,52),(1007,1,53),(1008,1,54),(1009,1,55),(1010,1,56),(1011,1,57),(1012,1,58),(1013,1,59),(1014,1,60),(1015,1,61),(1016,1,62),(1017,1,63),(1018,1,64),(1019,1,65),(1020,1,66),(1021,1,67),(1022,1,68),(1023,1,69),(1024,1,70),(1025,1,71),(1026,1,72),(1027,1,73),(1028,1,74),(1029,1,75),(1030,1,76),(1031,1,77),(1032,1,78),(1033,1,79),(1034,1,80),(1035,1,81),(1036,1,82),(1037,1,83),(1055,1,84),(1056,1,85),(1057,1,86),(1058,1,87),(1059,1,88),(1060,1,89),(1061,1,90),(1086,2,1),(1087,2,2),(1088,2,11),(1089,2,79),(1090,2,82),(1091,2,84),(1062,3,1),(1063,3,2),(1064,3,3),(1065,3,4),(1066,3,6),(1067,3,7),(1068,3,8),(1069,3,10),(1070,3,11),(1071,3,12),(1072,3,14),(1073,3,15),(1074,3,16),(1079,3,36),(1080,3,37),(1075,3,79),(1076,3,80),(1077,3,81),(1078,3,82),(1081,3,84),(1082,3,85),(1083,3,86),(1084,3,87),(1085,3,88),(1099,7,2),(1101,7,11),(1100,7,12),(1098,7,58),(1094,7,59),(1095,7,60),(1096,7,61),(1093,7,62),(1092,7,63),(1097,7,64);
/*!40000 ALTER TABLE `rol_permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `es_sistema` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_nombre_key` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','Administrador con acceso total al sistema',1,1,'2026-06-02 18:34:10.000','2026-07-01 00:49:55.059'),(2,'operador','Operador con acceso limitado a inventario y ventas',1,1,'2026-06-02 18:34:10.000','2026-07-01 00:49:55.107'),(3,'vendedor','Vendedor con acceso a ventas, clientes y productos',1,1,'2026-06-02 18:34:10.000','2026-07-01 00:49:55.098'),(7,'vendedor tiempo de prueba','estara en prueba',1,0,'2026-07-06 20:06:36.239','2026-07-06 20:06:36.239');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sucursales`
--

DROP TABLE IF EXISTS `sucursales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sucursales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` text COLLATE utf8mb4_unicode_ci,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sucursales`
--

LOCK TABLES `sucursales` WRITE;
/*!40000 ALTER TABLE `sucursales` DISABLE KEYS */;
INSERT INTO `sucursales` VALUES (1,'Sucursal Principal','Direccion principal',NULL,1,'2026-05-31 21:26:59.000','2026-05-31 21:26:59.000'),(2,'Sucursal 2','JUAS JUAS','1234344232',1,'2026-06-01 01:02:10.000','2026-06-01 01:02:10.000');
/*!40000 ALTER TABLE `sucursales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unidades_medida`
--

DROP TABLE IF EXISTS `unidades_medida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unidades_medida` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abreviatura` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `es_medida` tinyint(1) NOT NULL DEFAULT '0',
  `tipo_medida` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unidades_medida_nombre_key` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unidades_medida`
--

LOCK TABLES `unidades_medida` WRITE;
/*!40000 ALTER TABLE `unidades_medida` DISABLE KEYS */;
INSERT INTO `unidades_medida` VALUES (1,'Metros cuadrados','M.2','2026-06-04 21:57:01.604','2026-06-17 20:01:56.698',1,'m2'),(3,'Pieza','PZ','2026-06-07 00:24:19.703','2026-06-07 00:24:19.703',0,NULL),(4,'METROS LINEALES','ML','2026-06-14 20:14:52.721','2026-06-14 20:14:52.721',1,'ml');
/*!40000 ALTER TABLE `unidades_medida` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol_id` int DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `token_version` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_email_key` (`email`),
  KEY `usuarios_rol_id_idx` (`rol_id`),
  CONSTRAINT `usuarios_rol_id_fkey` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Administrador','admin@plprint.com','$2a$10$FsjS46Mhl/CKhx45hD/XvOBiqSbsriBYCqZxCQjk14xkAM2/d3agi',1,1,'2026-05-31 21:27:19.000','2026-07-22 02:55:55.952',19),(2,'vendedor','vendedor@gmail.com','$2a$12$cXkXG6AY.I0Iyc.nC3YrHOz4NrVZdQZglf4t9NZmoQsKVPiRL6V2K',3,1,'2026-06-11 00:33:34.000','2026-06-11 00:46:10.000',0),(3,'ALEXIS','alexislancho25@gmail.com','$2a$12$IEYeb/HYvuBJLNmqwFvEJ.vTNN7pblg.OLgJ6G5LuZiTKA2ct1zhy',3,1,'2026-06-14 20:45:21.000','2026-06-14 20:45:21.000',0),(4,'luis','luis@luis.com','$2a$12$P1f7tGvH5TTNjuFIxixKaOOCLtw7BYdzYjDQypHZU2TXA7ck0AuJe',3,1,'2026-06-14 20:48:25.000','2026-06-14 20:48:25.000',0);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios_sucursales`
--

DROP TABLE IF EXISTS `usuarios_sucursales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios_sucursales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `sucursal_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_sucursales_usuario_id_sucursal_id_key` (`usuario_id`,`sucursal_id`),
  KEY `usuarios_sucursales_sucursal_id_fkey` (`sucursal_id`),
  CONSTRAINT `usuarios_sucursales_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usuarios_sucursales_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios_sucursales`
--

LOCK TABLES `usuarios_sucursales` WRITE;
/*!40000 ALTER TABLE `usuarios_sucursales` DISABLE KEYS */;
INSERT INTO `usuarios_sucursales` VALUES (1,1,1),(2,2,1),(3,3,1),(4,4,1);
/*!40000 ALTER TABLE `usuarios_sucursales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venta_detalle`
--

DROP TABLE IF EXISTS `venta_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venta_detalle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `venta_id` int NOT NULL,
  `producto_id` int DEFAULT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `descuento` decimal(10,2) NOT NULL DEFAULT '0.00',
  `subtotal` decimal(10,2) NOT NULL,
  `ancho_m` decimal(10,4) DEFAULT NULL,
  `alto_m` decimal(10,4) DEFAULT NULL,
  `unidad_medida_detalle` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `venta_detalle_venta_id_fkey` (`venta_id`),
  KEY `venta_detalle_producto_id_fkey` (`producto_id`),
  CONSTRAINT `venta_detalle_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `venta_detalle_venta_id_fkey` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `venta_detalle_chk_1` CHECK ((`cantidad` > 0)),
  CONSTRAINT `venta_detalle_chk_2` CHECK ((`precio_unitario` >= 0)),
  CONSTRAINT `venta_detalle_chk_3` CHECK ((`descuento` >= 0)),
  CONSTRAINT `venta_detalle_chk_4` CHECK ((`subtotal` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venta_detalle`
--

LOCK TABLES `venta_detalle` WRITE;
/*!40000 ALTER TABLE `venta_detalle` DISABLE KEYS */;
INSERT INTO `venta_detalle` VALUES (1,1,2,5,2.00,0.00,10.00,NULL,NULL,NULL),(6,6,1,2,50.00,0.00,100.00,NULL,NULL,NULL),(7,7,2,1,50.00,0.00,50.00,NULL,NULL,NULL),(8,8,3,1,4.00,0.00,4.00,NULL,NULL,NULL),(9,8,2,1,2.00,0.00,2.00,NULL,NULL,NULL),(10,9,2,1,2.00,0.00,2.00,NULL,NULL,NULL),(11,9,3,1,4.00,0.00,4.00,NULL,NULL,NULL),(12,10,2,2,2.00,0.00,4.00,NULL,NULL,NULL),(13,11,12,1,76.50,0.00,76.50,NULL,NULL,NULL),(14,12,12,2,76.50,0.00,153.00,0.6000,1.5000,'m2'),(15,13,13,1,75.00,0.00,75.00,NULL,1.5000,'ml'),(16,14,3,1,4.00,0.00,4.00,NULL,NULL,NULL),(17,14,2,1,2.00,0.00,2.00,NULL,NULL,NULL),(26,23,15,310,8.00,0.00,2480.00,NULL,NULL,NULL),(27,24,15,200,10.00,0.00,2000.00,NULL,NULL,NULL),(28,72,15,1,12.00,0.00,12.00,NULL,NULL,NULL),(29,72,16,1,12.00,0.00,12.00,NULL,NULL,NULL),(30,73,15,1,12.00,0.00,12.00,NULL,NULL,NULL),(31,73,16,1,12.00,0.00,12.00,NULL,NULL,NULL),(32,74,15,2,12.00,0.00,24.00,NULL,NULL,NULL),(33,74,16,1,12.00,0.00,12.00,NULL,NULL,NULL),(34,75,15,2,12.00,0.00,24.00,NULL,NULL,NULL),(35,75,16,1,12.00,0.00,12.00,NULL,NULL,NULL),(36,76,16,2,12.00,0.00,24.00,NULL,NULL,NULL),(37,76,15,2,12.00,0.00,24.00,NULL,NULL,NULL),(38,77,18,1,45.00,0.00,45.00,1.2000,0.2000,'m2'),(39,78,18,1,45.00,0.00,45.00,1.2000,0.6000,'m2'),(40,79,16,2,12.00,0.00,24.00,NULL,NULL,NULL),(41,79,15,2,12.00,0.00,24.00,NULL,NULL,NULL),(42,79,19,2,10.00,0.00,20.00,NULL,NULL,NULL),(43,79,17,1,25.00,0.00,25.00,NULL,NULL,'ml'),(44,79,18,1,45.00,0.00,45.00,1.2000,NULL,'m2'),(45,80,18,2,45.00,0.00,90.00,1.2000,0.6000,'m2'),(46,81,18,1,45.00,0.00,45.00,1.2000,0.6000,'m2'),(47,82,18,1,45.00,0.00,45.00,1.2000,0.6000,'m2'),(48,83,18,1,45.00,0.00,45.00,1.2000,0.6000,'m2'),(49,84,35,1,25.00,0.00,25.00,NULL,0.6000,'ml'),(50,85,35,1,25.00,0.00,25.00,NULL,0.6000,'ml'),(51,86,35,1,25.00,0.00,25.00,NULL,0.6000,'ml'),(52,87,35,1,25.00,0.00,25.00,NULL,0.6000,'ml'),(53,88,29,1,25.00,0.00,25.00,NULL,0.4000,'ml'),(54,89,29,1,25.00,0.00,25.00,NULL,0.4000,'ml'),(55,90,31,5,12.00,0.00,60.00,NULL,NULL,NULL),(56,91,31,6,12.00,0.00,72.00,NULL,NULL,NULL),(57,92,41,1,0.50,0.00,0.50,NULL,NULL,NULL),(58,92,37,6,12.00,0.00,72.00,NULL,NULL,NULL),(59,92,31,10,12.00,0.00,120.00,NULL,NULL,NULL),(60,93,41,2,0.50,0.00,1.00,NULL,NULL,NULL),(61,93,36,2,10.00,0.00,20.00,NULL,NULL,NULL),(62,94,34,1,27.00,0.00,27.00,NULL,0.6000,'m2'),(63,95,28,1,29.25,0.00,29.25,NULL,0.6500,'m2'),(64,95,29,1,25.00,0.00,25.00,NULL,NULL,'ml'),(65,96,39,4,12.00,0.00,48.00,NULL,NULL,NULL),(66,97,41,20,0.40,0.00,8.00,NULL,NULL,NULL),(67,97,36,10,10.00,0.00,100.00,NULL,NULL,NULL),(68,97,34,2,27.00,0.00,54.00,NULL,0.6000,'m2'),(69,98,28,2,36.00,0.00,72.00,NULL,0.8000,'m2'),(70,98,31,15,12.00,0.00,180.00,NULL,NULL,NULL),(71,98,29,1,25.00,0.00,25.00,NULL,0.6000,'ml'),(72,99,39,5,12.00,0.00,60.00,NULL,NULL,NULL),(73,100,37,4,12.00,0.00,48.00,NULL,NULL,NULL),(74,101,41,4,0.50,0.00,2.00,NULL,NULL,NULL);
/*!40000 ALTER TABLE `venta_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sucursal_id` int DEFAULT NULL,
  `cliente_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `descuento` decimal(10,2) NOT NULL DEFAULT '0.00',
  `descuento_motivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metodo_pago` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'efectivo',
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'completada',
  `estado_pago` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pagada',
  `saldo_pendiente` decimal(10,2) NOT NULL DEFAULT '0.00',
  `fecha_limite_pago` datetime(3) DEFAULT NULL,
  `cotizacion_id` int DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `metodo_pago_id` int DEFAULT NULL,
  `folio` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ventas_folio_key` (`folio`),
  UNIQUE KEY `ventas_cotizacion_id_key` (`cotizacion_id`),
  KEY `ventas_sucursal_id_idx` (`sucursal_id`),
  KEY `ventas_cliente_id_idx` (`cliente_id`),
  KEY `ventas_created_at_idx` (`created_at`),
  KEY `ventas_metodo_pago_id_idx` (`metodo_pago_id`),
  KEY `ventas_estado_pago_idx` (`estado_pago`),
  KEY `ventas_usuario_id_fkey` (`usuario_id`),
  CONSTRAINT `ventas_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ventas_metodo_pago_id_fkey` FOREIGN KEY (`metodo_pago_id`) REFERENCES `metodos_pago` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ventas_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ventas_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ventas_chk_1` CHECK ((`total` >= 0)),
  CONSTRAINT `ventas_chk_2` CHECK ((`descuento` >= 0)),
  CONSTRAINT `ventas_chk_3` CHECK ((`metodo_pago` in (_utf8mb4'efectivo',_utf8mb4'tarjeta',_utf8mb4'transferencia',_utf8mb4'otro'))),
  CONSTRAINT `ventas_chk_4` CHECK ((`estado` in (_utf8mb4'completada',_utf8mb4'cancelada',_utf8mb4'devuelta',_utf8mb4'pendiente')))
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
INSERT INTO `ventas` VALUES (1,1,NULL,1,10.00,0.00,NULL,'efectivo','cancelada','pagada',0.00,NULL,NULL,NULL,'2026-06-01 01:41:26.000',1,NULL),(6,NULL,NULL,1,100.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,2,NULL,'2026-06-04 21:34:43.000',1,NULL),(7,1,NULL,1,50.00,0.00,NULL,'efectivo','completada','parcial',10.00,NULL,NULL,NULL,'2026-06-04 21:51:19.000',1,NULL),(8,1,NULL,1,6.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,NULL,'2026-06-04 21:59:54.000',1,NULL),(9,1,NULL,1,6.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,3,NULL,'2026-06-04 22:01:10.000',1,NULL),(10,1,NULL,1,4.00,0.00,NULL,'efectivo','cancelada','pagada',0.00,NULL,NULL,NULL,'2026-06-05 01:43:49.000',1,NULL),(11,1,NULL,1,76.50,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,NULL,'2026-06-07 01:17:14.000',1,NULL),(12,1,NULL,1,153.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,NULL,'2026-06-07 01:18:54.000',1,NULL),(13,1,NULL,1,75.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,NULL,'2026-06-07 01:19:07.000',1,NULL),(14,1,NULL,1,6.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,4,NULL,'2026-06-14 20:56:51.000',1,NULL),(23,1,NULL,1,2480.00,0.00,NULL,'efectivo','completada','pendiente',2480.00,NULL,NULL,NULL,'2026-06-14 21:40:06.000',1,'VEN-20260614-0001'),(24,1,NULL,1,2000.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,NULL,'2026-06-14 21:54:03.000',1,'VEN-20260614-0NaN'),(72,1,NULL,1,24.00,0.00,NULL,'efectivo','completada','pendiente',24.00,NULL,NULL,NULL,'2026-06-14 23:01:32.000',1,'VEN-20260614-0002'),(73,1,NULL,1,24.00,0.00,NULL,'efectivo','completada','pendiente',24.00,NULL,NULL,NULL,'2026-06-14 23:01:47.000',1,'VEN-20260614-0003'),(74,1,NULL,1,36.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,NULL,'2026-06-14 23:05:14.000',1,'VEN-20260614-0004'),(75,1,NULL,1,36.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,NULL,'2026-06-14 23:05:33.000',1,'VEN-20260614-0005'),(76,1,NULL,1,48.00,0.00,NULL,'efectivo','completada','pendiente',48.00,NULL,NULL,NULL,'2026-06-14 23:26:28.000',1,'VEN-20260614-0006'),(77,1,NULL,1,45.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,NULL,'2026-06-19 23:07:38.093',1,'VEN-20260619-0012'),(78,1,NULL,1,45.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,NULL,'2026-06-20 22:49:20.358',1,'VEN-20260620-0000'),(79,1,NULL,1,138.00,0.00,NULL,'efectivo','completada','parcial',38.00,NULL,NULL,'Gracias por su compra, quedan pendientes 38','2026-07-06 19:58:38.760',NULL,'VEN-20260706-0014'),(80,1,NULL,1,90.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,NULL,'2026-07-15 20:03:38.325',NULL,'VEN-20260715-0015'),(81,1,NULL,1,45.00,0.00,NULL,'efectivo','cancelada','pagada',0.00,NULL,NULL,NULL,'2026-07-15 20:38:28.397',NULL,'VEN-20260715-0001'),(82,1,NULL,1,45.00,0.00,NULL,'efectivo','cancelada','pagada',0.00,NULL,NULL,NULL,'2026-07-15 22:09:08.682',NULL,'VEN-20260715-0002'),(83,1,NULL,1,45.00,0.00,NULL,'efectivo','cancelada','pagada',0.00,NULL,NULL,NULL,'2026-07-15 22:16:53.174',NULL,'VEN-20260715-0003'),(84,1,NULL,1,25.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,NULL,'2026-07-29 21:52:10.934',NULL,'VEN-20260729-0019'),(85,1,NULL,1,25.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,'PRUEBA 2','2026-07-29 21:53:45.586',NULL,'VEN-20260729-0001'),(86,1,NULL,1,25.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,'Prueba 3','2026-07-29 22:14:55.983',NULL,'VEN-20260729-0002'),(87,1,NULL,1,25.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,'Prueba 4','2026-07-29 22:34:11.280',NULL,'VEN-20260729-0003'),(88,1,NULL,1,25.00,0.00,NULL,'efectivo','cancelada','pagada',0.00,NULL,NULL,'Prueba 5','2026-07-29 22:34:46.109',NULL,'VEN-20260729-0004'),(89,1,NULL,1,25.00,0.00,NULL,'efectivo','cancelada','pagada',0.00,NULL,NULL,'Prueba 6','2026-07-29 22:35:50.795',NULL,'VEN-20260729-0005'),(90,1,NULL,1,60.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,'Prueba cont.Imp','2026-07-29 23:52:49.337',NULL,'VEN-20260729-0006'),(91,1,NULL,1,72.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,'Prueba cantidad','2026-07-30 00:56:33.565',NULL,'VEN-20260729-0007'),(92,1,NULL,1,192.50,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,NULL,'2026-07-30 01:03:10.522',NULL,'VEN-20260729-0008'),(93,1,NULL,1,21.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,NULL,'2026-08-01 22:56:56.644',NULL,'VEN-20260801-0028'),(94,1,NULL,1,27.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,NULL,'2026-08-01 22:57:08.677',NULL,'VEN-20260801-0001'),(95,1,NULL,1,54.25,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,NULL,'2026-08-01 22:57:27.151',NULL,'VEN-20260801-0002'),(96,1,NULL,1,48.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,NULL,'2026-08-01 22:58:39.837',NULL,'VEN-20260801-0003'),(97,1,NULL,1,162.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,NULL,'2026-08-01 23:09:14.604',NULL,'VEN-20260801-0004'),(98,1,NULL,1,277.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,NULL,'2026-08-01 23:09:42.630',NULL,'VEN-20260801-0005'),(99,1,NULL,1,60.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,NULL,'2026-08-01 23:09:53.239',NULL,'VEN-20260801-0006'),(100,1,NULL,1,48.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,NULL,'2026-08-01 23:10:05.731',NULL,'VEN-20260801-0007'),(101,1,NULL,1,2.00,0.00,NULL,'efectivo','completada','pagada',0.00,NULL,NULL,NULL,'2026-08-02 01:41:05.550',NULL,'VEN-20260801-0008');
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas_abonos`
--

DROP TABLE IF EXISTS `ventas_abonos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas_abonos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `venta_id` int NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `monto` decimal(10,2) NOT NULL,
  `metodo_pago` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notas` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ventas_abonos_venta_id_idx` (`venta_id`),
  KEY `ventas_abonos_usuario_id_fkey` (`usuario_id`),
  CONSTRAINT `ventas_abonos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ventas_abonos_venta_id_fkey` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas_abonos`
--

LOCK TABLES `ventas_abonos` WRITE;
/*!40000 ALTER TABLE `ventas_abonos` DISABLE KEYS */;
INSERT INTO `ventas_abonos` VALUES (1,7,1,20.00,'Efectivo',NULL,'2026-06-04 21:51:18.621'),(2,7,1,5.00,'Efectivo','abono','2026-06-04 22:47:19.685'),(3,7,1,15.00,'Efectivo','abono de prueba','2026-06-04 23:05:51.259'),(4,94,1,27.00,'Tarjeta',NULL,'2026-08-01 22:57:47.418');
/*!40000 ALTER TABLE `ventas_abonos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'plprint'
--

--
-- Dumping routines for database 'plprint'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-03 17:30:44
