import 'dotenv/config';
import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './config/database';

const PORT = env.PORT;

async function bootstrap() {
  try {
    await prisma.$connect();
    logger.info('Conexion a base de datos establecida');

    app.listen(PORT, () => {
      logger.info(`Servidor corriendo en puerto ${PORT} [${env.NODE_ENV}]`);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor', error);
    process.exit(1);
  }
}

bootstrap();

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  logger.info('Servidor detenido');
  process.exit(0);
});
