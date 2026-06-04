import { prisma } from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export class AbonosService {
  async findByVenta(ventaId: number) {
    return prisma.ventas_abonos.findMany({
      where: { venta_id: ventaId },
      orderBy: { fecha: 'desc' },
      include: { usuarios: { select: { id: true, nombre: true } } },
    });
  }

  /**
   * Registra un abono a una venta pendiente.
   * Descuenta automáticamente del saldo_pendiente.
   * Si saldo llega a 0, marca venta como 'pagada'.
   */
  async registrar(ventaId: number, dto: { monto: number; metodo_pago: string; notas?: string; usuario_id?: number }) {
    return prisma.$transaction(async (tx) => {
      const venta = await tx.ventas.findUnique({ where: { id: ventaId } });
      if (!venta) throw new NotFoundError('Venta');
      if (venta.estado_pago === 'pagada') throw new ConflictError('La venta ya está pagada');
      const saldoActual = Number(venta.saldo_pendiente);
      if (dto.monto > saldoActual) throw new ConflictError(`El monto (${dto.monto}) supera el saldo pendiente (${saldoActual})`);

      const abono = await tx.ventas_abonos.create({
        data: {
          venta_id: ventaId,
          ...(dto.usuario_id && { usuario_id: dto.usuario_id }),
          monto: new Prisma.Decimal(dto.monto),
          metodo_pago: dto.metodo_pago,
          ...(dto.notas && { notas: dto.notas }),
        },
      });

      const nuevoSaldo = saldoActual - dto.monto;
      const nuevoEstado = nuevoSaldo <= 0.001 ? 'pagada' : 'parcial';

      await tx.ventas.update({
        where: { id: ventaId },
        data: {
          saldo_pendiente: new Prisma.Decimal(Math.max(0, nuevoSaldo)),
          estado_pago: nuevoEstado,
        },
      });

      return { abono, nuevoSaldo, nuevoEstado };
    });
  }

  async remove(id: number) {
    return prisma.$transaction(async (tx) => {
      const ab = await tx.ventas_abonos.findUnique({ where: { id } });
      if (!ab) throw new NotFoundError('Abono');
      const venta = await tx.ventas.findUnique({ where: { id: ab.venta_id } });
      if (!venta) throw new NotFoundError('Venta');

      const nuevoSaldo = Number(venta.saldo_pendiente) + Number(ab.monto);
      const nuevoEstado = nuevoSaldo >= Number(venta.total) ? 'pendiente' : 'parcial';

      await tx.ventas.update({
        where: { id: venta.id },
        data: { saldo_pendiente: new Prisma.Decimal(nuevoSaldo), estado_pago: nuevoEstado },
      });
      await tx.ventas_abonos.delete({ where: { id } });
      return { nuevoSaldo, nuevoEstado };
    });
  }
}
