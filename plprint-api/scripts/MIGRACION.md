# Migración de datos: MySQL (VPS actual) → Postgres (VPS nuevo o Supabase)

## Prerequisitos

1. Postgres destino con schema vacío ya aplicado:

```bash
cd plprint-api
DATABASE_URL="postgresql://USER:PASS@HOST:5432/plprint" npx prisma migrate deploy
```

2. `pgloader` instalado en la máquina donde corre la migración:

```bash
# Ubuntu/Debian
sudo apt install pgloader
```

3. Acceso de red desde esa máquina a ambos motores (MySQL origen y Postgres destino).

## Pasos

1. **Congelar escrituras** en el sistema viejo (mantenimiento breve) para evitar drift de datos.

2. Editar `scripts/mysql-to-postgres.load` y reemplazar las credenciales de origen y destino.

3. Ejecutar:

```bash
pgloader scripts/mysql-to-postgres.load
```

pgloader reporta conteo de filas por tabla al finalizar. Verificar que todos digan "ok" y sin errores.

4. Verificar conteos (opcional, paranoia sana):

```bash
# MySQL origen
mysql -h HOST -u USER -p -e "SELECT COUNT(*) FROM ventas;" plprint
# Postgres destino
psql "$PG_URL" -c 'SELECT COUNT(*) FROM ventas;'
```

5. Correr seed de datos base solo si es base nueva sin datos previos (si migraste datos, **no correr seed** salvo que falten roles/permisos):

```bash
npm run db:seed
```

6. Apuntar `.env` del backend a Postgres nueva y reiniciar PM2/servicio.

7. Smoke test: login, lista productos, crear venta de prueba, cancelarla.

## Notas

- `_prisma_migrations` se excluye: Prisma ya registró el baseline Postgres.
- `reset sequences` ajusta los `autoincrement` (serial) al máximo actual — evita colisiones de IDs.
- Tiempo estimado: segundos para <100k filas; minutos para millones.
- Si MySQL tiene fechas `0000-00-00`, pgloader las convierte a NULL (regla `zero-dates-to-null`).

## Rollback

El origen MySQL no se toca. Si algo falla, sistema viejo sigue operativo; volver a apuntar `.env` a MySQL y revertir el commit de schema (`provider = "mysql"`) es el plan B.
