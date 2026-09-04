import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { AppError, NotFoundError, ValidationError } from '../utils/errors';

const execFileAsync = promisify(execFile);

const BACKUP_DIR = path.join(process.cwd(), 'backups');

// En serverless no hay disco persistente ni mysqldump; Supabase provee backups propios.
const IS_SERVERLESS = !!process.env.VERCEL;

function assertNotServerless(): void {
  if (IS_SERVERLESS) {
    throw new AppError(
      'Los respaldos manuales no estan disponibles en este despliegue. Usa los backups automaticos del proveedor de base de datos (Supabase).',
      501,
      'NOT_AVAILABLE',
    );
  }
}

interface BackupInfo {
  filename: string;
  path: string;
  size: number;
  createdAt: Date;
}

interface ParsedDbUrl {
  user: string;
  password: string;
  host: string;
  port: string;
  database: string;
}

function parseDatabaseUrl(url: string): ParsedDbUrl {
  // Acepta postgres://user:pass@host[:port]/db y postgresql://...
  const regex = /^postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/([^?]+)/;
  const clean = decodeURIComponent(url);
  const match = clean.match(regex);
  if (!match) {
    throw new Error('DATABASE_URL invalida. Formato esperado: postgresql://user:pass@host[:port]/db');
  }
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4] ?? '5432',
    database: match[5],
  };
}

export class RespaldoService {
  private async ensureBackupDir(): Promise<void> {
    try {
      await fs.mkdir(BACKUP_DIR, { recursive: true });
    } catch (err) {
      // Ignorar si ya existe
    }
  }

  async generateBackup(): Promise<BackupInfo> {
    assertNotServerless();
    await this.ensureBackupDir();

    const dbConfig = parseDatabaseUrl(env.DATABASE_URL);
    const filename = `plprint_backup_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.sql`;
    const filePath = path.join(BACKUP_DIR, filename);

    // pg_dump portable: schema evita ownership del proveedor (Supabase u otro)
    const args = [
      '-h', dbConfig.host,
      '-p', dbConfig.port,
      '-U', dbConfig.user,
      '-d', dbConfig.database,
      '--no-owner',
      '--no-privileges',
      '-f', filePath,
    ];

    try {
      await execFileAsync('pg_dump', args, {
        env: { ...process.env, PGPASSWORD: dbConfig.password },
        maxBuffer: 16 * 1024 * 1024,
      });
    } catch (err: unknown) {
      const error = err as { stderr?: string; message?: string };
      const msg = error.stderr || error.message || 'Error desconocido';
      throw new Error(`Error ejecutando pg_dump: ${msg}. Requiere postgresql-client instalado.`);
    }

    const stats = await fs.stat(filePath);
    return {
      filename,
      path: filePath,
      size: stats.size,
      createdAt: stats.birthtime,
    };
  }

  async listBackups(): Promise<BackupInfo[]> {
    assertNotServerless();
    await this.ensureBackupDir();

    const files = await fs.readdir(BACKUP_DIR);
    const backups: BackupInfo[] = [];

    for (const file of files) {
      if (!file.endsWith('.sql')) continue;
      const filePath = path.join(BACKUP_DIR, file);
      try {
        const stats = await fs.stat(filePath);
        backups.push({
          filename: file,
          path: filePath,
          size: stats.size,
          createdAt: stats.birthtime,
        });
      } catch {
        // Ignorar archivos inaccesibles
      }
    }

    return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getBackupPath(filename: string): Promise<{ path: string; filename: string }> {
    assertNotServerless();
    if (!filename.endsWith('.sql') || filename.includes('..') || filename.includes('/')) {
      throw new ValidationError('Nombre de archivo invalido');
    }

    await this.ensureBackupDir();
    const filePath = path.join(BACKUP_DIR, filename);

    try {
      await fs.access(filePath);
    } catch {
      throw new NotFoundError('Respaldo');
    }

    return { path: filePath, filename };
  }

  async deleteBackup(filename: string): Promise<void> {
    assertNotServerless();
    if (!filename.endsWith('.sql') || filename.includes('..') || filename.includes('/')) {
      throw new ValidationError('Nombre de archivo invalido');
    }

    const filePath = path.join(BACKUP_DIR, filename);

    try {
      await fs.access(filePath);
    } catch {
      throw new NotFoundError('Respaldo');
    }

    await fs.unlink(filePath);
  }

  async getDatabaseStats(): Promise<{
    tablas: Array<{ nombre: string; registros: number }>;
    totalTablas: number;
  }> {
    const tablas = await prisma.$queryRaw<Array<Record<string, string>>>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name ASC
    `;

    const counts: Array<{ nombre: string; registros: number }> = [];
    for (const t of tablas) {
      const tableName = t.TABLE_NAME ?? t.table_name;
      if (!tableName) continue;
      try {
        const result = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
          `SELECT COUNT(*) as count FROM "${tableName}"`,
        );
        counts.push({ nombre: tableName, registros: Number(result[0]?.count ?? 0) });
      } catch {
        counts.push({ nombre: tableName, registros: -1 });
      }
    }

    return { tablas: counts, totalTablas: counts.length };
  }
}
