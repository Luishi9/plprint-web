# PlPrint - Sistema de Gestión de Inventario y Ventas

[![Netlify Status](https://api.netlify.com/api/v1/badges/a51d046d-deae-4e50-8b13-9f81f9985fbc/deploy-status)](https://app.netlify.com/projects/plprint/deploys)

Aplicación web moderna para gestión de inventario, productos, clientes y ventas.

## 🚀 Inicio Rápido

### Frontend (React + Vite)
```bash
cd plprint-web
npm install
npm run dev       # Desarrollo
npm run build     # Producción
```

### Backend (Node.js + Express)
```bash
cd plprint-api
npm install
npm run dev       # Desarrollo
npm run build     # Producción
```

## 📱 Despliegue

- **Frontend**: Desplegado en [Netlify](https://plprint.netlify.app/)
- **Backend**: Requiere despliegue en servidor externo (Vercel, DigitalOcean, AWS, etc.)

## 🔧 Configuración

### Variables de Entorno Frontend

Crear `.env.production` en `plprint-web/`:
```env
VITE_API_URL=https://tu-api-url.com/api/v1
```

### Variables de Entorno Backend

Configurar en `.env` de `plprint-api/`:
```env
DATABASE_URL=mysql://user:pass@host:3306/db
JWT_SECRET=your_secret_key
ALLOWED_ORIGINS=https://plprint.netlify.app,https://tu-api-url.com
```

## 📚 Estructura del Proyecto

```
plprint/
├── plprint-web/       # Frontend React + Vite
│   ├── src/
│   ├── public/
│   ├── vite.config.ts
│   ├── netlify.toml   # Configuración de Netlify
│   └── package.json
├── plprint-api/       # Backend Node.js + Express
│   ├── src/
│   ├── prisma/        # ORM Prisma
│   ├── package.json
│   └── .env           # Variables de entorno
└── README.md
```

## 🔐 Seguridad

- JWT para autenticación
- CORS configurado para dominios autorizados
- Rate limiting habilitado
- Variables de entorno protegidas

## 📄 Licencia

Privado
