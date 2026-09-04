import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

const TTL_MS = 30 * 60 * 1000;

// Limpieza probabilistica de expirados (1 de cada 50 escrituras).
// Evita bloquear el hot path con un delete pesado en cada set.
async function cleanupExpired(): Promise<void> {
  try {
    await prisma.temp_store.deleteMany({
      where: { expires_at: { lt: new Date() } },
    });
  } catch {
    // cleanup best-effort
  }
}

export async function setTemp<T>(key: string, data: T): Promise<void> {
  const expiresAt = new Date(Date.now() + TTL_MS);
  await prisma.temp_store.upsert({
    where: { key },
    create: { key, data: data as Prisma.InputJsonValue, expires_at: expiresAt },
    update: { data: data as Prisma.InputJsonValue, expires_at: expiresAt },
  });
  if (Math.random() < 0.02) void cleanupExpired();
}

export async function getTemp<T>(key: string): Promise<T | null> {
  const entry = await prisma.temp_store.findUnique({ where: { key } });
  if (!entry) return null;
  if (entry.expires_at.getTime() < Date.now()) {
    await prisma.temp_store.delete({ where: { key } }).catch(() => {});
    return null;
  }
  return entry.data as T;
}

export async function deleteTemp(key: string): Promise<void> {
  await prisma.temp_store.delete({ where: { key } }).catch(() => {});
}
