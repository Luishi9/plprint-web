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

  1. categoria de gastos, seccion para dar de alta lista de gastos y registrar estos, restandolos a los ingresos totales del dia en caso de tener gastos ese mismo dia
  2. Control de proveedores, seccion para dar de alta lista de proveedoress
  3. unidades de medida

  4. cotizaciones: este modulo permitira que cuando se este realizando una venta se pueda guardar esta como
      una cotizacion en caso de que no se quiera realizar la compra por parte del cliente, permitiendo 
      guardarla y exportarla como PDF, al guardarla se visualizara en la seccion de cotizaciones, 
      dentro de la vista de ventas en la parte superior derecha se moestrar aun boton "Venta desde Cotizacion"
      al dar click mostrara una lista de las cotizaciones donde se podra seleccionar una y automaticamente se pondran los productos listos para la venta (la busqueda de cotizaciones tiene filtros de busqueda, por nombre del cliente, por fecha, por usuario vendedor que ralizo la cotizacion "eso solo lo ve el admin", y por folio de cotizacion o ticket)
  5. boton mermas con dos subopciones "mermas productos", "mermas insumos", donde cada una tendra la vista donde estara una tabla donde se visualizara la lista de todas las mermas dadas de alta, con botones de "agregar" agregar merma, "exportar" exportar excel del listado de las mermas echas, y filtro de fechas inicio - fin este sirve para buscar mermas en ese radio de fechas y para exportar los datos en el excel
  6. Maquinas, poder agregar mi maquina de impresion, donde se dara de alta el nombre de la impresora, y tener un contador de las impresiones realizadas del dia a dia con esa impresora o impresoras. dame una sugerencia de como podriamos enlazar los procutos con categoria "Impresion" a la impresora y poder hacer el conteo de las impresiones.

  tambien tener en cuenta las mermas, cuando se registre una venta poder dar de alta mermas desde ahi ya que puede que por alguna razon salgan mal las impresiones, obvio se tendria que aun asi registrar esa impresion al contador de la impresora

  7. reportes, donde se podra obtener los reportes de: ventas vs ingresos, cuentas por cobrar, gastos

  8. produccion, donde se podran tener el proceso de creacion de un producto, como productos que tienen un proceso de maquila o productos que tienen varios pasos de ralizacion. tendra las opciones de pasos:
  pendientes, en diseño, en produccion, acabados, terminados y entregados. 
  Los productos que entran a esta seccion son los que tengan la categoria de produccion.
  entre cada paso se pueden agregar indicaciones, una indicacion para cada paso.
  cuando entra un producto a produccion, entra como estado pendiente, despues de revisarlo el usuario podra agregar los comentarios y despues cuando vea correcto pasarlo a estado de diseño, despues de eso el usuario checaria el diseño o indicaciones sobre el diseño o indicaciones que tenga el producto lo puede pasar a estado Produccion, despues de checar el usuario que el producto salio y esta correcto al salir del produccion lo pasa a estado de Acabados, al finalizar el usuario los acabados podra pasarlo a estado Terminado, y para finalizar pasarlo a estado Entregado cuando se le entregue al cliente.

  9. boton con subopciones de: 
  1. Caja: dentro de caja, se tendra todo lo de poder hacer un corte de caja, visualizar el historial de ventas realizadas durante todo el dia con fecha, usuario que realizo la venta, si fue ingreso o descuento de ingresos, total pagado, metodo de pago con el que se realizo, sucursal donde se realizo esta venta o gasto.
  Opciones de botones que abra en esta vista:
  - registrar gasto
  - Registrar ingreso
  - Registrar retiro (ejemplo para cuando se hace un pequeño corte de caja a medio dia)
  - Realizar corte
  - Reimprimir corte
  - Filtro de fecha, sucursal, usuario que realizo venta

  2. Ingresos/Gastos, donde podremos ver un historico o informacion de tallada de estos
  3. Ventas/Utilidades, donde podremos ver nuestras utilidades respecto a las ventas, y mas informacion que creas conveniente que sea importante en esta seccion
  

[] agregar la opcion de cancelar ventas desde la vista de ventas, asi como un check para mostrar unicamente el listado de las ventas canceladas

[] Ventas con pendiente de pago y abonos, agregar el check de mostrar ventas con pendiente de pago en la vista de ventas

[] en donde entraria esos modulos, en la seccion de navegacion o administracion del sidebar?

[] cuando se de alta de insumo o aumentar cantidad de insumos, registrarlo como una compra, 
    con opcion de registrar el proveedor
[] Devoluciones
[] Auditoría de acciones (logs de usuarios)


1. agregar, medio mayoreo, mayoreo, super mayoreo

2. aplicar descuento global o especifico a un cliente dado de alta, por categoria de productos, 
    descuento por porcentajes.

3. [x] en venta agregar manual la cantidad de impresiones o productos

4. excel de los reportes

5. [x] cambiar la categoria de impresion a produccion a los productos que entran a produccion

6. [] unidades de medida, jalar las que se dan de alta no las que estan fijas
