import { Request, Response, NextFunction } from "express";
import { isConnected } from "../database/connect";
import { db } from '../database/connect'

export function addDbMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!isConnected) {
        return next(Error('database has not yet connected'));
    }
    req['db'] = db;
    next();
}
