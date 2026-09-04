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

6. [x] unidades de medida, jalar las que se dan de alta no las que estan fijas

#### -------------------------------------------------------------------------------------------

* [x] URGENTEEE!!! correcion de la medida de los planos, que no es el ancho, es el alto, y que haga el calculo bien
  largo x cantidad = costo total

* Almacen:
  [x] agregar compra cambiarlo como esta en docu

* [x] ML calculo de cobro (ancho no tomar en cuenta) - largo x cantidad = cobro total
  - si al colocar la medida de largo es menor a 1mtr tomarlo como metro completo y asi hacer el
    calculo del cobro
* [x] M2 calculo de cobro = ancho x largo x cantidad = cobro total
  - si al colocar la medida de largo es menor a 1mtr tomarlo como metro completo y asi hacer el
    calculo del cobro

* [x] en ventas, cuando se busca un producto, agregar que se muestre la listab de los que concuerden con lo que escribo
* [x] cambiar el card de los productos en ventas para tener mas a la vista el nombre de los productos

* [x] correccion de folios
* [] Checar si tenemos TOAST para el manejo de notificaciones, y cambiar a toast en lugar de alert



16 vulnerabilities (1 low, 9 moderate, 6 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues possible (including breaking changes), run:
  npm audit fix --force

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.




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


---------------------------------------------------------------

## AJUSTES A HISTORIAL DE VENTAS

- a las ventas, cuandos e realice una se generara un Num. de folio aparte del numero de venta que ya se tiene, para tener un control mejor
- a la barra de busqueda agregar el poder buscar por folio una venta
- agregar busqueda por producto a la barra de busqueda
- agregar filtro componente de rango de fecha para tener el listado de ventas de una fecha a otra
- agregar otro componente de un select con el listado de usuarios del sistema para seleccionarlo y ver las ventas que hizo el (UNICAMENTE DISPONIBLE PARA UN USUARIO ADMIN, VALIDAR ESO CUANDO SE ENTRA O RECARGA LA VISTA DE VENTAS)
- agregar filtro para mostrar historial de ventas del dia, o por rango de fecha
- Agregar boton que nos permita exportar el historial de ventas, este tendra los detalles de las ventas realizadas, para esto se podra descargar el historial de ventas que se tenga en la tabla, ya sea las del dia o por rango de fecha, el archivo que exportara sera la opcion de excel o pdf, donde se tendra detallado el historial de ventas

Plan Final: Mejoras al Historial de Ventas

1. Folio de ventas
   - Backend — Prisma schema: agregar campo `folio String? @unique @db.VarChar(20)` a modelo `ventas`
   - Backend — Service (`ventas.service.ts`):
     - Método privado `generarFolio()`: busca el folio más reciente del día, extrae secuencia e incrementa. Formato: `VEN-{YYYYMMDD}-{XXXX}`
     - En `create()`, asignar `folio: await this.generarFolio()`
     - Incluir `folio` en `findAll()` y `findById()`
   - Frontend — Types (`venta.types.ts`): agregar `folio?: string`
   - Frontend — `VentasPage.tsx`: columna `#` muestra ID y folio; `AbonosModal` y tickets usan folio

2. Búsqueda por folio y producto (server-side)
   - Backend — Service: agregar `search?: string` a `FindAllParams`; en `findAll()`, OR search sobre `id`, `folio`, `clientes.nombre`, `usuarios.nombre`, `venta_detalle.productos.nombre`
   - Backend — Controller: leer `req.query.search`
   - Frontend — `VentasPage.tsx`: eliminar filtro client-side, pasar `search` a API

3. Rango de fechas (default: hoy)
   - Frontend — Componente nuevo `VentasDateFilter.tsx`: botones `Hoy | Este mes | Personalizado` + inputs date
   - Frontend — `VentasPage.tsx`: estado `desde`/`hasta` inicializado a hoy, pasar a API

4. Filtro por usuario (admin-only)
   - Frontend — `VentasPage.tsx`: select de usuarios condicionado a `isAdmin`
   - Backend — Controller: leer `req.query.usuarioId`
   - Backend — Service: agregar `usuarioIdFiltro?: number` a `FindAllParams`

5. Exportar historial (Excel + PDF)
   - Dep: `npm install xlsx`
   - Frontend — Componente nuevo `ExportarVentasButton.tsx`: dropdown Excel/PDF
   - Excel: fila por detalle de producto, workbook con `XLSX.utils.json_to_sheet()`
   - PDF: HTML con tabla estilizada, `window.open()` + `window.print()`

Archivos a modificar/crear:
| Archivo | Acción |
|---------|--------|
| `plprint-api/prisma/schema.prisma` | +folio en modelo ventas |
| `plprint-api/src/services/ventas.service.ts` | Generar folio + search param |
| `plprint-api/src/controllers/ventas.controller.ts` | Leer search y usuarioId |
| `plprint-web/src/types/venta.types.ts` | +folio: string |
| `plprint-web/src/pages/ventas/VentasPage.tsx` | Folio, search server-side, date filter, user filter, export |
| `plprint-web/src/pages/ventas/components/VentasDateFilter.tsx` | Nuevo |
| `plprint-web/src/pages/ventas/components/ExportarVentasButton.tsx` | Nuevo |
| `plprint-web/package.json` | +xlsx |


-----------------------------------------------------------------

### RESUMEN DE LAS CARACTERISTICAS DEL SISTEMA

Qué hace el sistema
Es una aplicación web integral de gestión de inventario, ventas y producción (POS + ERP) diseñada para pymes con múltiples sucursales. Permite gestionar productos, inventario, ventas, clientes, usuarios, producción y caja de manera centralizada y escalable.

Módulos Principales Implementados
1. ✅ GESTIÓN DE PRODUCTOS
Crear, editar, eliminar productos (soft delete)
Asociar imágenes, precios de venta/compra
Categorías de productos (venta y producción)
Unidades de medida personalizadas (unidades, m², ml, etc.)
Sistema de precios por volumen (medio mayoreo, mayoreo, super mayoreo)
Productos por medidas (m² / ml) con cálculo automático de precios
Búsqueda, filtrado y paginación
2. INVENTARIO POR SUCURSAL
Stock independiente por producto y sucursal
Niveles de stock mínimo y máximo
Kardex de movimientos (historial completo de entradas/salidas)
Gestión de mermas (desperdicio de productos e insumos)
Alertas de inventario bajo
3. VENTAS
Crear ventas rápidas (cliente "Público General" o registrado)
Carrito de compra dinámico con múltiples productos
Cálculo automático de totales, descuentos
Reducción automática de inventario
Ventas con pago completo o pendiente (con abonos)
Devoluciones desde ventas completadas
Descuentos por cliente o categoría (global o por producto)
Estados de venta: completada, cancelada, devuelta
Historial filtrable por cliente, usuario, fecha, estado
Generación de tickets/facturas (impresión)
Exportación a Excel/PDF
4. COTIZACIONES
Guardar ventas como cotizaciones pendientes
Buscar y aplicar cotizaciones anteriores
Filtrar por cliente, fecha, usuario, folio
Convertir cotización a venta
Exportar cotización como PDF
5. ABONOS / PAGOS PENDIENTES
Registrar abonos a ventas con saldo pendiente
Visualizar ventas con pendiente de pago
Métodos de pago personalizados
Control de pagos parciales
6. GESTIÓN DE CLIENTES
CRUD de clientes
Datos básicos (nombre, teléfono, email, dirección)
Descuentos globales por cliente
Historial de compras por cliente
7. GESTIÓN DE USUARIOS Y ROLES
CRUD de usuarios
Asignación a sucursales (uno o múltiples)
Roles: Admin, Vendedor, Operador
RBAC (Control de acceso basado en roles) con permisos granulares por módulo y acción
Hash de contraseñas (bcrypt)
JWT con token_version para invalidar sesiones
Autenticación segura
8. GESTIÓN DE SUCURSALES
Crear, editar, activar/inactivar sucursales
Asignar usuarios a sucursales
Inventario independiente por sucursal
Datos por sucursal (nombre, dirección, teléfono)
Soporte multi-sucursal (arquitectura lista para multi-empresa)
9. CAJA Y CORTE DE CAJA ✅
Apertura de caja con monto inicial
Registro de movimientos diarios (ventas, ingresos, gastos, retiros)
Corte de caja con arqueo (monto esperado vs. real)
Cálculo automático de diferencias
Registro de observaciones
Historial de cortes con reimpresas
Botones rápidos: registrar ingreso, gasto, retiro
10. INSUMOS Y COMPRAS
Gestión de insumos (componentes para producción)
Inventario de insumos por sucursal
Compras de insumos a proveedores
Registro automático de compras al aumentar inventario
Asociación de insumos con productos (BOM - Bill of Materials)
Gestión de mermas de insumos
11. PROVEEDORES
CRUD de proveedores
Datos: nombre, contacto, teléfono, email, RFC, dirección
Asociación con productos e insumos
Historial de compras por proveedor
12. PRODUCCIÓN / ÓRDENES DE PRODUCCIÓN
Crear órdenes de producción para productos con categoría "producción"
Estados: pendiente, en diseño, en producción, acabados, terminados, entregados
Asignación de órdenes a usuarios
Notas/comentarios por cada estado
Historial de cambios de estado
Control de BOM (Bill of Materials)
13. MÁQUINAS E IMPRESIONES
Registro de máquinas de impresión por sucursal
Contador de impresiones diarias/totales
Asociación de máquinas con productos
Registro automático de impresiones desde ventas
Tracking de impresiones para mermas
14. GASTOS / INGRESOS / RETIROS
Categorías de gastos personalizables
Tipos: gasto, ingreso, retiro
Registro con concepto, monto, notas
Autorización de retiros (autorizado_por)
Comprobantes adjuntables (URL)
Filtrado por fecha, tipo, categoría
Historial completo con exportación
15. MÉTODOS DE PAGO
Métodos personalizables (efectivo, tarjeta, transferencia, etc.)
Configuración por empresa
16. AUDITORÍA (AUDIT LOG)
Registro de todas las acciones de usuarios
Tracking: quién, qué, cuándo, cambios realizados
Filtrado por usuario, fecha, entidad, acción
Exportación de logs para auditoría
17. CONFIGURACIÓN GLOBAL
Datos de empresa (nombre, logo, información)
IVA global único
Formato de moneda
Tipos de pago personalizados
Información de tickets (logo, mensaje, formato de fecha/hora)
Configuración general del sistema
18. RESPALDO DE DATOS
Funcionalidad de backup/restore de base de datos
Exportación segura de datos
19. NOTIFICACIONES
Sistema de notificaciones configurable
Alertas de inventario bajo
Notificaciones por evento
20. REPORTES
Reporte de ventas (diarias, mensuales)
Reporte de ingresos vs. gastos
Reporte de cuentas por cobrar
Reporte de utilidades/márgenes por ventas
Exportación a Excel/PDF
Filtrado por fecha, sucursal, usuario, categoría
21. DASHBOARD
Métricas de ventas
Stock disponible
Información resumida del negocio
Funciones Clave Transversales
✅ Autenticación y Seguridad

Login con usuario/contraseña
JWT + token_version para invalidación de sesiones
Hash de contraseñas con bcrypt
Rate limiting
✅ Paginación y Búsqueda

En todas las listas (productos, ventas, clientes, usuarios, etc.)
Filtros avanzados por múltiples criterios
Exportación a Excel/PDF
✅ Multi-sucursal

Inventario independiente por sucursal
Usuarios asignados a sucursales
Datos operacionales segregados por sucursal
Admin global con acceso a todas
✅ Kardex / Historial

Movimientos de inventario por sucursal
Trazabilidad completa de entradas/salidas
Mermas registradas
✅ Validación

Backend: Zod schemas
Frontend: React Hook Form
Validación en tiempo real
✅ Escalabilidad

Índices en base de datos
Paginación
Lazy loading en frontend
Preparado para miles de productos
Arquitectura Técnica
Frontend: React + Vite + TypeScript (Netlify)
Backend: Node.js + Express + TypeScript (VPS)
Base de datos: MySQL 8.0+ con Prisma ORM
Estado: Zustand
Formularios: React Hook Form
UI: TailwindCSS + shadcn/ui
Validación: Zod

Estructura Backend:

Controllers (27 módulos)
Services (lógica de negocio)
Routes (rutas con RBAC)
Middleware (validación, autenticación, autorización)
Estructura Frontend:

Páginas por módulo (18 secciones)
Componentes reutilizables
API client centralizado
Store de estado global
Utilidades y hooks

### TEXTO PARA PUBLICACIONES 
Hola grupo buen día.
Pongo a disposición el siguiente sistema a la venta, es desarrollo propio, con la adquisición se pueden adjuntar mejoras o editar ciertas cosas del diseño para que quede mas a tus gustos y necesidades, esta es la URL para la demo: https://plprint.netlify.app/login
las credenciales se las paso por inbox en caso de estar interesados.
características: 
✅ DASHBOARD
✅ AUTENTICACION Y SEGURIDAD
✅ PAGINACION Y BUSQUEDA
✅ GESTIÓN DE PRODUCTOS
✅ INVENTARIO POR SUCURSAL
✅ VENTAS
✅ COTIZACIONES
✅ ABONOS / PAGOS PENDIENTES
✅ GESTION DE CLIENTES
✅ GESTION DE USUARIOS Y ROLES
✅ GESTION DE SUCURSALES
✅ CAJA Y CORTE DE CAJA
✅ INSUMOS Y COMPRAS
✅ PROVEEDORES
✅ PRODUCCION - ORDENES DE PRODUCCION
✅ MAQUINAS E IMPRESIONES
✅ GASTOS / INGRESOS / RETIROS
✅ METODOS DE PAGO
✅ AUDITORIA (AUDIT LOG) registro de todas las acciones de usuarios
✅ CONFIGURACION GLOBAL
✅ RESPALDO DE DATOS
✅ NOTIFICACIONES
✅ REPORTES
Cualquier duda podemos checarlo por inbox.


-----------------------------------------------------

### Agregar manejo de maquinas de impresion en el sistema

## PLAN DE IMPLEMENTACIÓN — Módulo de Máquinas de Impresión

### Resumen del proceso actual (manual):
1. Se dan de alta impresoras con nombre, número de impresiones inicial y final
2. Al final del día, después del corte, se actualiza manualmente el contador de cada máquina
3. Se busca automatizar este proceso para que el contador se actualice solo
4. El contador debe incrementarse con: impresiones exitosas + impresiones que salieron mal (merma técnica/operativa)
5. Las mermas deben registrar en qué máquina se generaron
6. Todo el módulo es opcional, controlado por configuración "¿Somos centro de impresión? SI/NO"

### Estado actual del sistema:
- ✅ Modelo `maquinas` en BD con `contador_total` (se incrementa automáticamente en ventas)
- ✅ Modelo `impresiones` registra cada impresión vinculada a una máquina
- ✅ CRUD backend de máquinas (controller, service, routes, permisos RBAC)
- ✅ Mermas ya crean registro en `impresiones` con `fue_merma: true`
- ✅ Productos pueden tener `maquina_id` asignado (campo existe en BD)
- ❌ No hay UI de máquinas en el frontend
- ❌ Mermas NO incrementan `contador_total` (bug)
- ❌ No hay configuración "centro de impresión"
- ❌ Productos no wirean `maquina_id` desde el service ni el frontend
- ❌ No hay tipo de categoría "impresión"

### Decisiones tomadas con el usuario:
- **Contadores**: Solo automático + lectura física (el contador_total se incrementa solo en ventas/mermas)
- **Corte diario**: Integrado en el módulo de caja
- **Mermas parciales**: Solo desde el módulo de mermas (no desde la venta)
- **Lectura física**: No se necesita, solo contador automático

---

### Plan detallado:

#### 1. Configuración condicional
- Agregar `somos_centro_impresion` (boolean) al sistema de configuración
- Condicionar: sidebar (entrada "Máquinas"), ruta `/maquinas`, y sección de máquinas en el corte de caja

#### 2. Fix: Mermas deben incrementar contador
- Corregir `mermas.service.ts` para que incremente `contador_total` cuando la merma es de un producto con `maquina_id`

#### 3. Mejorar modelo de mermas — agregar `maquina_id` directo
- Agregar `maquina_id` (opcional) a la tabla `mermas`
- Si el producto tiene máquina → auto-seleccionarla
- Si no → permitir selección manual de máquina

#### 4. Página frontend de máquinas
- CRUD completo (nombre, tipo, marca, modelo)
- Dashboard de contadores: hoy, semana, mes, total (usando el endpoint `/maquinas/:id/stats` que ya existe)
- Historial de impresiones por máquina
- Entrada en sidebar condicionada a `somos_centro_impresion`

#### 5. Corte de caja con reporte de máquinas
- Si `somos_centro_impresion = true`, al hacer corte mostrar resumen de impresiones por máquina
- Incluir: impresiones totales, mermas por máquina

#### 6. Categoría tipo "impresión" + selector de máquina en producto
- Agregar tipo `'impresion'` al modelo de categorías
- Cuando un producto tenga categoría tipo "impresión", mostrar en el modal una sección "Impresora vinculada" con selector de máquina
- Wirear `maquina_id` en backend (service DTO, create, update) y frontend (types, form schema, FormData)

---

### Orden de implementación:

1. **Migración BD**: agregar tipo `'impresion'` a categorías + `maquina_id` a mermas
2. **Seed**: agregar config `somos_centro_impresion`
3. **Backend**: wire `maquina_id` en productos service (create/update/find)
4. **Backend**: fix mermas (incrementar contador + maquina_id directo)
5. **Backend**: endpoint reporte máquinas para corte de caja
6. **Frontend**: crear `maquinas.api.ts`
7. **Frontend**: tipos actualizados (Producto, Categoria, CreateProductoPayload)
8. **Frontend**: modal de categorías con tipo "Impresión"
9. **Frontend**: modal de productos con sección condicional de impresora
10. **Frontend**: página de máquinas (CRUD + dashboard)
11. **Frontend**: módulo de mermas con selector de máquina
12. **Frontend**: corte de caja con reporte de máquinas
13. **Frontend**: condicionar todo con `somos_centro_impresion`

### Recomendaciones adicionales (no implementadas — pueden ser siguientes pasos)
1. Rate-limit negociado en producción con un proxy reverso (nginx/cloudflare).
2. CSP estricta en producción: usar script-src 'self' <hash> (cuando Vite genera hashes en build).
3. Report URI en CSP: report-uri https://tudominio.com/csp-report para aprender de violaciones.
4. Rotación automática de tokens en axios interceptor (no implementado aún).
5. Tokens de corta duración (accessToken 15min) implementados correctamente.


### BUGS:

1. Cotizaciones, carga infinita de info ✅

2. formato de pdf de la cotizacion se perdio por completo ✅

3. Cuando se importa el catalogo de productos de un archivo con informacion de productos ya existentes se muestra el listado de todos los productos del archivo aun que no se hayan editado algunos o todos, quiero que solo muestre en el listado los productos que se haya editado la informacion en el archivo osea los que no alla la misma coincidencia de el archivo a la informacion que hay en el sistema. ✅

4. agregar catalogo de insumos, mismo funcionamiento de descargar catalogo e importar catalogo como en productos. ✅

5. Error al generar un respaldo del sistema ✅

6. Bitacora de auditoria, no muestra nada ✅

7. en el proceso de venta, cuando vendo un producto en este caso un plano y lo tengo marcado la opcion de "Si el largo es menor a 1m, se cobrará como 1m" cuando se descuenta al insumo se decuenta el 1m pero utilice .60, quiero que se descuente el .60 aun que se cobre como 1m✅

8. despues de cancelar la venta, si ese producto vendido tiene un insumo, mostrar el modal con las opciones de "Revertir el insumo al inventario" y "Poner como merma el insumo del producto cancelado"✅

9. en las estadisticas de las maquinas en "Contador de impresiones por período", en la parte de "Impresiones recientes" muestra el historial, quiero agregarle que muestre la medida o cantidad de la impresion✅

10. cuando abro realizar corte de caja, en el resumen no muestra el total de "venta efectivo" aun que se hayan echo ventas en efectivo ✅

11. entro a productos agrego o edito un producto -> hago check que tiene stock -> agrego la cantidad disponible y el minimo -> guardo->cierro el modal, si vuelvo a abrir el mismo producto no sale marcado el check de "Registrar movimiento de stock", no se guarda la informacion y sale como si no hubiera guardado anteriormente esa informacion ✅

12. actualmente si no se abre la caja no se muestran las ventas que se hayan realizado en caso de que se hayan hecho ventas antes de abrir caja, quiero que eso no pase, que se puedan ver y se pueda tener registro de las ventas aun que no se haya abierto la caja y sirva para el registro del cierre de caja, pero que muestre un mensaje en un modal con un mensaje de que la caja se encuentra cerrada que se recomienda hacer la abertura de caja -> mostrar el modal de abertura de caja ✅

13. - cuando se hace cierre caja en el modal de "Reporte de Máquinas y Categorías" cuando pone el contador final no se pueden poner numeros con punto decimal ejemplo 13.60, quiero que se pueda manejar numeros con decimales.
- cuando se utilice el sistema se agregaran mas maquinas, quiero que el espacio donde se muestran las maquinas tenga un scroll o algo que pueda mostrar bien las maquinas, al igual que la seccion de "Categorias de impresion"✅

14. error al hacer corte de maquinas:
al hacer el proceso de cierre de caja, al ingreso del modal "Reporte de Máquinas y Categorías", modifique "contador final" -> pdf  corte de caja, ERROR: no se actualizo el "contador final", explicacion:
al entrar al modal "Reporte de Máquinas y Categorías" ya estaba un valor en "contador final" de las maquinas, si lo modifico no toma en cuenta el valor que se modifico para generar el pdf se queda con el valor en el que se abrio el modal, si se abrio con 35 y 12, y pongo 50 y 13.60, imprime 35 y 12 en el pdf ✅


### FACTURACION ELECTRONICA

- Upload archivos CSD (.cer/.key) vía UI — endpoint POST /configuracion/csd con multer
- Campo objeto_imp en productos + columnas CFDI en Excel exportar/importar
- Endpoint POST /ventas/:id/facturar → XML CFDI + sellado + Finkok
- Columnas uuid_timbre/xml_cfdi_path/estado_factura en ventas
- Catálogos SAT completos (hoy hardcodeados en selects)

### MEJORAS DE OPTIMIZACION

1. [x] Indice en las busquedas - no es necesario ya que ya esta optimizado para eso
2. [] optimziar como guardar las imagenes
3. [] bloquear mientras procesa para evitar peticiones repetidas
4. [] optimizar cuando se muestran productos, insumos, etc. no mostrar todos si no es necesario
5. [] prepararnos para alto flujo de conexiones, conexion pooling, cache en memoria de informacion que no cambie constantemente, 


### Estado actual (limitantes)

- Node single-process → 1 CPU core usado. Resto ocioso.
- Prisma singleton → pool conexiones DB por defecto (~connection_limit MySQL interno, típico 9-10).
- Rate limiter global 500/15min por IP → bajo tráfico real, usuarios detrás de NAT/proxy comparten IP y topan límite.
- Sin caché → productos, categorías, config se consultan DB cada request.
- N+1 posibles en servicios con includes anidados.
- MySQL sin tuning confirmado.

Mejoras, ordenadas por impacto/esfuerzo

## 1. Alto impacto, esfuerzo bajo
PM2 cluster mode — corre N procesos Node (1 por CPU core). Cambio solo de deploy:
pm2 start dist/server.js -i max --name plprint-api
Multiplica throughput xN cores sin tocar código. Cuidado: tempStore.ts es memoria en proceso → rompe imports con múltiples instancias. Migrar a Redis (ver #3).
Pool Prisma — DATABASE_URL agrega ?connection_limit=20&pool_timeout=20. Ajustar según max_connections MySQL repartido entre instancias.
Rate limiter — hoy 500/15min global es bajo para POS activo. Subir límite global (ej 2000/15min) o aplicar límites por ruta: estricto solo en login, laxo en consultas. Considerar key por usuario (req.user.sub) en vez de IP.

## 2. Alto impacto, esfuerzo medio

Caché Redis para catálogos estáticos:
- productos (búsquedas POS), categorías, métodos de pago, configuración, unidades de medida
- invalidación en create/update/delete del service correspondiente
- reduce 60-80% queries en operación POS típica
tempStore → Redis — requerido si cluster PM2 (memoria compartida entre procesos). utils/tempStore.ts API ya definida; swap backend interno.
Índices DB — revisar con EXPLAIN queries calientes: búsqueda productos por nombre/codigo, ventas por fecha/sucursal, kardex por producto. Agregar índices faltantes en migration.

## 3. Mediano impacto
- Paginación obligatoria en listas grandes (productos, ventas) — verificar que frontend no pida "todos".
- select en vez de include completo en queries de listado — menos data por wire.
- Nginx reverse proxy delante: keepalive, gzip/brotli, cache de estáticos /uploads, buffer de conexiones lentas, TLS termination.
- MySQL tuning: innodb_buffer_pool_size ~60-70% RAM, max_connections coherent con pool total.
- Transactions cortas — venta completa (venta+detalle+kardex+inventario) revisar que $transaction no incluya llamadas lentas (Finkok futuro sí sería problema).

## 4. Escala mayor (si crece más)
- Read replicas MySQL para reportes/dashboard (no bloquean POS).
- Separar reportes pesados a worker/cola (BullMQ).
- Load balancer + múltiples servers si un VPS no basta.

## RECOMENDACIONES, FASES:
1. PM2 cluster + Redis tempStore + pool Prisma + rate limit por usuario
2. Caché Redis catálogos + índices DB + Nginx
3. Paginación + select optimización + MySQL tuning
4. Replicas + workers