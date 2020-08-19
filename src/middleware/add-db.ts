import { Request, Response, NextFunction } from "express";
import { decodeBase64 } from "bcryptjs";
import { isConnected } from "../database/connect";

export function addDbMiddleware(req: Request, res: Response, next: NextFunction) {
    // if (!isConnected) {
    //     return next(Error('database has not yet connected'));
    // }
    req['db'] = req.app.get('db');
    next();
}
