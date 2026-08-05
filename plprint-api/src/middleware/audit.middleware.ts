import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../services/auditLog.service';
import { JwtPayload } from '../utils/jwt';

const auditLogService = new AuditLogService();

/**
 * Middleware que registra la accion en audit_log despues de una respuesta exitosa.
 * Debe usarse DESPUES de authenticate.
 * Solo se registran respuestas con status < 400.
 *
 * @param modulo  modulo afectado (ej: 'auth', 'ventas', 'caja')
 * @param accion  accion realizada (ej: 'CREATE', 'LOGIN', 'APERTURAR')
 * @param descripcionFn  (opcional) funcion que recibe req y devuelve una frase legible en espanol.
 *                       Si no se pasa, se usa la plantilla por defecto segun modulo+accion.
 */
export const audit = (
  modulo: string,
  accion: string,
  descripcionFn?: (req: Request) => string | undefined,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalEnd = res.json.bind(res);

    res.json = function (data: unknown) {
      if (res.statusCode < 400) {
        const user = req.user as JwtPayload | undefined;
        const detalle = {
          method: req.method,
          path: req.originalUrl,
          params: req.params,
          body: sanitizarBody(req.body),
        };

        // 1) intentar frase custom
        // 2) si no, usar plantilla por defecto segun modulo+accion
        // 3) si no hay plantilla, dejar undefined
        let descripcion: string | undefined;
        try {
          descripcion = descripcionFn ? descripcionFn(req) : undefined;
        } catch {
          descripcion = undefined;
        }
        if (!descripcion) {
          descripcion = plantillaLegible(modulo, accion, req);
        }

        auditLogService
          .record({
            usuarioId: user?.sub ?? null,
            accion,
            modulo,
            descripcion,
            detalle,
            ip: req.ip,
          })
          .catch((err) => {
            // No fallar la peticion si la auditoria falla
            // eslint-disable-next-line no-console
            console.error('[audit] Error registrando log:', err);
          });
      }
      return originalEnd(data);
    };

    next();
  };
};

/**
 * Quita campos sensibles del body antes de registrar
 */
function sanitizarBody(body: Record<string, unknown>): Record<string, unknown> {
  if (!body || typeof body !== 'object') return {};
  const sanitized: Record<string, unknown> = { ...body };
  const camposSensibles = ['password', 'passwordHash', 'token', 'accessToken', 'refreshToken'];
  for (const campo of camposSensibles) {
    if (campo in sanitized) {
      sanitized[campo] = '***';
    }
  }
  return sanitized;
}

/**
 * Formatea un monto como moneda MXN simple
 */
function fmtMonto(n: unknown): string {
  const num = Number(n);
  if (isNaN(num)) return '';
  return `$${num.toFixed(2)}`;
}

/**
 * Plantillas legibles por defecto segun modulo+accion.
 * Usa datos del body/params cuando estan disponibles.
 */
function plantillaLegible(modulo: string, accion: string, req: Request): string | undefined {
  const body = (req.body || {}) as Record<string, unknown>;
  const params = (req.params || {}) as Record<string, string>;
  const key = `${modulo}.${accion}`;

  switch (key) {
    // AUTH
    case 'auth.LOGIN':
      return `Inicio de sesion${body.email ? ` (${body.email})` : ''}`;
    case 'auth.LOGOUT':
      return 'Cerro sesion';
    case 'auth.REFRESH':
      return 'Renovo token de sesion';

    // PRODUCTOS
    case 'productos.CREATE':
      return `Creo el producto "${body.nombre ?? ''}"`;
    case 'productos.UPDATE':
      return `Actualizo el producto #${params.id ?? ''}`;
    case 'productos.DELETE':
      return `Elimino el producto #${params.id ?? ''}`;
    case 'productos.IMPORT':
      return 'Importo catalogo de productos desde Excel';

    // VENTAS
    case 'ventas.CREATE':
      return `Registro una venta${body.total ? ` por ${fmtMonto(body.total)}` : ''}`;
    case 'ventas.CANCELAR':
      return `Cancelo la venta #${params.id ?? ''}`;

    // CAJA
    case 'caja.APERTURAR':
      return `Aperturo caja${body.monto_inicial !== undefined ? ` con ${fmtMonto(body.monto_inicial)}` : ''}`;
    case 'caja.CORTAR':
      return `Cerro caja${body.monto_final_real !== undefined ? ` (real ${fmtMonto(body.monto_final_real)})` : ''}`;
    case 'caja.INGRESO':
      return `Registro un ingreso de ${fmtMonto(body.monto)}`;
    case 'caja.GASTO':
      return `Registro un gasto de ${fmtMonto(body.monto)}`;
    case 'caja.RETIRO':
      return `Registro un retiro de ${fmtMonto(body.monto)}`;

    // INSUMOS
    case 'insumos.CREATE':
      return `Creo el insumo "${body.nombre ?? ''}"`;
    case 'insumos.UPDATE':
      return `Actualizo el insumo #${params.id ?? ''}`;
    case 'insumos.DELETE':
      return `Elimino el insumo #${params.id ?? ''}`;
    case 'insumos.AJUSTAR_STOCK':
      return `Ajusto stock del insumo #${body.insumoId ?? ''} (${body.tipo ?? ''} ${body.cantidad ?? ''})`;
    case 'insumos.IMPORT':
      return 'Importo catalogo de insumos desde Excel';

    // COMPRAS
    case 'compras.CREATE':
      return `Registro una compra${body.total ? ` por ${fmtMonto(body.total)}` : ''}`;
    case 'compras.IMPORT':
      return `Registro compras en lote${body.items && Array.isArray(body.items) ? ` (${body.items.length} items)` : ''}`;
    case 'compras.DELETE':
      return `Anulo la compra #${params.id ?? ''}`;

    // MERMAS
    case 'mermas.CREATE':
      return `Registro una merma${body.cantidad ? ` de ${body.cantidad} ${body.tipo ?? ''}` : ''}`;
    case 'mermas.UPDATE':
      return `Actualizo merma #${params.id ?? ''}`;
    case 'mermas.DELETE':
      return `Elimino merma #${params.id ?? ''}`;

    // ABONOS
    case 'abonos.CREATE':
      return `Registro un abono de ${fmtMonto(body.monto)} a la venta #${params.ventaId ?? ''}`;
    case 'abonos.DELETE':
      return `Elimino abono #${params.id ?? ''}`;

    // USUARIOS
    case 'usuarios.CREATE':
      return `Creo el usuario "${body.email ?? ''}"`;
    case 'usuarios.UPDATE':
      return `Actualizo el usuario #${params.id ?? ''}`;
    case 'usuarios.DELETE':
      return `Elimino el usuario #${params.id ?? ''}`;

    // PRODUCCION
    case 'produccion.CREATE':
      return `Creo orden de produccion${body.cantidad ? ` (${body.cantidad} uds)` : ''}`;
    case 'produccion.UPDATE':
      return `Actualizo orden de produccion #${params.id ?? ''}`;
    case 'produccion.CAMBIAR_ESTATUS':
      return `Cambio estatus de OP #${params.id ?? ''} a "${body.nuevoEstatus ?? ''}"`;
    case 'produccion.DELETE':
      return `Cancelo orden de produccion #${params.id ?? ''}`;

    default:
      return undefined;
  }
}
