Actúa como un arquitecto de software senior especializado en desarrollo de aplicaciones web escalables.

Necesito que diseñes y desarrolles una aplicación web completa para gestión de inventario y ventas (tipo POS + inventario), enfocada en rendimiento, escalabilidad y seguridad.

### 🎯 OBJETIVO
Construir un sistema moderno, eficiente y escalable para administrar productos, inventario, ventas, clientes y usuarios.

---

## 🧩 FUNCIONALIDADES PRINCIPALES

### 📦 Productos
[x] Crear productos con:
  - Imagen del producto
  - Nombre
  - Precio de venta
  - Precio de compra
  - Categoría
  - Descripción
  - Cantidad en inventario
[x] Editar productos
[x] Eliminar productos (soft delete recomendado)
[x] Listar productos con paginación, búsqueda y filtros

## ⚠️ INVENTARIO POR SUCURSAL

El inventario NO debe estar directamente en la tabla de productos.

Debe existir una entidad separada, por ejemplo:

[x] Inventario:
  - product_id
  - sucursal_id
  - cantidad

Esto permite:
[x] Manejar stock independiente por sucursal
[x] Escalar correctamente el sistema

### 💰 Ventas
[x] Crear ventas rápidas (cliente por defecto: "Público General")
[x] Permitir seleccionar cliente registrado
[x] Agregar múltiples productos a una venta
[x] Cálculo automático de totales
[x] Reducción automática de inventario
[x] Historial de ventas
[x] Generación de ticket o factura (PDF opcional)

### 👥 Clientes
[x] Crear, editar y eliminar clientes
[x] Datos básicos: nombre, teléfono, correo, dirección
[x] Historial de compras por cliente

### 👤 Usuarios
[x] Roles:
  - Admin
  - Vendedor
  - Operador
[x] CRUD de usuarios

### 🔐 Autenticación y Seguridad
[] Sistema de login seguro
[x] Hash de contraseñas (bcrypt o similar)
[x] JWT o sesiones seguras
[] Protección contra:
  - SQL Injection
  - XSS
  - CSRF
[x] Rate limiting
[x] Validación de datos en backend y frontend

---

## ⚙️ REQUERIMIENTOS TÉCNICOS

### 🖥️ Frontend
- Framework: React + Vite
- Lenguaje: TypeScript
- UI moderna y responsiva
- Compatibilidad con pantallas de dispositivos móviles como smartphone o tablets
- Manejo de estado (Zustand, Redux o Context API)
- Buen manejo de formularios (React Hook Form recomendado)
- **Despliegue: Netlify**
  - Build command: `vite build`
  - Publish directory: `dist`
  - Configurar `_redirects` o `netlify.toml` para SPA (redirigir todo a `index.html`)
  - Variables de entorno: `VITE_API_URL` apuntando al backend en el VPS
  - CORS debe estar habilitado en el backend para el dominio de Netlify

### 🧠 Backend
- Node.js + Express o NestJS
- TypeScript obligatorio
- API REST bien estructurada (o GraphQL opcional)
- **Despliegue: VPS HostGator (Linux)**
  - Usar PM2 como process manager (`pm2 start dist/index.js --name plprint-api`)
  - Configurar Nginx como reverse proxy (puerto 80/443 → puerto interno del API)
  - Habilitar HTTPS con Let's Encrypt (Certbot)
  - Firewall: abrir solo puertos 22, 80, 443
  - Variables de entorno en archivo `.env` (nunca subir al repositorio)
  - Ejecutar la app como usuario sin privilegios root

### 🗄️ Base de Datos
- **MySQL 8.0+** (instalado en el mismo VPS HostGator)
- ORM: **Prisma** (`provider = "mysql"` en `schema.prisma`)
- Nombre de base de datos: `plprint` — charset `utf8mb4`, collation `utf8mb4_unicode_ci`
- MySQL escuchando solo en `localhost` (no expuesto a internet)
- Backups automáticos con `mysqldump` vía cron job
  ```
  mysqldump -u root -p plprint > /backups/plprint_$(date +%F).sql
  ```

### ☁️ Otros
- Arquitectura basada en MVC o Clean Architecture
- Separación clara entre capas (controllers, services, repositories)
- Manejo de errores centralizado
- Logs del sistema (Winston o Pino recomendado)

### 🚢 Despliegue — Resumen

| Capa       | Plataforma              | Notas                                      |
|------------|-------------------------|--------------------------------------------|
| Frontend   | Netlify                 | Build automático desde rama `main`         |
| Backend    | VPS HostGator (Linux)   | Node.js + PM2 + Nginx reverse proxy + HTTPS|
| Base datos | MySQL 8.0+ en el VPS    | Solo accesible desde localhost             |
| Imágenes   | Carpeta pública del VPS o servicio externo (Cloudinary recomendado) |  |

> ⚠️ El frontend en Netlify y el backend en el VPS son dominios distintos. Configurar correctamente CORS en el backend: permitir el dominio de Netlify en producción y `localhost` solo en desarrollo.

---

## 🚀 ESCALABILIDAD Y PERFORMANCE

- Paginación en todas las consultas grandes
- Indexación en base de datos
- Lazy loading en frontend
- Caching (Redis opcional)
- Optimización de consultas SQL
- Preparado para miles de productos sin degradación de rendimiento

---

## 🧪 TESTING Y CALIDAD

- Tests unitarios y de integración
- Linting y formateo (ESLint + Prettier)
- CI/CD básico
  - Frontend: Netlify CI/CD integrado (deploy automático en push a `main`)
  - Backend: GitHub Actions para buildear y desplegar vía SSH al VPS

---

## 📁 ENTREGABLES

Quiero que generes:

1. Arquitectura completa del sistema
2. Modelo de base de datos (diagramas o SQL)
3. Estructura de carpetas (frontend y backend)
4. Código base inicial (boilerplate)
5. Ejemplo de endpoints clave
6. Ejemplo de componentes frontend
7. Buenas prácticas implementadas

---

## 💡 SUGERENCIAS EXTRA (IMPORTANTE)

Además, sugiere funcionalidades adicionales para hacer el sistema más completo, como:

[x] Ventana de ajustes del sistema, donde se agregaran funciones como:
  - cambiar logo de la empresa
  - aplicar algun tipo de iva al costo de los productos
  - check para aplicar siempre ese iva o no
  - modificar informacion de los tickets, logo que saldra en los tickets, mensaje, formato de fecha y hora
[x] Control de permisos basado en roles (RBAC)
  - ventana para crear o modificar roles existentes
  - asignar permisos y modulos a los que tendra ese rol
[x] Control de acceso a los modulos del sistema:
  - dependiendo del rol asignar que modulos del sistema tendra acceso

Para el IVA, como quieres manejarlo?
IVA global unico
Para el RBAC, que nivel de granularidad quieres?
quiero el control de acceso a modulos completos con acciones basicas, pero esto solo para usuarios admin y a usuarios a los que se les asigne esta opcion
Que otras opciones te gustaria incluir en configuracion?
Datos de la empresa, Formato de moneda, Tipos de pago personalizados, Reportes y exportacion, Respaldo de datos, Notificaciones, Bitacora/Audit log

---

## ⚠️ RESTRICCIONES

- Código limpio, mantenible y escalable
- Evitar malas prácticas
- Documentar decisiones técnicas
- Pensar como sistema en producción real

## 📈 EVOLUCIÓN DEL SISTEMA

Diseña el sistema considerando tres niveles:

### Fase 1 (MVP obligatorio)
Implementar completamente:
- Productos
- Inventario (con historial de movimientos tipo kardex)
- Ventas
- Clientes
- Usuarios y roles
- Autenticación segura

### Fase 2 (preparado en arquitectura)
Dejar preparado para integrar fácilmente:
- Compras a proveedores
- Reportes
- Dashboard
- Alertas de inventario

### Fase 3 (escalabilidad futura)
Diseñar de forma que permita agregar:
- Multi-sucursal
- Auditoría avanzada
- Sistema de permisos granular

## 🏢 SOPORTE MULTI-SUCURSAL (OBLIGATORIO)

El sistema debe soportar múltiples sucursales desde el inicio (multi-tenant ligero por sucursal).

analizar este punto, quiero que con el mismo sistema diferentes empresas puedan acceder a el y tener multi-sucurzal, la idea que se me ocurre es crear una base de datos para cada empresa y de esa manera cada empresa tiene su informacion, modificar el login de del sistema para pedir el nombre de la empresa (a que base de datos accedera) y el login de esa base de datos 

### Requerimientos:

[x] Poder crear, editar y eliminar sucursales
[x] Cada sucursal debe tener:
  - Nombre
  - Dirección
  - Teléfono (opcional)
  - Estado (activa/inactiva)

### Relación con el sistema:

- Los productos pueden ser:
  - Globales (catálogo general)
  - Pero el inventario debe ser por sucursal ⚠️ (esto es clave)

- El inventario debe manejarse por sucursal:
  - Cantidad por producto por sucursal
  - Kardex independiente por sucursal

- Las ventas deben estar asociadas a una sucursal

- Los usuarios deben pertenecer a una o varias sucursales:
  - Un usuario puede:
    - Trabajar en una sola sucursal
    - O tener acceso a múltiples (ej: admin)

- Control de acceso:
  - Un usuario solo puede ver y operar datos de sus sucursales asignadas (excepto admin global)

### Consideraciones técnicas:

- Todas las entidades clave deben tener relación con sucursal:
  - inventario
  - ventas
  - movimientos (kardex)
  - usuarios_sucursales (tabla intermedia recomendada)

- Evitar duplicar productos por sucursal
- Usar claves foráneas e índices para rendimiento

- Diseñar para escalabilidad (muchas sucursales y alto volumen de datos)

## 🧠 CONSIDERACIONES DE DISEÑO

- El sistema NO debe ser rígido
- Debe permitir crecimiento horizontal (más sucursales)
- Debe evitar duplicidad de datos
- Debe optimizar consultas por sucursal (uso de índices)

[x] Reportes de ventas (diarios, mensuales)
[x] Exportación a Excel/PDF
[x] Dashboard con métricas
[x] Descuentos y promociones



## MEJORAS

[] Quiero agregar los siguientes modulos:

  1. [x] categoria de gastos, seccion para dar de alta lista de gastos y registrar estos, restandolos a los ingresos totales del dia en caso de tener gastos ese mismo dia
  2. [x] Control de proveedores, seccion para dar de alta lista de proveedoress
  3. unidades de medida

  4. [x] cotizaciones: este modulo permitira que cuando se este realizando una venta se pueda guardar esta como
      una cotizacion en caso de que no se quiera realizar la compra por parte del cliente, permitiendo 
      guardarla y exportarla como PDF, al guardarla se visualizara en la seccion de cotizaciones, 
      dentro de la vista de ventas en la parte superior derecha se moestrar aun boton "Venta desde Cotizacion"
      al dar click mostrara una lista de las cotizaciones donde se podra seleccionar una y automaticamente se pondran los productos listos para la venta (la busqueda de cotizaciones tiene filtros de busqueda, por nombre del cliente, por fecha, por usuario vendedor que ralizo la cotizacion "eso solo lo ve el admin", y por folio de cotizacion o ticket)
  5. [x] boton mermas con dos subopciones "mermas productos", "mermas insumos", donde cada una tendra la vista donde estara una tabla donde se visualizara la lista de todas las mermas dadas de alta, con botones de "agregar" agregar merma, "exportar" exportar excel del listado de las mermas echas, y filtro de fechas inicio - fin este sirve para buscar mermas en ese radio de fechas y para exportar los datos en el excel
  6. [] Maquinas, poder agregar mi maquina de impresion, donde se dara de alta el nombre de la impresora, y tener un contador de las impresiones realizadas del dia a dia con esa impresora o impresoras. dame una sugerencia de como podriamos enlazar los procutos con categoria "Impresion" a la impresora y poder hacer el conteo de las impresiones.

  tambien tener en cuenta las mermas, cuando se registre una venta poder dar de alta mermas desde ahi ya que puede que por alguna razon salgan mal las impresiones, obvio se tendria que aun asi registrar esa impresion al contador de la impresora

  7. reportes, donde se podra obtener los reportes de: ventas vs ingresos, cuentas por cobrar, gastos

  8. [x] produccion, donde se podran tener el proceso de creacion de un producto, como productos que tienen un proceso de maquila o productos que tienen varios pasos de ralizacion. tendra las opciones de pasos:
  pendientes, en diseño, en produccion, acabados, terminados y entregados. 
  Los productos que entran a esta seccion son los que tengan la categoria de produccion.
  entre cada paso se pueden agregar indicaciones, una indicacion para cada paso.
  cuando entra un producto a produccion, entra como estado pendiente, despues de revisarlo el usuario podra agregar los comentarios y despues cuando vea correcto pasarlo a estado de diseño, despues de eso el usuario checaria el diseño o indicaciones sobre el diseño o indicaciones que tenga el producto lo puede pasar a estado Produccion, despues de checar el usuario que el producto salio y esta correcto al salir del produccion lo pasa a estado de Acabados, al finalizar el usuario los acabados podra pasarlo a estado Terminado, y para finalizar pasarlo a estado Entregado cuando se le entregue al cliente.

  9. Caja: dentro de caja, se tendra todo lo de poder hacer un corte de caja (investigar los requerimientos para poder hacer un corte de caja de una manera sencilla en el sistema pero a la misma vez completa), visualizar en una tabla el historial de ventas realizadas durante todo el dia con fecha, usuario que realizo la venta, si fue ingreso o descuento de ingresos, total pagado, metodo de pago con el que se realizo, sucursal donde se realizo esta venta o gasto. botones que se mostraran en la parte superior derecha: Realizar corte, Reimprimir corte, registrar ingreso, registrar gasto, registrar retiro.

  2. [x] Ingresos/Gastos, donde podremos ver un historico o informacion de tallada de estos
  3. [] Ventas/Utilidades, donde podremos ver nuestras utilidades respecto a las ventas, y mas informacion que creas conveniente que sea importante en esta seccion
  

[x] agregar la opcion de cancelar ventas desde la vista de ventas, asi como un check para mostrar unicamente el listado de las ventas canceladas

[x] Ventas con pendiente de pago y abonos, agregar el check de mostrar ventas con pendiente de pago en la vista de ventas

[x] cuando se de alta de insumo o aumentar cantidad de insumos, registrarlo como una compra, 
    con opcion de registrar el proveedor
[x] Devoluciones
[x] Auditoría de acciones (logs de usuarios)

2. aplicar descuento global o especifico a un cliente dado de alta, por categoria de productos, 
    descuento por porcentajes.

3. [x] en venta agregar manual la cantidad de impresiones o productos

4. excel de los reportes

5. [x] cambiar la categoria de impresion a produccion a los productos que entran a produccion

6. [] unidades de medida, jalar las que se dan de alta no las que estan fijas

## Sistema de Niveles de Precios por Volumen (medio mayoreo, mayoreo, super mayoreo) — IMPLEMENTADO 2026-06-06

### Tabla nueva `producto_precios`
- `producto_id` FK
- `nivel`: 'medio_mayoreo' | 'mayoreo' | 'super_mayoreo'
- `cantidad_minima`: desde cuántas unidades aplica
- `precio`: precio especial del nivel
- `@@unique([producto_id, nivel])` — un registro por nivel por producto
- `onDelete: Cascade` desde productos

### Lógica de cálculo
- Helper `calcularPrecioPorVolumen(precioBase, cantidad, niveles)`:
  1. Filtra niveles activos donde `cantidad >= nivel.cantidad_minima`
  2. Ordena por `cantidad_minima` DESC
  3. Toma el primero (el nivel más alto aplicable)
  4. Si no hay nivel aplicable, retorna `precioBase`
- Validación: `cantidad_minima` debe ser estrictamente creciente entre niveles

### Endpoints
- `GET /api/v1/productos/:id/precios` — listar
- `POST /api/v1/productos/:id/precios` — crear
- `PUT /api/v1/productos/:id/precios/:precioId` — actualizar
- `DELETE /api/v1/productos/:id/precios/:precioId` — eliminar

### Frontend
- `ProductoFormModal`: sección "Precios por volumen" con 3 filas (medio_mayoreo, mayoreo, super_mayoreo). Cada fila: input "Desde N unidades" + input "Precio $". Vacío = nivel no configurado.
- `NuevaVentaPage`: precio se recalcula automáticamente al cambiar cantidad (botones +/- o input manual). Badge del nivel aplicado visible en cada item del carrito. Niveles visibles en catálogo.

### Archivos
- Backend: `prisma/schema.prisma`, `prisma/migrations/20260606000000_add_producto_precios/`, `src/services/preciosProducto.service.ts`, `src/services/productos.service.ts` (include producto_precios), `src/controllers/preciosProducto.controller.ts`, `src/routes/preciosProducto.routes.ts`, `src/routes/index.ts`
- Frontend: `src/api/preciosProducto.api.ts`, `src/pages/productos/components/ProductoFormModal.tsx`, `src/pages/ventas/NuevaVentaPage.tsx`

----------------------------------------------------------------------

1. Sistema de Niveles de Precios por Volumen (medio mayoreo, mayoreo, super mayoreo)
1.1 Modelo de datos
Nueva tabla producto_precios con relaciÃ³n 1-N a productos:
- nivel: enum controlado (medio_mayoreo | mayoreo | super_mayoreo)
- cantidad_minima: desde cuÃ¡ntas unidades aplica
- precio: precio especial del nivel
- @@unique([producto_id, nivel]) â un registro por nivel por producto
- onDelete: Cascade desde productos
1.2 LÃ³gica de cÃ¡lculo (backend)
- Helper calcularPrecioPorVolumen(producto, cantidad, niveles):
1. Filtra niveles activos donde cantidad >= nivel.cantidad_minima
2. Ordena por cantidad_minima DESC
3. Toma el primero (el nivel mÃ¡s alto aplicable)
4. Si no hay nivel aplicable, retorna producto.precio_venta
- GET /api/v1/productos ahora incluye precios[] con los 3 niveles del producto
- ValidaciÃ³n: cantidad_minima debe ser creciente entre niveles (medio < mayoreo < super). Backend rechaza con 400 si no se cumple.
1.3 GestiÃ³n de precios (UI)
Dentro de ProductoFormModal, secciÃ³n nueva "Precios por volumen" abajo de precio_compra:
- 3 filas: Medio mayoreo, Mayoreo, Super mayoreo
- Cada fila con 2 inputs: Desde N unidades y Precio $
- VacÃ­o en ambos = nivel no configurado
- ValidaciÃ³n visual: mostrar warning si las cantidades mÃ­nimas no son crecientes
- Se guardan al crear/editar producto (transacciÃ³n junto con producto)
1.4 AplicaciÃ³n automÃ¡tica en ventas
- NuevaVentaPage.addToCart: al agregar producto, llama al helper backend con cantidad = 1 para obtener precio inicial
- setQty (ya existe del paso anterior): al cambiar cantidad, recalcula precio unitario con la nueva cantidad
- updateQty (botones +/-): misma lÃ³gica, recalcular con cantidad nueva
- Importante: el precioUnitario del carrito siempre refleja el nivel aplicable segÃºn la cantidad actual
1.5 Indicador visual
- En cada item del carrito, badge opcional con el nivel aplicado (ej: "Medio mayoreo") cuando se detecta un nivel activo
- En la lista de productos del catÃ¡logo, mostrar los 3 precios por volumen visibles para el vendedor
1.6 Almacenamiento en venta_detalle
- precio_unitario final (el que aplicÃ³ al momento de vender) se guarda en venta_detalle.precio_unitario
- Historial correcto: si el cliente comprÃ³ 10 unidades a precio de medio mayoreo, queda registrado ese precio
- El ticket refleja el precio final real
1.7 Endpoints
- GET /api/v1/productos/:id/precios â listar
- POST /api/v1/productos/:id/precios â crear
- PUT /api/v1/productos/:id/precios/:precioId â actualizar
- DELETE /api/v1/productos/:id/precios/:precioId â eliminar
- Permiso: reusar productos.editar
1.8 Ejemplo funcional
- Producto "Impresiones B/N": precio_venta = $2.00
- ConfiguraciÃ³n: medio_mayoreo desde 10 = $1.80, mayoreo desde 30 = $1.00, super_mayoreo sin configurar
- Cliente agrega 1 impresiÃ³n al carrito â precio $2.00
- Sube cantidad a 10 (manual o con botones) â automÃ¡ticamente cambia a $1.80
- Sube a 30 â cambia a $1.00
- Total mostrado: 30 Ã $1.00 = $30.00
- Al confirmar venta, venta_detalle guarda precio_unitario = 1.00
2. Archivos a tocar
Backend (/var/www/plprint/plprint-api/):
- prisma/schema.prisma â agregar modelo producto_precios + relaciÃ³n
- prisma/migrations/... â nueva migraciÃ³n manual
- prisma/seed.ts â sin cambios (precios se configuran por producto)
- src/services/productos.service.ts â incluir precios en getAll/getById; helper de cÃ¡lculo
- src/services/preciosProducto.service.ts â CRUD nuevo
- src/controllers/preciosProducto.controller.ts â endpoints
- src/routes/preciosProducto.routes.ts â rutas con RBAC
- src/routes/index.ts â registrar
Frontend (/var/www/plprint/plprint-web/):
- src/api/preciosProducto.api.ts â tipos y llamadas
- src/api/productos.api.ts â extender ProductoCatalogo con precios: NivelPrecio[]
- src/pages/productos/components/ProductoFormModal.tsx â secciÃ³n "Precios por volumen"
- src/pages/ventas/NuevaVentaPage.tsx â addToCart, setQty, updateQty recalculan precio con helper
- src/utils/preciosVolumen.ts â helper frontend (espejo de backend)
3. Orden de implementaciÃ³n
1. Schema + migraciÃ³n
2. Backend CRUD de precios
3. Helper backend + integraciÃ³n en getAll/getById de productos
4. Frontend API types
5. ProductoFormModal con secciÃ³n nueva
6. NuevaVentaPage con recÃ¡lculo de precio
7. VerificaciÃ³n TS + smoke test con productos existentes

## Sistema de Productos por Medidas (M² / ML) — IMPLEMENTADO 2026-06-06

### Tablas modificadas
- `unidades_medida`: extender con `es_medida BOOLEAN`, `tipo_medida VARCHAR(2)` ('m2' | 'ml' | NULL)
- `venta_detalle`: extender con `ancho_m DECIMAL(10,4)`, `alto_m DECIMAL(10,4)`, `unidad_medida_detalle VARCHAR(20)`
- `cotizacion_detalle`: mismas 3 columnas que `venta_detalle`

### Migraciones
- `20260606000001_add_medida_to_unidades`
- `20260606000002_add_medidas_to_detalle`

### Lógica
- `calcularPrecioItem(precioVenta, cantidad, unidad, medidas)`:
  - Si `unidad.es_medida` y `tipo_medida='m2'`: `precioUnitario = precioVenta * (ancho_m * alto_m)`, label = "X.XX m²"
  - Si `unidad.es_medida` y `tipo_medida='ml'`: `precioUnitario = precioVenta * alto_m`, label = "X.XX m"
  - Si no: `precioUnitario = precioVenta`, label vacío
- `subtotal_item = precioUnitario * cantidad_piezas`
- `precioVenta` del producto se interpreta como **precio por m² o por ml** según la unidad
- ML usa solo `alto_m` como largo

### Endpoints (sin cambios)
- `GET /api/v1/unidades-medida` ahora retorna `es_medida` y `tipo_medida` por cada unidad
- `POST/PUT /api/v1/unidades-medida` acepta `es_medida` y `tipo_medida`
- `GET /api/v1/productos/:id` adjunta `unidad_info: { es_medida, tipo_medida }` (lookup por abreviatura, con cache en memoria)
- Cache se invalida al crear/actualizar una unidad de medida

### Frontend
- `UnidadesMedidaPage`: tabla con columna "Por medidas" (badge m²/ml); modal crear/editar con checkbox "Esta unidad se vende por medidas" + botones para elegir tipo (m²/ml)
- `ProductoFormModal`: badge "(por m²)" / "(por ml)" al lado del select de unidad cuando la unidad seleccionada es de medida; mensaje explicativo
- `NuevaVentaPage`: card de catálogo muestra badge "por m²" / "por ml"; fila del carrito muestra inputs inline `ancho` y `alto` (m), recálculo en tiempo real al cambiar valores; precio final `= precioBase × área × cantidad`
- `CotizacionesPage`: misma lógica inline en cada item del modal
- `TicketImpresion`: muestra `X.XXm × Y.YYm = Z.ZZm²` debajo del nombre del producto

### Archivos
- Backend: `prisma/schema.prisma`, 2 migraciones, `src/services/unidadesMedida.service.ts`, `src/services/productos.service.ts` (lookup + cache), `src/services/ventas.service.ts`, `src/services/cotizaciones.service.ts`, `src/routes/ventas.routes.ts`, `src/routes/cotizaciones.routes.ts`, `src/routes/unidadesMedida.routes.ts`
- Frontend: `src/api/unidadesMedida.api.ts` (helper `calcularPrecioItem`), `src/pages/unidades-medida/UnidadesMedidaPage.tsx`, `src/pages/productos/components/ProductoFormModal.tsx`, `src/pages/ventas/NuevaVentaPage.tsx`, `src/pages/cotizaciones/CotizacionesPage.tsx`, `src/pages/ventas/components/TicketImpresion.tsx`, `src/api/cotizaciones.api.ts`


## Plan de Desarrollo — Módulo Caja (Corte de Caja)

### Resumen del módulo

El módulo de **Caja** permitirá gestionar el flujo de efectivo diario por sucursal mediante sesiones de trabajo (apertura → movimientos → corte). Proporciona una vista unificada de todos los movimientos del día (ventas, ingresos, gastos, retiros) y facilita el arqueo de caja al cierre con comparación de efectivo esperado vs. real.

---

### 1. Modelo de datos ✅

#### Tabla nueva: `cortes_caja`

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | INT PK AUTO_INCREMENT | Identificador único |
| `sucursal_id` | INT FK → sucursales | Sucursal donde se abre la caja |
| `usuario_apertura_id` | INT FK → usuarios | Usuario que abrió la caja |
| `fecha_apertura` | DATETIME | Fecha/hora de apertura |
| `monto_inicial` | DECIMAL(12,2) | Efectivo inicial en caja (cambio/arranque) |
| `fecha_cierre` | DATETIME NULL | Fecha/hora del corte (NULL = sigue abierta) |
| `usuario_cierre_id` | INT FK → usuarios NULL | Usuario que realizó el corte |
| `monto_final_esperado` | DECIMAL(12,2) NULL | Efectivo que debería haber en caja |
| `monto_final_real` | DECIMAL(12,2) NULL | Efectivo real contado por el cajero |
| `diferencia` | DECIMAL(12,2) NULL | `monto_final_real - monto_final_esperado` |
| `observaciones` | TEXT NULL | Notas del cierre (explicar diferencia, etc.) |
| `estado` | ENUM('abierta','cerrada') DEFAULT 'abierta' | Estado de la sesión |
| `created_at` | DATETIME DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | DATETIME | |

**Restricciones:**
- Solo una caja abierta por sucursal a la vez — se controla en lógica de negocio (service)
- `@@index([sucursal_id])`, `@@index([fecha_apertura])`, `@@index([estado])`

**Relación desde sucursales:**
```
sucursal_id  →  sucursales.id
usuario_apertura_id  →  usuarios.id
usuario_cierre_id  →  usuarios.id
```

#### Sin cambios a tablas existentes

Los movimientos se obtienen por **rango de fechas** (`fecha_apertura` → `fecha_cierre` o `NOW()` si está abierta) + `sucursal_id`:
- **Ventas en efectivo**: `ventas` WHERE `sucursal_id = X` AND `created_at BETWEEN apertura AND cierre` AND `metodo_pago = 'Efectivo'` AND `estado = 'completada'`
- **Abonos en efectivo**: `ventas_abonos` WHERE `metodo_pago = 'Efectivo'` AND `fecha BETWEEN apertura AND cierre` (filtrados por venta de la sucursal)
- **Gastos/Ingresos/Retiros**: `gastos` WHERE `sucursal_id = X` AND `fecha BETWEEN apertura AND cierre`

---

### 2. Lógica de negocio (backend) ✅

#### 2.1 Apertura de caja
- Solo puede haber **una caja abierta por sucursal** a la vez
- El usuario ingresa el `monto_inicial` (efectivo con el que arranca)
- Se registra `fecha_apertura = NOW()`
- Permisos requeridos: `caja.aperturar`

#### 2.2 Movimientos durante la sesión
No se modifican las tablas de ventas/gastos. Los movimientos se obtienen con queries que filtran por el rango de la caja abierta:

**Fuentes de movimientos:**
1. **Ventas** (`ventas`): solo las pagadas en efectivo, estado `completada`. Se muestran como "Ingreso por venta".
2. **Gastos tipo 'ingreso'**: ingresos extras registrados manualmente. Se muestran como "Ingreso".
3. **Gastos tipo 'gasto'**: gastos operativos. Se muestran como "Descuento de ingresos".
4. **Gastos tipo 'retiro'**: retiros de efectivo de caja. Se muestran como "Descuento de ingresos".

#### 2.3 Cálculo del corte de caja
Al presionar "Realizar corte":
```
monto_final_esperado = monto_inicial
                      + SUM(ventas_efectivo)
                      + SUM(abonos_efectivo)
                      + SUM(gastos_tipo_ingreso)
                      - SUM(gastos_tipo_gasto)
                      - SUM(gastos_tipo_retiro)
```

El sistema presenta:
- Resumen por método de pago (efectivo, tarjeta, transferencia) — informativo
- Total de ventas en efectivo
- Total de ingresos registrados
- Total de gastos registrados
- Total de retiros registrados
- **Monto esperado en caja**
- El cajero ingresa el **monto real contado**
- El sistema calcula la **diferencia** (`real - esperado`)
- El cajero puede agregar observaciones
- Se guarda el cierre con `estado = 'cerrada'`

#### 2.4 Reimpresión de corte
- Genera un ticket/PDF con el resumen del corte cerrado
- Se puede reimprimir el último corte o seleccionar de historial

#### 2.5 Registrar ingreso / gasto / retiro desde Caja
- Abre un modal que crea un registro en la tabla `gastos` con el `tipo` correspondiente (`ingreso`, `gasto`, `retiro`)
- Usa la misma tabla `gastos` existente, con `sucursal_id` de la sucursal activa
- Requiere: categoría de gasto, concepto, monto, notas opcionales
- Los retiros requieren `autorizado_por` (usuario admin o con permiso)

---

### 3. Endpoints ✅

| Método | Ruta | Descripción | Permiso |
|---|---|---|---|
| `GET` | `/api/v1/caja/estado` | Obtener caja abierta de la sucursal activa (o null) | `caja.ver` |
| `POST` | `/api/v1/caja/apertura` | Abrir caja con monto inicial | `caja.aperturar` |
| `POST` | `/api/v1/caja/corte` | Realizar corte de caja | `caja.cerrar` |
| `GET` | `/api/v1/caja/movimientos` | Movimientos del día (ventas + gastos en rango de caja) | `caja.ver` |
| `GET` | `/api/v1/caja/cortes` | Historial de cortes (paginado, filtros por fecha/sucursal) | `caja.ver` |
| `GET` | `/api/v1/caja/cortes/:id` | Detalle de un corte específico | `caja.ver` |
| `GET` | `/api/v1/caja/cortes/:id/reimprimir` | Datos para reimprimir corte | `caja.reimprimir` |
| `POST` | `/api/v1/caja/ingreso` | Registrar ingreso (crea gasto tipo 'ingreso') | `caja.ingreso` |
| `POST` | `/api/v1/caja/gasto` | Registrar gasto (crea gasto tipo 'gasto') | `caja.gasto` |
| `POST` | `/api/v1/caja/retiro` | Registrar retiro (crea gasto tipo 'retiro') | `caja.retiro` |

**Query params para `GET /api/v1/caja/movimientos`:**

| Param | Tipo | Descripción |
|---|---|---|
| `sucursalId` | number | Filtrar por sucursal (default: sucursal activa del usuario) |
| `usuarioId` | number | Filtrar por usuario que realizó el movimiento |
| `corteId` | number | Al seleccionar un corte, usa su `fecha_apertura` y `fecha_cierre` como rango |
| `page` | number | Paginación |
| `limit` | number | Paginación |

**Zod schemas de validación** en cada ruta, siguiendo la convención existente.

---

### 4. Permisos (RBAC) ✅

Nuevos permisos a agregar en `seed.ts`:

| Módulo | Acción | Descripción |
|---|---|---|
| `caja` | `ver` | Ver movimientos y historial de caja |
| `caja` | `aperturar` | Aperturar caja |
| `caja` | `cerrar` | Realizar corte de caja |
| `caja` | `ingreso` | Registrar ingreso |
| `caja` | `gasto` | Registrar gasto |
| `caja` | `retiro` | Registrar retiro |
| `caja` | `reimprimir` | Reimprimir corte de caja |

**Asignación por rol:**
- **Admin**: todos los permisos de caja
- **Vendedor**: `caja.ver`, `caja.aperturar`, `caja.cerrar`, `caja.ingreso`, `caja.gasto` (retiro requiere autorización)
- **Operador**: `caja.ver` (solo lectura)

---

### 5. Frontend ✅

#### 5.1 Página `CajaPage` (`/caja`)

**Estructura de la página:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Caja                                                          │
│  Estado: ● Abierta desde DD/MM/YYYY HH:MM    [Botones →]       │
├─────────────────────────────────────────────────────────────────┤
│  [Resumen cards]                                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Ventas   │ │ Ingresos │ │  Gastos  │ │  Retiros │          │
│  │ $X,XXX   │ │ $X,XXX   │ │ $X,XXX   │ │ $X,XXX   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│  ┌───────────────────────┐ ┌───────────────────────┐           │
│  │ Efectivo en caja      │ │ Diferencia (al corte) │           │
│  │ $X,XXX (esperado)     │ │ $XXX                  │           │
│  └───────────────────────┘ └───────────────────────┘           │
├─────────────────────────────────────────────────────────────────┤
│  [Filtros]                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Corte        │  │ Usuario      │  │ Sucursal     │          │
│  │ [Todas ▼]   │  │ [Todos ▼]   │  │ [Actual ▼]  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│  Historial de movimientos                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Fecha    │ Usuario  │ Tipo     │ Monto │ M.Pago │ Suc.  │   │
│  │ 10:30    │ Juan     │ Venta    │+$250  │Efectivo│ Suc.1 │   │
│  │ 10:45    │ Juan     │ Venta    │+$180  │Tarjeta │ Suc.1 │   │
│  │ 11:00    │ María    │ Gasto    │-$50   │Efectivo│ Suc.1 │   │
│  │ 11:30    │ Juan     │ Venta    │+$320  │Efectivo│ Suc.1 │   │
│  │ 12:00    │ Admin    │ Retiro   │-$500  │Efectivo│ Suc.1 │   │
│  │ 12:15    │ Juan     │ Ingreso  │+$100  │Efectivo│ Suc.1 │   │
│  └──────────────────────────────────────────────────────────┘   │
│  Paginación                                                     │
└─────────────────────────────────────────────────────────────────┘
```

**Filtros (debajo de las resumen cards):**

| Filtro | Tipo | Opciones | Comportamiento |
|---|---|---|---|
| **Corte** | Select | "Caja actual" + lista de cortes anteriores (ID + fecha) | Al seleccionar un corte anterior, la tabla muestra los movimientos del rango `fecha_apertura` → `fecha_cierre` de ese corte. Las resumen cards se recalculan con los datos de ese periodo. Si se selecciona "Caja actual", muestra los movimientos desde la apertura actual hasta ahora. |
| **Usuario** | Select | "Todos" + usuarios asignados a la sucursal activa | Filtra la tabla para mostrar solo movimientos donde el `usuario_id` coincida (ventas realizadas por ese usuario, gastos/ingresos/retiros registrados por ese usuario). Las resumen cards se recalculan solo con los datos filtrados. |
| **Sucursal** | Select | Lista de sucursales del usuario (o todas para admin) | Por defecto muestra la sucursal activa del usuario. Permite cambiar para ver movimientos de otra sucursal. Admin puede ver todas. Las resumen cards y la tabla se filtran por `sucursal_id`. |

**Lógica de combinación de filtros:**
- Los 3 filtros son independientes y se pueden combinar entre sí
- Al cambiar cualquier filtro, se hace un nuevo request a `GET /api/v1/caja/movimientos` con los query params: `corteId`, `usuarioId`, `sucursalId`
- Las resumen cards se actualizan dinámicamente con los datos filtrados
- Si se selecciona un corte cerrado, los botones "Realizar corte" se deshabilita (no se puede cortar un corte ya cerrado). "Reimprimir corte" se habilita para ese corte específico.

**Botones superiores derechos:**
- **Realizar corte**: Abre modal de cierre (solo si hay caja abierta Y no hay un corte anterior seleccionado en el filtro)
- **Reimprimir corte**: Si hay un corte seleccionado en el filtro, reimprime ese. Si no, abre modal para seleccionar del historial.
- **Registrar ingreso**: Abre modal para crear gasto tipo `ingreso` (usa sucursal del filtro o sucursal activa)
- **Registrar gasto**: Abre modal para crear gasto tipo `gasto`
- **Registrar retiro**: Abre modal para crear gasto tipo `retiro` (requiere permiso `caja.retiro`)

**Si NO hay caja abierta:**
- Se muestra un banner con "No hay caja abierta" y botón "Aperturar caja"
- Los botones de corte/ingreso/gasto/retiro están deshabilitados
- El filtro de cortes permite navegar el historial de cortes cerrados (consulta histórica)
- Los filtros de usuario y sucursal siguen funcionando para explorar datos pasados

#### 5.2 Modales

1. **Modal Apertura de Caja**: Input monto inicial + botón confirmar
2. **Modal Corte de Caja**: 
   - Resumen detallado (totales por tipo, por método de pago)
   - Input "Monto real contado"
   - Cálculo en tiempo real de diferencia
   - Textarea "Observaciones"
   - Botón "Confirmar corte"
3. **Modal Registrar Ingreso/Gasto/Retiro**: 
   - Select categoría de gasto
   - Input concepto
   - Input monto
   - Textarea notas
   - (Retiro: requiere contraseña o confirmación de admin)
4. **Modal Reimprimir Corte**: 
   - Lista de últimos cortes
   - Vista previa del ticket
   - Botón imprimir

#### 5.3 Componente de impresión
- `CorteTicketImpresion.tsx`: Ticket HTML formateado para impresión del corte, similar a `TicketImpresion.tsx` existente
- Muestra: datos de la empresa, sucursal, usuario, hora apertura, hora cierre, resumen de movimientos, totales, monto esperado, monto real, diferencia, observaciones

---

### 6. Navegación ✅

- Ruta: `/caja`
- Sidebar: Sección "Navegación", ícono `Wallet` (de lucide-react), módulo `caja`
- Posición: Después de "Gastos" en la lista de navegación

---

### 7. Archivos a crear/modificar ✅

#### Backend (`/var/www/plprint/plprint-api/`)

**Nuevos:**
- `prisma/migrations/YYYYMMDDHHMMSS_add_cortes_caja/migration.sql`
- `src/services/caja.service.ts` — Lógica de apertura, corte, movimientos
- `src/controllers/caja.controller.ts` — Handlers HTTP
- `src/routes/caja.routes.ts` — Rutas con validación Zod + RBAC

**Modificar:**
- `prisma/schema.prisma` — Agregar modelo `cortes_caja` + relaciones en `sucursales` y `usuarios`
- `prisma/seed.ts` — Agregar permisos de `caja` y asignación a roles
- `src/routes/index.ts` — Registrar rutas de caja

#### Frontend (`/var/www/plprint/plprint-web/`)

**Nuevos:**
- `src/api/caja.api.ts` — Tipos y llamadas API
- `src/pages/caja/CajaPage.tsx` — Página principal
- `src/pages/caja/components/AperturaModal.tsx`
- `src/pages/caja/components/CorteModal.tsx`
- `src/pages/caja/components/MovimientoModal.tsx` (ingreso/gasto/retiro)
- `src/pages/caja/components/ReimprimirCorteModal.tsx`
- `src/pages/caja/components/CorteTicketImpresion.tsx`
- `src/pages/caja/components/MovimientosTable.tsx`
- `src/pages/caja/components/ResumenCards.tsx`
- `src/pages/caja/components/FiltrosBar.tsx` — Componente con los 3 selects (Corte, Usuario, Sucursal)

**Modificar:**
- `src/routes/index.tsx` — Agregar ruta `/caja`
- `src/components/layout/Sidebar.tsx` — Agregar ítem "Caja" en navegación

---

### 8. Orden de implementación ✅

| Paso | Descripción |
|---|---|
| 1 | Schema Prisma + migración (`cortes_caja`) |
| 2 | Seed: permisos de caja + asignación a roles |
| 3 | Backend: `caja.service.ts` (apertura, movimientos, corte) |
| 4 | Backend: `caja.controller.ts` + `caja.routes.ts` |
| 5 | Backend: registrar rutas en `routes/index.ts` |
| 6 | Frontend: `caja.api.ts` (tipos + llamadas) |
| 7 | Frontend: `CajaPage.tsx` con tabla de movimientos + resumen |
| 8 | Frontend: modales (apertura, corte, movimiento, reimprimir) |
| 9 | Frontend: ruta + sidebar |
| 10 | Verificación TypeScript + smoke test |

---

### 9. Consideraciones técnicas ✅

- **Una sola caja abierta por sucursal**: Se valida en el service antes de crear apertura. Query: `SELECT * FROM cortes_caja WHERE sucursal_id = ? AND estado = 'abierta' LIMIT 1`
- **Multi-sucursal**: Cada sucursal tiene su propia sesión de caja independiente
- **Scope por usuario**: Usuarios no-admin solo ven caja de sus sucursales asignadas
- **Rendimiento**: Los queries de movimientos usan índices existentes en `ventas.created_at`, `gastos.fecha`, `ventas.sucursal_id`, `gastos.sucursal_id`
- **Transacciones**: La apertura y el corte se hacen en transacción Prisma para consistencia
- **No se modifican ventas ni gastos**: El corte es una "foto" del rango de tiempo; los datos fuente siguen siendo las tablas existentes
- **Historial**: Los cortes cerrados se conservan para consulta y reimprimir en cualquier momento
- **Integración con tabla gastos**: Los ingresos/gastos/retiros registrados desde caja se crean en la tabla `gastos` existente, reutilizando el modelo y las categorías ya definidas

---


- agregar que al imprimir el corte de caja, este esa opcion de ticket y la opcion del documento pdf detallado