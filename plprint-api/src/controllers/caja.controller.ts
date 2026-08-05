import { Request, Response, NextFunction } from 'express';
import { CajaService } from '../services/caja.service';
import { sendSuccess, sendCreated, buildPaginationMeta } from '../utils/response';

export class CajaController {
  constructor(private cajaService: CajaService) {}

  getEstado = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sucursalId = Number(req.query.sucursalId) || req.user?.sucursales[0] || 0;
      const estado = await this.cajaService.findEstado(sucursalId);
      sendSuccess(res, estado);
    } catch (err) { next(err); }
  };

  aperturar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = {
        ...req.body,
        usuario_id: req.user!.sub,
      };
      const result = await this.cajaService.aperturar(dto);
      sendCreated(res, result);
    } catch (err) { next(err); }
  };

  realizarCorte = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = {
        ...req.body,
        usuario_id: req.user!.sub,
      };
      const result = await this.cajaService.realizarCorte(dto);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  };

  getMovimientos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const sucursalId = Number(req.query.sucursalId) || req.user?.sucursales[0] || 0;
      const usuarioId = req.query.usuarioId ? Number(req.query.usuarioId) : undefined;
      const corteId = req.query.corteId ? Number(req.query.corteId) : undefined;

      const { data, total, resumen } = await this.cajaService.findMovimientos({
        sucursalId, usuarioId, corteId, page, limit,
      });
      sendSuccess(res, data, 200, {
        ...buildPaginationMeta(total, page, limit),
        ...(resumen ? {
          totalVentas: resumen.total_ventas,
          totalIngresos: resumen.total_ingresos,
          totalGastos: resumen.total_gastos,
          totalRetiros: resumen.total_retiros,
          totalEfectivoVentas: resumen.total_efectivo_ventas,
          totalAbonosEfectivo: resumen.total_abonos_efectivo,
          efectivoEsperado: resumen.efectivo_esperado,
          montoInicial: resumen.monto_inicial,
          ventasPorMetodoPago: resumen.ventas_por_metodo_pago,
        } : {}),
      });
    } catch (err) { next(err); }
  };

  getCortes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const sucursalId = Number(req.query.sucursalId) || req.user?.sucursales[0] || 0;

      const { data, total } = await this.cajaService.findAllCortes({ sucursalId, page, limit });
      sendSuccess(res, data, 200, buildPaginationMeta(total, page, limit));
    } catch (err) { next(err); }
  };

  getCorteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const corte = await this.cajaService.findCorteById(Number(req.params.id));
      sendSuccess(res, corte);
    } catch (err) { next(err); }
  };

  getCorteReimprimir = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.cajaService.findMovimientosByCorteId(Number(req.params.id));
      sendSuccess(res, result);
    } catch (err) { next(err); }
  };

  getCorteReporteMaquinas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.cajaService.getReporteMaquinasByCorte(Number(req.params.id));
      sendSuccess(res, result);
    } catch (err) { next(err); }
  };

  getCorteReporteCategoriasImpresion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.cajaService.getReporteCategoriasImpresionByCorte(Number(req.params.id));
      sendSuccess(res, result);
    } catch (err) { next(err); }
  };

  registrarIngreso = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = {
        ...req.body,
        usuario_id: req.user!.sub,
        tipo: 'ingreso' as const,
      };
      const result = await this.cajaService.registarMovimientoCaja(dto);
      sendCreated(res, result);
    } catch (err) { next(err); }
  };

  registrarGasto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = {
        ...req.body,
        usuario_id: req.user!.sub,
        tipo: 'gasto' as const,
      };
      const result = await this.cajaService.registarMovimientoCaja(dto);
      sendCreated(res, result);
    } catch (err) { next(err); }
  };

  registrarRetiro = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = {
        ...req.body,
        usuario_id: req.user!.sub,
        tipo: 'retiro' as const,
      };
      const result = await this.cajaService.registarMovimientoCaja(dto);
      sendCreated(res, result);
    } catch (err) { next(err); }
  };
}
