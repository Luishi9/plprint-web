import dotenv from 'dotenv';
import app from '../src/app';

// En serverless (Vercel) las env vars las inyecta la plataforma;
// dotenv cubre desarrollo local.
dotenv.config({ override: true });

export default app;
