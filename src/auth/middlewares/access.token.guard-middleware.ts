import {NextFunction, Request, Response} from "express";
import {HttpStatus} from "../../core/types/http-statuses";
import {jwtService} from "../adapters/jwt.service";

export const accessTokenGuardMiddleware = async (req: Request, res: Response, next: NextFunction) => {

  if(!req.headers.authorization) {
    return res.sendStatus(HttpStatus.Unauthorized_401);
  }

  const [authType, token] = req.headers.authorization.split(' ');

  if (authType !== 'Bearer') {
    return res.sendStatus(HttpStatus.Unauthorized_401);
  }

  const payload = await jwtService.verifyAccessToken(token);

  if(payload) {

    req.user = {userId: payload.userId};
    next()

    return
  }

  res.sendStatus(HttpStatus.Unauthorized_401);

  return
}
