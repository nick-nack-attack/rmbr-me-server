import { Request, Response, NextFunction } from "express";
import { isConnected } from "../database/connect";
import { db } from '../database/connect'

export function addDbMiddleware(req: Request, res: Response, next: NextFunction) {
    req['db'] = db;
    next();
}
