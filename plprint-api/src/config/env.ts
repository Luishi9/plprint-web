import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ override: true });

const trimEnvValue = (value: unknown) =>
  typeof value === 'string' ? value.trim() : value;

const envSchema = z.object({
  NODE_ENV: z.preprocess(
    trimEnvValue,
    z.enum(['development', 'production', 'test'])
  ).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.preprocess(trimEnvValue, z.string().min(1, 'DATABASE_URL requerida')),
  JWT_SECRET: z.preprocess(
    trimEnvValue,
    z.string().min(16, 'JWT_SECRET debe tener al menos 16 caracteres')
  ),
  JWT_EXPIRES_IN: z.preprocess(trimEnvValue, z.string()).default('8h'),
  JWT_REFRESH_SECRET: z.preprocess(trimEnvValue, z.string().min(16)),
  JWT_REFRESH_EXPIRES_IN: z.preprocess(trimEnvValue, z.string()).default('7d'),
  ALLOWED_ORIGINS: z
    .preprocess(trimEnvValue, z.string())
    .transform((val) => val.split(',').map((origin) => origin.trim()).filter(Boolean)),
  UPLOAD_DIR: z.preprocess(trimEnvValue, z.string()).default('uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(5),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(500),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variables de entorno invalidas:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
