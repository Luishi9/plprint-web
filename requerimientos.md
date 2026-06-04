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

[] Ventana de ajustes del sistema, donde se agregaran funciones como:
  - cambiar logo de la empresa
  - aplicar algun tipo de iva al costo de los productos
  - check para aplicar siempre ese iva o no
  - modificar informacion de los tickets, logo que saldra en los tickets, mensaje, formato de fecha y hora
[] Control de permisos basado en roles (RBAC)
  - ventana para crear o modificar roles existentes
  - asignar permisos y modulos a los que tendra ese rol
[] Control de acceso a los modulos del sistema:
  - dependiendo del rol asignar que modulos del sistema tendra acceso

Para el IVA, como quieres manejarlo?
IVA global unico
Para el RBAC, que nivel de granularidad quieres?
quiero el control de acceso a modulos completos con acciones basicas, pero esto solo para usuarios admin y a usuarios a los que se les asigne esta opcion
Que otras opciones te gustaria incluir en configuracion?
Datos de la empresa, Formato de moneda, Tipos de pago personalizados, Reportes y exportacion, Respaldo de datos, Notificaciones, Bitacora/Audit log




[] Ventas con pendiente de pago y abonos
[] Reportes de ventas (diarios, mensuales)
[] Exportación a Excel/PDF
[] Dashboard con métricas
[] Control de proveedores
[] Compras a proveedores
[] Devoluciones
[] Descuentos y promociones
[] Auditoría de acciones (logs de usuarios)


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

