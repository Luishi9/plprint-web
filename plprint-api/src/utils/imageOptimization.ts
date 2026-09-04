import sharp from 'sharp';

const MAX_DIMENSION = 512;
const WEBP_QUALITY = 80;

export interface OptimizedImage {
  buffer: Buffer;
  contentType: 'image/webp';
  extension: '.webp';
}

/**
 * Optimiza una imagen para web: respeta la orientacion EXIF, redimensiona
 * a un maximo de 512x512 (sin agrandar imagenes chicas) y convierte a WebP.
 * Las vistas del frontend muestran las imagenes a 32-48px (grid/tabla) y el
 * preview del uploader a ~160px, por lo que 512px cubre todo con margen.
 */
export async function optimizeImage(buffer: Buffer): Promise<OptimizedImage> {
  const optimized = await sharp(buffer)
    .rotate()
    .resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  return { buffer: optimized, contentType: 'image/webp', extension: '.webp' };
}
