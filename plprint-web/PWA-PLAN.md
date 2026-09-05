# Plan PWA para plprint-web (pendiente de implementación)

> Plan aprobado en diseño, guardado para implementación futura (2026-09-04).
> Alcance decidido con el usuario: **Instalable + offline shell** (nivel POS-seguro).
> Ventas offline queda como **fase 2** aparte.

---

## Objetivo

Convertir el frontend (React 18 + Vite 5) en una PWA instalable:

- Se instala en celular/desktop (ícono en home screen, abre fullscreen como app nativa).
- Sin internet: la app abre, se ve el menú y la UI, con banner "sin conexión".
- Los **datos siempre requieren conexión** — sin caché de `/api`. En un POS nunca
  se deben mostrar precios/stock viejos; offline simplemente se bloquea operar
  con un mensaje claro.
- Se cachean offline: shell de la app (JS/CSS/HTML), fuentes (hoy caen offline),
  Material Symbols (ya es local) e imágenes de productos (Supabase `/uploads`).

## Estado actual verificado (lineamientos para la implementación)

- **Build/deploy**: SPA estática en Netlify (`publish: dist`). Dos `netlify.toml`:
  - Raíz del monorepo (`/var/www/plprint/netlify.toml`): `base = "plprint-web"`, sin headers de cache.
  - `plprint-web/netlify.toml`: `/*` con `max-age=0, must-revalidate` y `/assets/*` immutable 1 año.
  - **No requieren cambios**: Netlify sirve todo con revalidación por defecto, así
    que `sw.js` siempre queda fresco (must-revalidate).
- **index.html** (`plprint-web/index.html`): tiene favicon + viewport + CSP meta +
  título "PLPrint — POS & Inventario". **Falta**: `theme-color`,
  `apple-touch-icon`, metas iOS. El plugin PWA inyecta el manifest y el registro del SW.
- **public/**: solo `favicon.png` (450×450 RGBA). No hay manifest ni SW.
- **Logo fuente para íconos**: `src/assets/logo.png` (656×676 RGB). El login usa
  este logo estático; sidebar/tickets usan `empresa_logo_url` de BD (dinámico).
- **Vite**: 5.4.8, solo plugin `@vitejs/plugin-react`, proxy `/api` y `/uploads` → `localhost:3006` en dev.
- **Auth**: zustand `persist` en **sessionStorage** (`plprint-auth`) → el token
  sobrevive al reload en la misma pestaña, **no** a pestaña nueva/reinicio.
  `ProtectedRoute` solo lee `isAuthenticated` (no llama `/auth/me`) → el shell
  renderiza offline. Único fetch de bootstrap: `GET /configuracion` (falla
  silenciosamente offline — configStore captura el error).
- **Fuentes**: Material Symbols **local** (bundle Vite, offline-safe ✔). Fuentes de
  texto (Orbitron/Rajdhani) son **externas** (fonts.googleapis.com, importadas en
  `src/index.css:1` y `src/pages/auth/LoginPage.css:1`) → **se rompen offline**,
  el runtimeCaching las arregla.
- **Sin manejo offline**: cero usos de `navigator.onLine` / listeners online-offline en `src`.
- **Colores de marca**: teal `#2e9e9b`, tema claro por defecto (fondo blanco).

## Cambios a implementar (solo plprint-web; backend sin cambios)

### 1. Dependencia

```bash
cd plprint-web
npm i -D vite-plugin-pwa   # compatible con Vite 5 (peer ^5 || ^6 || ^7; si hay conflicto usar 0.21.x)
```

### 2. Íconos (generar una vez, con sharp ya instalado en plprint-api)

Desde `src/assets/logo.png` generar en `plprint-web/public/`:

- `pwa-192x192.png`
- `pwa-512x512.png`
- `pwa-maskable-512x512.png` (con padding para safe-zone de ~80%, fondo blanco)
- `apple-touch-icon.png` (180×180)

### 3. `vite.config.ts` — agregar plugin

```ts
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.png', 'apple-touch-icon.png'],
  manifest: {
    name: 'PLPrint — POS & Inventario',
    short_name: 'PLPrint',
    description: 'Punto de venta e inventario multi-sucursal',
    lang: 'es',
    theme_color: '#2e9e9b',
    background_color: '#ffffff',
    display: 'standalone',
    start_url: '/',
    icons: [
      { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
    navigateFallback: 'index.html',
    // CRÍTICO: nunca interceptar rutas de datos ni imágenes servidas por la API
    navigateFallbackDenylist: [/^\/api\//, /^\/uploads\//],
    runtimeCaching: [
      // Fuentes de texto (Google Fonts) — hoy se rompen offline
      { urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/, handler: 'CacheFirst',
        options: { cacheName: 'google-fonts-styles', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } } },
      { urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/, handler: 'CacheFirst',
        options: { cacheName: 'google-fonts-webfonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [200] } } },
      // Imágenes de productos: Supabase Storage y /uploads legacy del API
      { urlPattern: /\/uploads\/|supabase\.co\/storage\//, handler: 'CacheFirst',
        options: { cacheName: 'imagenes-productos', expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 }, cacheableResponse: { statuses: [200] } } },
    ],
    // SIN runtimeCaching para /api — los datos nunca se sirven de caché
  },
  devOptions: { enabled: false }, // en dev el proxy/HMR no convive bien con SW
})
```

### 4. `index.html` — metas nuevas (el plugin inyecta manifest + registro SW)

```html
<meta name="theme-color" content="#2e9e9b" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
```

### 5. Banner offline (2 archivos nuevos, mínimo, mismo lenguaje visual)

- `src/hooks/useOnlineStatus.ts`: `useState(navigator.onLine)` + listeners
  `online`/`offline` de window.
- `src/components/layout/OfflineBanner.tsx`: barra fija arriba, visible solo
  cuando `!online`: "Sin conexión — no se pueden procesar ventas hasta
  recuperar la red". Montar en `App.tsx` encima de `AppRoutes`.

### 6. Verificación

1. `npm run build` (incluye `tsc`) → comprobar en `dist/`:
   `manifest.webmanifest`, `sw.js`, `workbox-*.js` y que `sw.js` contenga la
   denylist de `/api/` y `/uploads/`.
2. `npm run preview` + `curl` a `/, /sw.js, /manifest.webmanifest` (200).
3. Aceptación visual (installable): Lighthouse PWA audit en el deploy, o
   Chrome DevTools → Application → Manifest / Service Workers.
4. Efecto real tras el próximo deploy de Netlify; en el VPS se puede verificar
   con `vite preview` antes.

## Limitaciones conocidas / Fase 2

- **Token en sessionStorage**: pestaña nueva sin conexión pide login (no hay
  token). Si se quisiera sesión persistente offline → pasar authStore a
  localStorage (decisión de seguridad, analizar aparte).
- **`navigator.onLine`** solo detecta interfaz de red activa, no alcanzabilidad
  del API (LAN sin backend se ve "online"). Suficiente para v1.
- **Ventas offline (fase 2)**: IndexedDB + cola de sincronización + conflictos
  de stock entre sucursales + folios. Fase grande, separada.
- Duplicidad de `netlify.toml` (raíz vs plprint-web): confirmar cuál usa el
  sitio de Netlify; hoy ambos funcionan sin cambios para la PWA.
