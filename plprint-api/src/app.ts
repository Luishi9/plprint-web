import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';

import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler.middleware';
import { rateLimiter } from './middleware/rateLimiter.middleware';
import router from './routes';

const app = express();

// --- Confiar en el proxy (nginx) para obtener IP real del cliente ---
app.set('trust proxy', 1);

// --- Seguridad ---
app.use(helmet());
app.use(cors({
  origin: env.ALLOWED_ORIGINS,
  credentials: true,
}));

// --- Performance ---
app.use(compression());

// --- Parsing ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Logging HTTP ---
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// --- Archivos estaticos (imagenes de productos) ---
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// --- Rate limiting global ---
app.use('/api', rateLimiter);

// --- Rutas ---
app.use('/api/v1', router);

// --- Health check ---
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Manejo centralizado de errores ---
app.use(errorHandler);

export default app;
