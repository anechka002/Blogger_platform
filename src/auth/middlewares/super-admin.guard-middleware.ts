import {Request, Response, NextFunction} from "express";
import {HttpStatus} from "../../core/types/http-statuses";

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'qwerty';

export const superAdminGuardMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers['authorization'] as string;

  if (!auth) {
    res.sendStatus(HttpStatus.Unauthorized_401)
    return
  }

  const [authType, token] = auth.split(' ')

  if (authType !== 'Basic') {
    res.sendStatus(HttpStatus.Unauthorized_401)
    return
  }

  const credentials = Buffer.from(token, 'base64').toString('utf-8')

  const [userName, password] = credentials.split(':')

  if(userName !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.sendStatus(HttpStatus.Unauthorized_401)
    return
  }

  next() // Успешная авторизация, продолжаем
}