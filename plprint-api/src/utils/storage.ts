import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env';
import { AppError } from './errors';
import { optimizeImage } from './imageOptimization';

const BUCKET = env.SUPABASE_STORAGE_BUCKET;

let client: SupabaseClient | null = null;

function isSupabaseConfigured(): boolean {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Guarda el archivo en disco local (uploads/{pathPrefix}/...) y devuelve la
 * URL relativa servida por express.static. Se usa cuando Supabase Storage
 * no esta configurado — todo queda en el VPS.
 */
async function uploadLocal(
  pathPrefix: string,
  originalName: string,
  buffer: Buffer,
): Promise<string> {
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const dot = originalName.lastIndexOf('.');
  const ext = dot >= 0 ? originalName.slice(dot) : '';
  const dir = path.join(env.UPLOAD_DIR, pathPrefix);
  await fs.mkdir(dir, { recursive: true });
  const fileName = `${unique}${ext}`;
  await fs.writeFile(path.join(dir, fileName), buffer);
  return `/uploads/${pathPrefix}/${fileName}`;
}

function getClient(): SupabaseClient {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new AppError(
      'Almacenamiento no configurado: faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY',
      500,
    );
  }
  if (!client) {
    client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return client;
}

/**
 * Sube un archivo a Supabase Storage y retorna su URL publica.
 * pathPrefix: 'productos' | 'logo' | 'csd'
 */
export async function uploadFile(
  pathPrefix: string,
  originalName: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  if (!isSupabaseConfigured()) return uploadLocal(pathPrefix, originalName, buffer);

  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const dot = originalName.lastIndexOf('.');
  const ext = dot >= 0 ? originalName.slice(dot) : '';
  const objectPath = `${pathPrefix}/${unique}${ext}`;

  const { error } = await getClient()
    .storage.from(BUCKET)
    .upload(objectPath, buffer, { contentType, upsert: false });

  if (error) {
    throw new AppError(`Error al subir archivo: ${error.message}`, 500);
  }

  const { data } = getClient().storage.from(BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

/**
 * Optimiza una imagen (WebP, max 512px) y la sube al almacenamiento activo:
 * Supabase Storage si esta configurado, si no disco local (/uploads).
 * Solo para imagenes (productos, logo); el CSD usa uploadFile tal cual.
 */
export async function uploadImage(
  pathPrefix: string,
  originalName: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const optimized = await optimizeImage(buffer);
  const baseName = originalName.replace(/\.[^.]*$/, '') || 'imagen';
  return uploadFile(pathPrefix, `${baseName}${optimized.extension}`, optimized.buffer, optimized.contentType);
}
