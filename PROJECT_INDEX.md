# PLPrint ERP — Índice del Proyecto

> Documento de referencia arquitectónica. Actualizar cuando se agreguen módulos, cambien rutas o se modifique la estructura de carpetas.

> **Migración Postgres/Supabase/Vercel (2026-09):** El backend migró de MySQL a **PostgreSQL** (`provider = "postgresql"`). Migraciones MySQL archivadas en `prisma/migrations_mysql_legacy/`; baseline PG en `prisma/migrations/0_init_postgres`. Uploads (imágenes, logo, CSD) van a **Supabase Storage** (util `src/utils/storage.ts`); `tempStore` usa tabla `temp_store` en Postgres. Respaldos usan `pg_dump` (deshabilitados en Vercel, donde Supabase cubre backups). Entrypoint serverless: `plprint-api/api/index.ts` + `vercel.json`. Migración de datos: `scripts/mysql-to-postgres.load` (pgloader) + `scripts/MIGRACION.md`.


---

## 1. Estructura General

```
plprint/
├── plprint-api/                  # Backend (Express + TypeScript + Prisma + MySQL)
│   ├── src/
│   │   ├── app.ts                # Configuración Express (middlewares globales, rutas)
│   │   ├── server.ts             # Punto de entrada (conexión DB, listen)
│   │   ├── config/               # Variables de entorno y singleton Prisma
│   │   ├── middleware/           # 6 middlewares (auth, rbac, validate, rateLimiter, audit, errorHandler)
│   │   ├── utils/                # 5 utilerías (jwt, response, tempStore, logger, errors)
│   │   ├── types/                # Extensión de tipos Express (req.user)
│   │   ├── routes/               # 28 archivos de rutas (uno por módulo)
│   │   ├── controllers/          # 27 controladores (uno por ruta)
│   │   └── services/             # 27 servicios (uno por controlador)
│   └── prisma/
│       ├── schema.prisma         # 28 modelos
│       ├── seed.ts               # Seed inicial (roles, admin, permisos, config)
│       └── migrations/           # Migraciones
│
├── plprint-web/                  # Frontend (React + TypeScript + Vite + Tailwind)
│   └── src/
│       ├── api/                  # 27 módulos API + cliente axios
│       ├── components/
│       │   ├── layout/           # Layout, Sidebar, Header
│       │   ├── ui/               # 20 componentes UI reutilizables
│       │   └── forms/            # 13 formularios de negocio compartidos
│       ├── hooks/                # 8 hooks personalizados
│       ├── pages/                # 19 grupos de páginas (~100+ archivos)
│       ├── routes/               # Definición de rutas + ProtectedRoute
│       ├── store/                # 5 stores Zustand
│       ├── types/                # 4 archivos de tipos compartidos
│       └── utils/                # 3 utilerías
│
└── PROJECT_INDEX.md              # Este archivo
```

---

## 2. Backend — Mapa de Archivos

### 2.1 Infraestructura

| Archivo | Propósito |
|---|---|
| `src/app.ts` | Configura Express: helmet, cors, compression, morgan, JSON (10MB), archivos estáticos `/uploads`, rate limiter global, monta rutas en `/api/v1`, health check `/health`, error handler centralizado |
| `src/server.ts` | Conecta a MySQL vía Prisma, escucha en `env.PORT` (4000), graceful shutdown en SIGTERM |
| `src/config/env.ts` | Validación Zod de variables de entorno (DB, JWT, CORS, uploads, rate limit) |
| `src/config/database.ts` | Singleton de PrismaClient con logging opcional en desarrollo |

### 2.2 Middleware

| Middleware | Propósito |
|---|---|
| `middleware/auth.middleware.ts` | `authenticate`: extrae Bearer token, verifica JWT, valida `token_version`, setea `req.user` |
| `middleware/rbac.middleware.ts` | `authorize(roles)` por rolId, `authorizePermission(modulo, accion)` vía `rol_permisos`, `authorizeSucursal` por sucursal |
| `middleware/validate.middleware.ts` | Validación Zod genérica para body/params/query |
| `middleware/rateLimiter.middleware.ts` | Rate limiter global (500/15min) y estricto para login (10/15min) |
| `middleware/audit.middleware.ts` | Intercepta `res.json`, registra operaciones exitosas (<400) en `audit_log`, sanitiza campos sensibles |
| `middleware/errorHandler.middleware.ts` | Maneja ZodError, AppError, Prisma P2002 (conflict), P2025 (not found), fallback 500 |

### 2.3 Utilerías

| Archivo | Propósito |
|---|---|
| `utils/jwt.ts` | JwtPayload (sub, email, rolId, sucursales, tokenVersion, permisos), sign/verify access y refresh tokens |
| `utils/response.ts` | Helpers `sendSuccess`, `sendCreated`, `sendNoContent`, `buildPaginationMeta` |
| `utils/tempStore.ts` | Almacenamiento temporal en memoria con TTL (30 min) para previsualización de importaciones |
| `utils/logger.ts` | Winston logger: console colorido en dev, JSON + archivo en prod |
| `utils/errors.ts` | Clases AppError, NotFoundError (404), ValidationError (400), UnauthorizedError (401), ForbiddenError (403), ConflictError (409) |

### 2.4 Rutas, Controladores y Servicios

| Ruta | Controller | Service | Endpoints |
|---|---|---|---|
| `routes/auth.routes.ts` | AuthController | AuthService | POST login, POST refresh, GET me, POST logout |
| `routes/productos.routes.ts` | ProductosController | ProductosService | CRUD + plantilla, exportar, importar (preview/confirm), insumos por producto |
| `routes/ventas.routes.ts` | VentasController | VentasService | CRUD + público por ID, validar-insumos, cancelar |
| `routes/inventario.routes.ts` | InventarioController | InventarioService | GET por sucursal, kardex, POST ajuste |
| `routes/clientes.routes.ts` | ClientesController | ClientesService | CRUD + historial de compras |
| `routes/usuarios.routes.ts` | UsuariosController | UsuariosService | CRUD + asignar/remover sucursales |
| `routes/sucursales.routes.ts` | SucursalesController | SucursalesService | CRUD + copiar productos/insumos |
| `routes/categorias.routes.ts` | CategoriasController | CategoriasService | CRUD, filtro por tipo |
| `routes/insumos.routes.ts` | InsumosController | InsumosService | CRUD + inventario por sucursal, ajuste de stock + plantilla, exportar, importar (preview/confirm) (pendiente) |
| `routes/configuracion.routes.ts` | ConfiguracionController | ConfiguracionService | GET (todos/por grupo), PUT batch, POST logo, POST csd |
| `routes/roles.routes.ts` | RolesController | RolesService | CRUD + listar permisos |
| `routes/metodosPago.routes.ts` | MetodosPagoController | MetodosPagoService | CRUD + toggle activo |
| `routes/auditLog.routes.ts` | AuditLogController | AuditLogService | GET (lista/estadísticas/por ID) |
| `routes/respaldo.routes.ts` | RespaldoController | RespaldoService | Generar, listar, descargar, eliminar backups + stats DB |
| `routes/notificaciones.routes.ts` | NotificacionesController | NotificacionesService | CRUD config + alertas (stock bajo, ventas, canceladas, sin stock) |
| `routes/reportes.routes.ts` | ReportesController | ReportesService | Dashboard, ventas por rango, top productos/clientes, kardex global, ganancias |
| `routes/proveedores.routes.ts` | ProveedoresController | ProveedoresService | CRUD |
| `routes/unidadesMedida.routes.ts` | UnidadesMedidaController | UnidadesMedidaService | CRUD |
| `routes/gastos.routes.ts` | GastosController | GastosService | CRUD categorías + CRUD gastos (gasto/ingreso/retiro) |
| `routes/compras.routes.ts` | ComprasController | ComprasService | CRUD + batch, incrementa inventario insumos |
| `routes/cotizaciones.routes.ts` | CotizacionesController | CotizacionesService | CRUD + convertir a venta + cancelar |
| `routes/mermas.routes.ts` | MermasController | MermasService | CRUD, decrementa inventario (producto o insumo) |
| `routes/abonos.routes.ts` | AbonosController | AbonosService | GET/ POST/ DELETE abonos por venta |
| `routes/maquinas.routes.ts` | MaquinasController | MaquinasService | CRUD + stats + reporte de corte |
| `routes/ordenesProduccion.routes.ts` | OrdenesProduccionController | OrdenesProduccionService | CRUD + cambio de estatus + estadísticas + historial |
| `routes/preciosProducto.routes.ts` | (funciones exportadas) | PreciosProductoService | CRUD precios por volumen (medio_mayoreo, mayoreo, super_mayoreo) |
| `routes/caja.routes.ts` | CajaController | CajaService | Estado, apertura, corte, movimientos, ingresos/gastos/retiros, reporte-maquinas, reporte-categorias-impresion, reimprimir |

#### Lógica de negocio clave en servicios

| Servicio | Comportamiento relevante |
|---|---|
| **AuthService** | Login con bcrypt, JWT con permisos agregados (admin obtiene todos), logout incrementa token_version |
| **ProductosService** | CRUD soft delete, código auto-generado, BOM (producto_insumos), claves SAT CFDI 4.0 (`clave_prod_serv`/`clave_unidad`), plantilla/export/import Excel |
| **VentasService** | Folio auto (VEN-YYYYMMDD-NNNN), valida stock, decrementa inventario + kardex + impresiones + contador máquina + auto-crea OP si categoría=producción, reversión al cancelar |
| **OrdenesProduccionService** | Máquina de estados (pendiente→en_proceso→terminado→entregado + cancelado), consume insumos al iniciar, crea inventario al terminar, retorna insumos al cancelar |
| **CotizacionesService** | Convertir a venta = crea venta + decrementa inventario + registra impresiones + kardex |
| **MermasService** | Decrementa inventario (producto o insumo) + registra impresiones |
| **ComprasService** | Incrementa inventario de insumos + actualiza último precio de compra |
| **AbonosService** | Valida monto ≤ saldo_pendiente, actualiza estado_pago (pagada/parcial), reversión al eliminar |
| **CajaService** | Apertura crea corte_caja + snapshot máquinas, cierre con/sin contadores, reporte máquinas/categorías impresión, movimientos unifica ventas+gastos+abonos, fallback sin caja abierta |
| **NotificacionesService** | Genera alertas respetando configuración (activo/umbral) para stock bajo, ventas, cancelaciones |
| **ReportesService** | Dashboard (hoy + 30 días), ventas por día/método/sucursal, top productos/clientes, ganancias (ingresos - costos) |

### 2.5 Modelos Prisma (28 modelos)

| Modelo | Descripción | Relaciones clave |
|---|---|---|
| `roles` | Roles de usuario (admin, vendedor, operador) | → usuarios, rol_permisos |
| `sucursales` | Sucursales/filiales | → usuarios_sucursales, inventario |
| `usuarios` | Usuarios del sistema | → roles, usuarios_sucursales |
| `usuarios_sucursales` | Asignación usuario-sucursal | N:M usuarios ↔ sucursales |
| `categorias` | Categorías (venta/produccion/impresion) | → productos |
| `proveedores` | Proveedores | → compras_insumos |
| `productos` | Productos (catálogo). Campos CFDI: `clave_prod_serv` VarChar(20), `clave_unidad` VarChar(10) (nullable, opcionales) | → categorias, sucursales, maquinas, inventario, venta_detalle |
| `producto_precios` | Precios por volumen | → productos |
| `maquinas` | Máquinas de producción/impresión | → sucursales, impresiones, ordenes_produccion |
| `impresiones` | Registro de impresiones (ventas/mermas) | → maquinas, ventas, productos |
| `inventario` | Stock de productos por sucursal | → productos, sucursales |
| `clientes` | Clientes. Campos CFDI (receptor): `rfc` VarChar(39), `uso_cfdi` VarChar(3), `regimen_fiscal_receptor` VarChar(3), `domicilio_fiscal_cp` VarChar(5) (todos nullable) | → ventas |
| `ventas` | Ventas/ facturas | → sucursales, clientes, usuarios, cotizaciones |
| `venta_detalle` | Líneas de venta (producto + cant + dimensiones) | → ventas, productos |
| `mermas` | Mermas / desperdicios | → productos, insumos, sucursales |
| `kardex_movimientos` | Movimientos de inventario | → productos, sucursales, ventas |
| `insumos` | Insumos/materias primas (codigo @unique global, ancho_rollo Decimal(10,4), precio_compra Decimal(10,2), unidad_medida VarChar(20), proveedor_id?) | → producto_insumos, insumos_inventario |
| `compras_insumos` | Compras de insumos (cantidad Decimal(12,3)) | → sucursales, proveedores, insumos |
| `unidades_medida` | Unidades de medida (m2, ml, pieza, etc.) con flag `es_medida` | — |
| `gastos_categorias` | Categorías de gastos | → gastos |
| `gastos` | Gastos/ingresos/retiros de caja | → sucursales, usuarios, categorias |
| `insumos_inventario` | Stock de insumos por sucursal (cantidad+stock_minimo Decimal(12,3), @@unique[insumo_id+sucursal_id]) | → insumos, sucursales |
| `producto_insumos` | Lista de materiales (BOM) | N:M productos ↔ insumos |
| `configuracion` | Configuración del sistema (clave-valor) | — |
| `cotizaciones` | Cotizaciones/presupuestos | → sucursales, clientes, usuarios |
| `cotizacion_detalle` | Líneas de cotización | → cotizaciones, productos |
| `ventas_abonos` | Abonos / pagos parciales | → ventas, usuarios |
| `permisos` | Permisos del sistema (modulo + accion) | → rol_permisos |
| `rol_permisos` | Asignación permiso-rol | N:M roles ↔ permisos |
| `metodos_pago` | Métodos de pago | → ventas, ventas_abonos |
| `audit_log` | Bitácora de auditoría | → usuarios |
| `notificaciones_config` | Configuración de notificaciones | — |
| `ordenes_produccion` | Órdenes de producción | → sucursales, productos, maquinas, usuarios |
| `ordenes_produccion_historial` | Historial de cambios de estatus | → ordenes_produccion, usuarios |
| `cortes_caja` | Cortes / aperturas de caja | → sucursales, usuarios |
| `folio_counter` | Contador secuencial de folios por fecha | — |

---

## 3. Frontend — Mapa de Archivos

### 3.1 Infraestructura

| Archivo | Propósito |
|---|---|
| `src/main.tsx` | Punto de entrada, renderiza `<App />` |
| `src/App.tsx` | Router principal (BrowserRouter), proveedores de contexto |
| `src/routes/index.tsx` | Definición de rutas: públicas (/login, /ticket) y protegidas con Layout |
| `src/routes/ProtectedRoute.tsx` | Guard de autenticación + roles + permisos |
| `src/index.css` | Estilos Tailwind + variables CSS |

### 3.2 Stores (Zustand)

| Store | Persistencia | Estado |
|---|---|---|
| `authStore` | sessionStorage | tokens, usuario, login/refresh/logout |
| `configStore` | — | Configuración del sistema (IVA, moneda, logo) |
| `metodosPagoStore` | — | Métodos de pago con lookup indexado |
| `sucursalStore` | sessionStorage | Sucursal activa seleccionada |
| `themeStore` | localStorage | Tema oscuro/claro |

### 3.3 Hooks

| Hook | Retorno | Propósito |
|---|---|---|
| `useIsMobile()` | `boolean` | Detectar viewport < 768px |
| `useCentroImpresion()` | `{ esCentroImpresion }` | Determinar si la empresa es centro de impresión |
| `useEmpresaLogo()` | `{ src, isCustom }` | URL del logo de la empresa |
| `useIva()` | `{ activo, porcentaje, calcular(subtotal) }` | Configuración y cálculo de IVA |
| `useMetodosPago()` | `{ metodos, activos, isLoaded, getByNombre, getLabel, getIcon }` | Métodos de pago con íconos |
| `useMoney()` | `{ simbolo, codigo, decimales, format(value) }` | Formateo de moneda |
| `usePermisos()` | `{ permisos, isAdmin, hasPermiso, hasAnyPermiso, isModuloVisible }` | Verificación de permisos del usuario |
| `useReducedMotion()` | `boolean` | Preferencia de movimiento reducido (framer-motion) |

### 3.4 Módulos API (`src/api/`)

| Archivo | Funciones principales |
|---|---|
| `client.ts` | Instancia axios con `VITE_API_URL`, interceptor de Bearer token y 401 auto-logout |
| `auth.api.ts` | login, refresh, me, logout |
| `productos.api.ts` | getAll, getById, getInsumos, create (multipart), update (multipart), remove, previewImport, confirmImport, descargarPlantilla, exportCatalog |
| `ventas.api.ts` | getAll, getById, getPublicById, create, cancel, validarInsumos |
| `clientes.api.ts` | getAll, getById, getHistorial, create, update, remove |
| `insumos.api.ts` | getAll, getById, create, update, remove, getInventarioBySucursal, ajustarStock + descargarPlantilla, exportCatalog, previewImport, confirmImport (pendiente) |
| `categorias.api.ts` | getAll (filtro tipo), create, update, remove |
| `usuarios.api.ts` | getAll, getById, create, update, remove, asignarSucursal, removerSucursal |
| `sucursales.api.ts` | getAll, getById, create, update, remove |
| `proveedores.api.ts` | getAll, getById, create, update, remove |
| `unidadesMedida.api.ts` | getAll, create, update, remove + calcularPrecioItem |
| `gastos.api.ts` | Categorías (CRUD) + Gastos (CRUD) |
| `cotizaciones.api.ts` | getAll, getById, create, update, convertirAVenta, cancelar |
| `mermas.api.ts` | getAll, getById, create, update, remove |
| `maquinas.api.ts` | getAll, getById, getStats, getReporteCorte, create, update, remove |
| `ordenesProduccion.api.ts` | getAll, getById, getEstadisticas, create, update, cambiarEstatus, remove |
| `caja.api.ts` | getEstado, aperturar, realizarCorte, getMovimientos, getCortes, getCorteById, getCorteReimprimir, getCorteReporteMaquinas, getCorteReporteCategoriasImpresion, registrarIngreso, registrarGasto, registrarRetiro |
| `abonos.api.ts` | getByVenta, registrar, remove |
| `auditLog.api.ts` | getAll, getById, getStats |
| `compras.api.ts` | getAll, getById, create, createBatch, remove |
| `configuracion.api.ts` | getAll, getByGrupo, updateBatch, uploadLogo |
| `inventario.api.ts` | getBySucursal, ajustar, getKardex |
| `metodosPago.api.ts` | getAll, getById, create, update, remove, toggleActivo |
| `notificaciones.api.ts` | getAllConfig, getConfigByTipo, updateConfig, getResumen |
| `preciosProducto.api.ts` | getByProducto, create, update, remove + calcularPrecioPorVolumen |
| `respaldo.api.ts` | generate, list, remove, getStats, getDownloadUrl |
| `roles.api.ts` | getAll, getById, create, update, remove, getPermisos |

### 3.5 Páginas y Rutas

| Página | Ruta | Acceso | Propósito |
|---|---|---|---|
| **LoginPage** | `/login` | Público | Login con email/contraseña, carga config al ingresar |
| **DashboardPage** | `/dashboard` | Autenticado | KPIs, gráficas (recharts), ventas recientes, alertas de stock, acciones rápidas |
| **ProductosPage** | `/productos` | Autenticado | CRUD productos, importar/exportar Excel, precios por volumen, asignación de insumos (BOM) |
| **NuevaVentaPage** | `/ventas/nueva` | Autenticado | POS: catálogo, carrito, búsqueda cliente, validación stock, IVA, ticket, cotización→venta |
| **VentasPage** | `/ventas` | Autenticado | Lista de ventas, expandir detalle, cancelar, QR ticket, abonos, imprimir ticket |
| **TicketPublicoPage** | `/ticket` | Público | Ticket público vía QR (sin auth), renderiza datos seguros de la venta |
| **ClientesPage** | `/clientes` | Autenticado | CRUD clientes, búsqueda, historial de compras en modal |
| **InsumosPage** | `/insumos` | Autenticado | CRUD insumos, ajuste de stock, registro de compras |
| **InventarioPage** | — (redirige a /insumos) | Autenticado | Stock por sucursal, ajuste, kardex |
| **UsuariosPage** | `/usuarios` | Admin | CRUD usuarios, asignación de roles y sucursales |
| **CategoriasPage** | `/categorias` | Admin | CRUD categorías, filtro por tipo |
| **SucursalesPage** | `/sucursales` | Admin | CRUD sucursales, selector con indicador de activa |
| **ProveedoresPage** | `/proveedores` | Admin | CRUD proveedores con búsqueda |
| **UnidadesMedidaPage** | `/unidades-medida` | Admin | CRUD unidades de medida (estándar y área) |
| **GastosPage** | `/gastos` | Autenticado | CRUD gastos/ingresos/retiros, tabla filtrable |
| **CategoriasGastosPage** | `/categorias-gastos` | Admin | CRUD categorías de gastos |
| **CotizacionesPage** | `/cotizaciones` | Autenticado | CRUD cotizaciones, convertir a venta, cancelar, descargar PDF |
| **MermasPage** | `/mermas` | Autenticado | CRUD mermas (producto/insumo), vinculado a máquinas |
| **ProduccionPage** | `/produccion` | Autenticado | Órdenes de producción, cambio de estatus, tabs por estado, expandir filas |
| **MaquinasPage** | `/maquinas` | Autenticado | CRUD máquinas, stats de uso, contador, reporte de corte |
| **ConfiguracionPage** | `/configuracion` | Admin | Tabs: General (IVA, moneda, logo), Roles, Métodos de Pago, Respaldos, Notificaciones, Auditoría |
| **CajaPage** | `/caja` | Autenticado | Apertura/cierre de caja, movimientos, ingresos/gastos/retiros, resumen, ticket de corte |

### 3.6 Componentes Compartidos

| Carpeta | Componentes | Propósito |
|---|---|---|
| `components/layout/` | Layout, Sidebar, Header | Shell principal: sidebar colapsable, header con sucursal activa y usuario |
| `components/ui/` | 20 componentes (badge, button, card, dialog, select, table, tabs, etc.) | Primitivos UI inspirados en shadcn |
| `components/forms/` | AbonoForm, AbonosList, AbonosModal, AbonosResumen | Gestión de abonos/pagos parciales |
| | AgregarComprasModal, CompraHeaderFields, CompraInsumoModal, CompraItemForm, ComprasTable | Formularios de compras de insumos |
| | CotizacionPdf, CotizacionSelectorModal | PDF y selector de cotizaciones |
| | MontoRecibidoInput | Input de monto recibido con cálculo de cambio |
| | StockInsuficienteModal | Modal de advertencia de stock insuficiente |
| Standalone | MotionProvider | Lazy loading de animaciones framer-motion |
| | RequirePermission | Wrapper para renderizado condicional por permisos |
| | ThemeToggle | Botón de cambio de tema |

---

## 4. Mapa de Relaciones Frontend ↔ Backend

Cada página del frontend se conecta con módulos específicos del backend. Esta tabla mapea esa relación:

| Página Frontend | API Modules que consume | Backend Routes involucradas |
|---|---|---|
| **LoginPage** | auth.api | `POST /auth/login`, `GET /auth/me` |
| **DashboardPage** | reportes.api, notificaciones.api, ventas.api | `GET /reportes/dashboard`, `GET /notificaciones/resumen`, `GET /notificaciones/alertas`, `GET /ventas` |
| **ProductosPage** | productos.api, categorias.api, insumos.api, preciosProducto.api, maquinas.api | CRUD productos + importar/exportar + precios por volumen + insumos BOM |
| **NuevaVentaPage** | ventas.api, productos.api, clientes.api, cotizaciones.api | `POST /ventas`, `GET /productos`, `POST /ventas/validar-insumos` |
| **VentasPage** | ventas.api, abonos.api | CRUD ventas + cancelar + abonos |
| **TicketPublicoPage** | ventas.api | `GET /ventas/public/:id` |
| **ClientesPage** | clientes.api | CRUD clientes + historial |
| **InsumosPage** | insumos.api, compras.api | CRUD insumos + ajuste stock + compras |
| **InventarioPage** | inventario.api, insumos.api | Stock por sucursal + kardex + ajuste |
| **UsuariosPage** | usuarios.api, roles.api, sucursales.api | CRUD usuarios + asignar sucursales/roles |
| **CategoriasPage** | categorias.api | CRUD categorías |
| **SucursalesPage** | sucursales.api | CRUD sucursales |
| **ProveedoresPage** | proveedores.api | CRUD proveedores |
| **UnidadesMedidaPage** | unidadesMedida.api | CRUD unidades de medida |
| **GastosPage** | gastos.api | CRUD gastos + categorías |
| **CategoriasGastosPage** | gastos.api | CRUD categorías de gastos |
| **CotizacionesPage** | cotizaciones.api, productos.api, clientes.api | CRUD cotizaciones + convertir a venta |
| **MermasPage** | mermas.api, productos.api, insumos.api, maquinas.api | CRUD mermas |
| **ProduccionPage** | ordenesProduccion.api, productos.api, maquinas.api, insumos.api | CRUD órdenes + cambio estatus |
| **MaquinasPage** | maquinas.api | CRUD máquinas + stats + reporte |
| **ConfiguracionPage** | configuracion.api, roles.api, metodosPago.api, respaldo.api, notificaciones.api, auditLog.api | Config, roles, métodos pago, backups, notificaciones, auditoría |
| **CajaPage** | caja.api, gastos.api, ventas.api, abonos.api | Apertura/cierre, movimientos, ingresos/gastos/retiros |

---

## 5. Tabla de Módulos

| Módulo | Backend (Routes) | Frontend (Pages) | Modelos Prisma |
|---|---|---|---|
| **Autenticación** | auth.routes.ts | LoginPage | usuarios |
| **Dashboard** | reportes.routes.ts (dashboard) | DashboardPage | — (agregaciones) |
| **Productos / Catálogo** | productos.routes.ts, preciosProducto.routes.ts, categorias.routes.ts | ProductosPage, CategoriasPage | productos, producto_precios, categorias, producto_insumos |
| **Ventas (POS)** | ventas.routes.ts, abonos.routes.ts | NuevaVentaPage, VentasPage, TicketPublicoPage | ventas, venta_detalle, ventas_abonos, impresiones |
| **Clientes** | clientes.routes.ts | ClientesPage | clientes |
| **Inventario** | inventario.routes.ts | InventarioPage | inventario, kardex_movimientos |
| **Insumos / Materias Primas** | insumos.routes.ts, compras.routes.ts, unidadesMedida.routes.ts | InsumosPage, ComprasPage (embedded), UnidadesMedidaPage | insumos, insumos_inventario, compras_insumos, unidades_medida |
| **Compras** | compras.routes.ts | InsumosPage (modal compras) | compras_insumos |
| **Proveedores** | proveedores.routes.ts | ProveedoresPage | proveedores |
| **Producción** | ordenesProduccion.routes.ts | ProduccionPage | ordenes_produccion, ordenes_produccion_historial |
| **Máquinas** | maquinas.routes.ts | MaquinasPage | maquinas, impresiones |
| **Mermas** | mermas.routes.ts | MermasPage | mermas, impresiones |
| **Cotizaciones** | cotizaciones.routes.ts | CotizacionesPage | cotizaciones, cotizacion_detalle |
| **Caja** | caja.routes.ts | CajaPage | cortes_caja, gastos |
| **Gastos** | gastos.routes.ts | GastosPage, CategoriasGastosPage | gastos, gastos_categorias |
| **Usuarios / Roles** | usuarios.routes.ts, roles.routes.ts | UsuariosPage | usuarios, roles, permisos, rol_permisos, usuarios_sucursales |
| **Sucursales** | sucursales.routes.ts | SucursalesPage | sucursales |
| **Configuración** | configuracion.routes.ts, metodosPago.routes.ts | ConfiguracionPage | configuracion, metodos_pago |
| **Respaldo / Backup** | respaldo.routes.ts | ConfiguracionPage (tab) | — (mysqldump) |
| **Notificaciones / Alertas** | notificaciones.routes.ts | ConfiguracionPage (tab) | notificaciones_config |
| **Auditoría** | auditLog.routes.ts | ConfiguracionPage (tab) | audit_log |
| **Reportes** | reportes.routes.ts | DashboardPage (parcial) | — (agregaciones) |

---

## 6. Flujos Transversales Críticos

### 6.1 Ciclo de Venta

```
Cotización → Convertir a Venta → [Stock Validation] → Decrementar Inventario
→ Registrar Kardex → Registrar Impresiones → Incrementar Contador Máquina
→ [Si categoría=producción] Auto-crear Orden de Producción
→ [Si saldo pendiente] Abonos → Pagado completo
```

### 6.2 Ciclo de Producción

```
OP pendiente → En Proceso (consume insumos automáticamente)
→ Terminado (crea inventario productos automáticamente)
→ Entregado
→ Cancelado (retorna insumos automáticamente)
```

### 6.3 Ciclo de Caja

```
Apertura (monto_inicial) → Ingresos (ventas) + Gastos/Retiros
→ Corte (calcula esperado vs real, registra diferencia)
```

**Apertura** — `POST /caja/apertura`
- Crea `cortes_caja` con `monto_inicial`, `estado = 'abierta'`
- Si `somos_centro_impresion = true`: crea snapshot automático de máquinas activas en `cortes_maquinas` (cada máquina con `contador_inicial = maquina.contador_total`)

**Listado de movimientos** — `GET /caja/movimientos`
- `fechaDesde` se determina así:
  - Si viene `corteId` → desde `corte.fecha_apertura` hasta `corte.fecha_cierre`
  - Si hay caja abierta → desde `corte.fecha_apertura`
  - **Sin caja abierta** (fix sesión): desde `max(ultimoCorteCerrado.fecha_cierre, ultimaVenta.created_at, ultimoGasto.fecha, ultimoAbono.fecha)`. Sin historial → últimas 24h.
- Devuelve ventas, gastos y abonos del rango, más `resumen` con totales por método de pago

**Cierre de caja** — `POST /caja/corte`
- `montoEsperado = monto_inicial + ventasEfectivo + ingresos + abonos - gastos - retiros`
- Si `somos_centro_impresion`: requiere `maquinasContadores[]` con `contadorFinal >= maquina.contador_total` (valida en backend; `ValidationError` si falla). Persiste en `cortes_maquinas_detalle` y actualiza `maquinas.contador_total`
- Si no es centro de impresión: cierre directo sin contadores

**Reporte de máquinas** (centro de impresión) — `GET /caja/cortes/:id/reporte-maquinas`
- Si existe `cortes_maquinas`: devuelve snapshot persistido
- Si no existe: fallback calcula desde contadores actuales y grupo de impresiones del período

**Reporte de categorías de impresión** — `GET /caja/cortes/:id/reporte-categorias-impresion`
- Solo categorías con `tipo = 'impresion'`
- `conteo_inicial` desde snapshot de máquinas; `conteo_final = conteo_inicial + impresiones del período`

**Reimpresión** — `GET /caja/cortes/:id/reimprimir`
- `CortePdfBuilder.ts` genera: ticket 80mm (`buildTicketHtml` + `imprimirTicket`) y PDF carta (`descargarPdf`)
- Incluye secciones de máquinas y categorías de impresión cuando aplican

**Nota**: `metodo_pago` se filtra con lowercase (`'efectivo'`) en el backend. El frontend muestra modal informativo cuando hay movimientos sin caja abierta (`!cajaActual && !corteSeleccionado && movimientos.length > 0`).`

### 6.4 Ciclo de Compra de Insumos

```
Crear Compra (single/batch) → Incrementa inventario insumos
→ Actualiza último precio de compra
```

### 6.5 Patrón Importar/Descargar Catálogo (Productos / Insumos)

Este patrón se replica idéntico entre módulos que lo soportan. Actualmente **Productos** lo tiene completo; **Insumos** está pendiente de implementación.

**Endpoints** (4 por módulo):
- `GET /{modulo}/plantilla` — Descarga ExcelJS con cabeceras + hoja auxiliar "Unidades"
- `GET /{modulo}/exportar` — Descarga XLSX con todos los registros activos
- `POST /{modulo}/importar/preview` — Sube archivo, retorna `{token, total, nuevos, duplicados[], errores[], warnings[]}`
- `POST /{modulo}/importar/confirmar` — Body `{token, decisiones}`, persiste cambios

**Flujo backend**:

```
Subir XLSX → previewImport() lee con XLSX.readFile
  → filtra filas vacías
  → valida cada fila (campos required, FK existentes, tipos)
  → detecta duplicados por clave natural (codigo [+ sucursal_id si aplica])
  → filtra duplicados IDÉNTICOS (omite silenciosamente, sin contar)
  → para duplicados con cambios: agrega a duplicados[] con campo `cambios: string[]`
  → guarda rows en tempStore (TTL 30 min) con token UUID

confirmImport() → lee tempStore por token
  → para cada fila:
      - sin error → si duplicado: actualiza campos cambiados; si nuevo: crea
      - con error → registra y omite
  → retorna {importados, actualizados, omitidos, errores[]}
```

**Campos de `duplicados[]`**:
```ts
{ fila, codigo, nombreExistente, nombreNuevo, cambios: string[] }
```
`cambios[]` lista los nombres de campo que difieren (ej: `['precio_venta', 'precios_volumen']`). Comparación normalizada (Decimal a Number, sort estable para arrays).

**Frontend**:

```
ProductosPage/InsumosPage → 3 botones admin:
  - "Descargar plantilla" → blob GET → guarda .xlsx
  - "Exportar catálogo"   → blob GET → guarda .xlsx
  - "Importar Excel"      → abre ImportarXxxModal

ImportarXxxModal (orquestador):
  idle → UploadStep (drag/drop + select archivo + sucursal si aplica)
  previewing → LoadingView
  preview → ImportPreviewView (stats + tabla duplicados con badges `cambios[]`)
  confirming → LoadingView
  done → ImportDoneView (totales finales)
```

**Componentes del patrón** (clonar/adaptar):
- `pages/{modulo}/components/ImportarXxxModal.tsx` — orquestador con state machine de 5 pasos
- `pages/{modulo}/components/ImportXxxUploadStep.tsx` — drag/drop, selector de sucursal opcional
- `pages/{modulo}/components/ImportXxxPreviewView.tsx` — stats + tabla con badges
- `pages/{modulo}/components/ImportXxxDoneView.tsx` — resumen final

**Diferencias Productos vs Insumos**:

| Aspecto | Productos | Insumos (pendiente) |
|---|---|---|
| Precios por volumen | ✅ 3 niveles | ❌ |
| `categoria_id` | ✅ | ❌ |
| `ancho_rollo` | ❌ | ✅ Decimal(10,4) |
| `imagen_url` | ✅ | ❌ |
| Claves SAT (CFDI 4.0) | ✅ `clave_prod_serv`, `clave_unidad` | ❌ |
| Multi-sucursal | Catálogo por sucursal | Catálogo global + stock por sucursal |
| Código único | `@@unique([codigo, sucursal_id])` | `@unique` global |
| Stock al importar | Crear inventario inicial con `cantidadInicial` + `stockMinimo` | NO crear stock (se hace via CompraInsumoModal después) |
| Detección duplicados | `(codigo, sucursal_id)` | `codigo` global |

**Permisos RBAC**: importar/descargar/exportar requieren rol `ADMIN` (igual en ambos módulos).

**Reutilizable**: `utils/tempStore.ts` (setTemp/getTemp/deleteTemp TTL 30min) es compartido entre módulos. ExcelJS ya está instalado en `productos.service.ts`.

**Archivos de referencia (Productos, ya implementado)**:
- Backend: `plprint-api/src/services/productos.service.ts` (`generateTemplate`, `exportCatalog`, `previewImport`, `confirmImport`)
- Backend: `plprint-api/src/routes/productos.routes.ts` (4 endpoints + multer)
- Frontend: `plprint-web/src/pages/productos/components/ImportarProductosModal.tsx` (+ UploadStep, ImportPreviewView, ImportDoneView)

### 6.6 Facturación CFDI 4.0 (Finkok) — datos capturados, timbrado pendiente

Captura de datos del emisor y receptor lista. Timbrado vía API Finkok pendiente de implementar.

**Emisor** (tabla `configuracion`, grupo `facturacion`):
- Claves: `razon_social_emisor`, `regimen_fiscal_emisor` (select SAT c_RegimenFiscal), `lugar_expedicion_cp`, `no_certificado`, `password_llave`, `certificado_cer_path`, `llave_key_path`. RFC emisor reusa `empresa_rfc` (grupo `empresa`).
- UI: `GeneralTab.tsx` grupo "Facturación (CFDI)" + `ConfigurationField.tsx` (select régimen + inputs rutas CSD).
- CSD (`.cer`/`.key`): upload vía UI implementado (endpoint `POST /configuracion/csd` con multer, patrón `uploadLogo`). Guarda en `uploads/csd/<timestamp>-<random>.<ext>`, ruta persistida en `certificado_cer_path` / `llave_key_path` (grupo `facturacion`). UI: `GeneralTab.tsx` Card "Certificados de Sello Digital (CSD)" con 2 inputs `.cer`/`.key`.

**Receptor** (campos en tabla `clientes`, nullable):
- `rfc` VarChar(39), `uso_cfdi` VarChar(3) (select SAT c_UsoCFDI), `regimen_fiscal_receptor` VarChar(3) (select SAT), `domicilio_fiscal_cp` VarChar(5).
- UI: `ClienteFormModal.tsx` sección "Datos de facturación (CFDI 4.0)" con 2 selects + 2 inputs.
- Backend: `clientes.service.ts` create/update dto + `clientes.routes.ts` zod schema.

**Conceptos** (tabla `productos`): `clave_prod_serv` VarChar(20), `clave_unidad` VarChar(10) ya existen (ver sección CFDI/SAT de AGENTS.md). Pendiente `objeto_imp` VarChar(2) default '02' y columnas en Excel de exportar/importar.

**Faltante para timbrar** (no implementado):
- Endpoint `POST /ventas/:id/facturar` que genere XML CFDI, selle, y consuma Finkok (`FINKOK_USERNAME`/`FINKOK_PASSWORD`/`FINKOK_URL` en `.env`).
- Guardar UUID + XML timbrado (sugerencia: tabla `ventas` columnas `uuid_timbre`, `xml_cfdi_path`, `estado_factura`).
- Catálogos SAT completos (hoy hardcodeados en selects).

---

## 7. Convenciones del Proyecto

### Backend
- **Arquitectura estricta:** Routes → Controllers → Services → Prisma → MySQL
- **Routes:** Solo registran endpoints, no contienen lógica
- **Controllers:** Reciben request/response, delegan a services
- **Services:** Toda la lógica de negocio, solo interactúan con Prisma
- **Validación:** Zod en middleware, reemplaza body/params/query con datos parseados
- **Respuestas:** Formato uniforme via `sendSuccess`/`sendCreated`/`sendNoContent`
- **Errores:** Clases personalizadas `AppError`, manejadas centralizadamente
- **Soft delete:** Todos los CRUD críticos (productos, clientes, sucursales, etc.) usan campo `activo`
- **Auditoría:** Middleware automático para operaciones exitosas

### Frontend
- **Arquitectura:** Pages → Components → API → Backend
- **Llamadas HTTP:** Solo dentro de `src/api/`, nunca en componentes
- **Estado global:** Zustand para auth, config, sucursal activa, métodos de pago, tema
- **Ruteo:** React Router v6 con lazy loading y ProtectedRoute
- **Formularios:** react-hook-form + zod
- **Estilos:** TailwindCSS + flowbite + shadcn/ui primitives
- **Permisos:** Componente `<RequirePermission>` y hook `usePermisos`
- **Tema:** Soporte dark/light mode con persistencia en localStorage

---

## 8. Roles y Permisos

| Rol | ID | Acceso |
|---|---|---|
| **Admin** | 1 | Todos los módulos y acciones (92 permisos) |
| **Vendedor** | 2 | Dashboard, productos, insumos, ventas, clientes, reportes, producción, caja |
| **Operador** | 3 | Vista de módulos + cambiar_estatus en producción |

Los 92 permisos cubren todos los módulos del sistema con acciones: `ver`, `crear`, `editar`, `eliminar`, y acciones específicas como `cambiar_estatus`, `cancelar`, `convertir`, `importar`, `exportar`, `ajustar_stock`, `realizar_corte`, etc.

---

> **Nota:** Este documento describe la arquitectura del proyecto PLPrint ERP. Debe actualizarse cuando se agreguen nuevos módulos, rutas, o cambie la estructura de carpetas tanto en backend como en frontend.