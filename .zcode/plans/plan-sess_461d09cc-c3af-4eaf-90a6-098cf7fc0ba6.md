Activar flujo de imágenes en Supabase Storage + optimización con sharp

**Alcance backend (plprint-api):**

1. **Instalar `sharp`** (`npm i sharp`) — no está en dependencias.

2. **Nuevo `src/utils/imageOptimization.ts`**: función `optimizeImage(buffer)` que usa sharp: respeta orientación EXIF (`.rotate()`), redimensiona a máx 512×512 (`fit: 'inside', withoutEnlargement: true` — las vistas usan máx 48px y el preview ~160px, 512 cubre todo con margen), convierte a **WebP calidad 80** (soporta transparencia como PNG, ~15x más liviano). Devuelve `{ buffer, contentType: 'image/webp' }`.

3. **`src/utils/storage.ts`**: nueva función `uploadImage(pathPrefix, originalName, buffer, mimetype)` = optimiza + sube con extensión `.webp`. `uploadFile` queda intacto para el CSD (.cer/.key NO se tocan — no son imágenes y son sensibles para facturación).

4. **Controllers (cambios de 1 línea cada uno):**
   - `productos.controller.ts:41` (create) y `:70` (update): `uploadFile` → `uploadImage`.
   - `configuracion.controller.ts:49` (uploadLogo): `uploadFile` → `uploadImage`.
   - `uploadCsd` (:78) sigue con `uploadFile` tal cual.

5. **`.env`**: añadir sección Supabase con `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (comentadas como placeholders hasta que pegues tus claves) y `SUPABASE_STORAGE_BUCKET=plprint`. Sin las claves el server arranca normal; solo subir imagen dará error claro hasta completarlas.

6. **Build + restart**: `npm run build` y `pm2 restart plprint-api`.

7. **Verificación local**: script node que procesa con sharp una imagen existente de /uploads (ej. el PNG de 481KB) para confirmar la reducción real (~30KB esperado). El end-to-end (subir desde la UI) queda listo para cuando pegues las claves — te dejo también el curl para crear el bucket público `plprint` con tu service_role key, o lo creo yo vía API cuando me las des.

**Sin cambios**: frontend (`getImageUrl` ya maneja URLs http de Supabase), límite 5MB de multer, imágenes legacy de /uploads (siguen sirviéndose), Excel de insumos.

**Después de pegar las claves** (cuando las tengas): bucket público `plprint` en Supabase → Storage → New bucket, reinicio de PM2, y probar subir una imagen de producto desde la UI.