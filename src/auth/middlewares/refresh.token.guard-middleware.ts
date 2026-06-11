import {NextFunction, Request, Response} from "express";
import {HttpStatus} from "../../core/types/http-statuses";
import {jwtService} from "../adapters/jwt.service";
import {
  refreshTokenBlacklistRepository
} from "../repositories/refresh-token-blacklist.repository";

export const refreshTokenGuardMiddleware = async(req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken

  if(!refreshToken) {
    return res.sendStatus(HttpStatus.Unauthorized_401)
  }

  const payload = await jwtService.verifyRefreshToken(refreshToken);
  if(!payload) {
    return res.sendStatus(HttpStatus.Unauthorized_401)
  }

  const isTokenBlackListed = await refreshTokenBlacklistRepository.isTokenBlackListed(refreshToken)
  if(isTokenBlackListed) {
    return res.sendStatus(HttpStatus.Unauthorized_401)
  }

  // console.log('cookies:', req.cookies)
  // console.log('refreshToken:', req.cookies.refreshToken)

  req.user = {
    userId: payload.userId,
  }

  next()
}