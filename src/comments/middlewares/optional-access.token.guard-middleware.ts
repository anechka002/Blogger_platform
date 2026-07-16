import {JwtService} from "../../auth/adapters/jwt.service";
import {NextFunction, Request, Response} from "express";

// Функция сначала принимает экземпляр JwtService, а затем возвращает обычную Express middleware.
// Благодаря этому JwtService передаётся извне через Dependency Injection.
export const optionalAccessTokenMiddleware = (jwtService: JwtService) => {
  return async (req: Request, res: Response, next: NextFunction) => {

    // Достаём заголовок Authorization из HTTP-запроса.
    const authorization = req.headers.authorization;

    // Если заголовка Authorization вообще нет, пользователь считается неавторизованным.
    if (!authorization) {
      return next()
    }

    // Разделяем строку Authorization по пробелу.
    //
    // Например:
    // "Bearer eyJhbGciOi..."
    //
    // scheme получит "Bearer",
    // token получит сам JWT-токен.
    const [scheme, token] = authorization.split(' ');

    // Если вместо Bearer пришло другое слово или сам токен отсутствует, считаем пользователя неавторизованным.
    // Ошибку 401 не возвращаем, потому что endpoint публичный.
    if (scheme !== 'Bearer' || !token) {
      return next()
    }

    // Проверяем access-токен через JwtService.
    const payload = await jwtService.verifyAccessToken(token)

    // Если токен валидный и внутри payload есть userId, сохраняем информацию о пользователе в req.user.
    // После этого контроллер сможет получить userId: req.user?.userId
    if (payload?.userId) {
      req.user = {userId: payload.userId}
    }

    // В любом случае передаём запрос дальше.
    return next()
  }
}