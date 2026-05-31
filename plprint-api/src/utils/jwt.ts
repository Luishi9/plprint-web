import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  sub: number;            // usuario id
  email: string;
  rolId: number;
  sucursales: number[];
  tokenVersion: number;   // se incrementa al cerrar sesión
}

// Sin expiración: el token es válido hasta que el usuario cierre sesión
export const signAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.JWT_SECRET);

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, env.JWT_SECRET) as unknown as JwtPayload;

// Refresh token ya no es necesario, pero se mantiene por compatibilidad
export const signRefreshToken = (payload: Pick<JwtPayload, 'sub'>): string =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET);

export const verifyRefreshToken = (token: string): Pick<JwtPayload, 'sub'> =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as unknown as Pick<JwtPayload, 'sub'>;
