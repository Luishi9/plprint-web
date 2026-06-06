import { Request, Response, NextFunction } from 'express';
import * as service from '../services/preciosProducto.service';

export const getByProducto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getByProducto(Number(req.params.id));
    res.json({ data });
  } catch (e) { next(e); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.create(Number(req.params.id), req.body);
    res.status(201).json({ data });
  } catch (e) { next(e); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.update(Number(req.params.id), Number(req.params.precioId), req.body);
    res.json({ data });
  } catch (e) { next(e); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.remove(Number(req.params.id), Number(req.params.precioId));
    res.status(204).send();
  } catch (e) { next(e); }
};
