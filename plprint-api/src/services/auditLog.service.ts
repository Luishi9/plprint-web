import { Request } from 'express';
import { prisma } from '../config/database';
import { JwtPayload } from '../utils/jwt';

interface RecordAuditParams {
  usuarioId: number | null;
  accion: string;
  modulo: string;
  descripcion?: string;
  detalle?: Record<string, unknown>;
  ip?: string;
}

export class AuditLogService {
  async record(params: RecordAuditParams) {
    return prisma.audit_log.create({
      data: {
        usuario_id: params.usuarioId,
        accion: params.accion,
        modulo: params.modulo,
        descripcion: params.descripcion,
        detalle: params.detalle ? JSON.stringify(params.detalle) : null,
        ip: params.ip,
      },
    });
  }

  async recordFromRequest(req: Request, accion: string, modulo: string, detalleExtra?: Record<string, unknown>, descripcion?: string) {
    const user = req.user as JwtPayload | undefined;
    const detalle = {
      method: req.method,
      path: req.originalUrl,
      params: req.params,
      query: req.query,
      ...(detalleExtra || {}),
    };

    return this.record({
      usuarioId: user?.sub ?? null,
      accion,
      modulo,
      descripcion,
      detalle,
      ip: req.ip,
    });
  }

  async findAll(filters: {
    usuarioId?: number;
    modulo?: string;
    accion?: string;
    desde?: Date;
    hasta?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (filters.usuarioId) where.usuario_id = filters.usuarioId;
    if (filters.modulo) where.modulo = filters.modulo;
    if (filters.accion) where.accion = filters.accion;
    if (filters.desde || filters.hasta) {
      where.created_at = {};
      if (filters.desde) (where.created_at as Record<string, Date>).gte = filters.desde;
      if (filters.hasta) (where.created_at as Record<string, Date>).lte = filters.hasta;
    }

    const [total, data] = await Promise.all([
      prisma.audit_log.count({ where }),
      prisma.audit_log.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          usuarios: { select: { id: true, nombre: true, email: true } },
        },
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number) {
    const log = await prisma.audit_log.findUnique({
      where: { id },
      include: {
        usuarios: { select: { id: true, nombre: true, email: true } },
      },
    });
    if (!log) {
      const { NotFoundError } = await import('../utils/errors');
      throw new NotFoundError('Registro de auditoría');
    }
    return log;
  }

  async getEstadisticas() {
    const [total, porModulo, porAccion, ultimos7Dias] = await Promise.all([
      prisma.audit_log.count(),
      prisma.audit_log.groupBy({
        by: ['modulo'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.audit_log.groupBy({
        by: ['accion'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.audit_log.count({
        where: {
          created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return {
      total,
      ultimos_7_dias: ultimos7Dias,
      por_modulo: porModulo.map((m) => ({ modulo: m.modulo, total: m._count.id })),
      por_accion: porAccion.map((a) => ({ accion: a.accion, total: a._count.id })),
    };
  }
}
