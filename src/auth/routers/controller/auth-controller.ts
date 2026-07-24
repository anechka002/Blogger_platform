import { inject, injectable } from 'inversify';

import {
  RequestWithBody,
  RequestWithUserId
} from "../../../core/types/request-types";
import {LoginDto} from "../../types/login.dto";
import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {
  resultCodeToHttpException
} from "../../../core/result/resultCodeToHttpException";
import {ResultStatus} from "../../../core/result/resultCode";
import { AuthService} from "../../application/auth.service";
import {IMeView} from "../../types/me.view";
import {
  UsersQueryRepository
} from "../../../users/repositories/users.query.repository";
import {RegistrationDto} from "../../types/registration.dto";
import {
  RegistrationConfirmationDto
} from "../../types/registration-confirmation.dto";
import {
  RegistrationEmailResendingDto
} from "../../types/registration-email-resending.dto";
import {PasswordRecoveryDto} from "../../types/password-recovery.dto";
import {NewPasswordDto} from "../../types/new-password.dto";

@injectable()
export class AuthController {
  protected authService: AuthService
  protected usersQueryRepository: UsersQueryRepository
  constructor(
    @inject(AuthService) authService: AuthService,
    @inject(UsersQueryRepository) usersQueryRepository: UsersQueryRepository
  ) {
    this.authService = authService;
    this.usersQueryRepository = usersQueryRepository;
  }

  async login(req: RequestWithBody<LoginDto>, res: Response) {
    // Достаём login/email и password из body запроса
    const { loginOrEmail, password } = req.body;

    // Достаём название устройства/браузера из заголовка User-Agent.
    // Если заголовка нет, сохраняем "unknown".
    const deviceName = req.headers['user-agent'] ?? 'unknown';

    // x-forwarded-for может быть нужен, если приложение стоит за proxy/nginx/render/vercel.
    // Там может прийти строка с несколькими IP через запятую.
    const forwardedFor = req.headers["x-forwarded-for"];

    // Берём первый IP из x-forwarded-for, если он есть.
    // Если его нет, берём IP из socket.
    const ip = typeof forwardedFor === "string"
      ? forwardedFor.split(',')[0].trim()
      : req.socket.remoteAddress

    // Если IP не смогли определить, возвращаем 400
    if(!ip) {
      return res.sendStatus(HttpStatus.BadRequest_400)
    }

    // Передаём в service данные для логина + данные текущего устройства
    const result = await this.authService.loginUser({loginOrEmail, password, ip, deviceName})

    // Если service вернул ошибку, мапим ResultStatus в HTTP status
    if(result.status !== ResultStatus.Success) {
      return res.status(resultCodeToHttpException(result.status)).send(result.status)
    }

    // Кладём refreshToken в httpOnly cookie.
    res.cookie('refreshToken', result.data?.refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 2 * 60 * 1000 }) // 2 min

    // accessToken отдаём в body ответа
    return res.status(HttpStatus.Ok_200).send({accessToken: result.data?.accessToken});
  }

  async me(req: RequestWithUserId, res: Response<IMeView>) {
    const userId = req.user?.userId
    if (!userId) {
      return res.sendStatus(HttpStatus.Unauthorized_401)
    }

    const me = await this.usersQueryRepository.findMeById(userId);
    if (!me) {
      return res.sendStatus(HttpStatus.Unauthorized_401);
    }

    return res.status(HttpStatus.Ok_200).send(me)
  }

  async registration(req: RequestWithBody<RegistrationDto>, res: Response) {
    const result = await this.authService.registerUser(req.body);

    if(result.status !== ResultStatus.Success) {
      return res.status(resultCodeToHttpException(result.status)).send(result.extensions);
    }

    return res.sendStatus(HttpStatus.NoContent_204)
  }

  async registrationConfirmation(req: RequestWithBody<RegistrationConfirmationDto>, res: Response) {
    const {code} = req.body

    const result = await this.authService.registrationConfirmation(code);

    if(result.status !== ResultStatus.Success) {
      return res.status(resultCodeToHttpException(result.status)).send({errorsMessages: result.extensions})
    }

    return res.sendStatus(HttpStatus.NoContent_204)
  }

  async registrationEmailResending(req: RequestWithBody<RegistrationEmailResendingDto>, res: Response) {
    const {email} = req.body;

    const result = await this.authService.registrationEmailResending(email);

    if(result.status !== ResultStatus.Success) {
      return res.status(resultCodeToHttpException(result.status)).send({errorsMessages: result.extensions})
    }

    return res.sendStatus(HttpStatus.NoContent_204)
  }

  async refreshToken(req: Request, res: Response) {
    // Данные текущей device session, полученные после успешной проверки refreshToken.
    const userId = req.user?.userId
    const oldIat = req.user?.iat
    const deviceId = req.user?.deviceId

    // Если каких-то данных не хватает, обновить токены невозможно.
    if (!userId || !oldIat || !deviceId) {
      return res.sendStatus(HttpStatus.Unauthorized_401)
    }

    // Вызывает service для создания новой пары токенов. Service обновляет текущую device session в БД.
    const result = await this.authService.refreshToken({userId, deviceId, oldIat})

    // Если service вернул ошибку, мапим ResultStatus в HTTP status
    if(result.status !== ResultStatus.Success) {
      return res.status(resultCodeToHttpException(result.status)).send(result.status)
    }

    // Новый refreshToken сохраняется в cookie.
    res.cookie('refreshToken', result.data?.refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 2 * 60 * 1000 }) // 2 min

    // Новый accessToken возвращается в body ответа.
    return res.status(HttpStatus.Ok_200).send({accessToken: result.data?.accessToken})
  }

  async logout(req: Request, res: Response) {
    // Эти данные положил refreshTokenGuardMiddleware
    const userId = req.user?.userId
    const deviceId = req.user?.deviceId
    const oldIat = req.user?.iat

    // Если каких-то данных нет — значит guard не смог нормально авторизовать запрос
    if(!userId || !oldIat || !deviceId) {
      return res.sendStatus(HttpStatus.Unauthorized_401)
    }

    // Передаём в service данные текущей session, которую нужно завершить
    const result = await this.authService.logoutUser({userId, oldIat, deviceId})

    // Если service вернул ошибку, мапим ResultStatus в HTTP status
    if(result.status !== ResultStatus.Success) {
      return res.status(resultCodeToHttpException(result.status)).send(result.status)
    }

    // Зачищаем cookies
    res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'strict', path: '/' })

    return res.sendStatus(HttpStatus.NoContent_204)
  }

  async passwordRecovery(req: RequestWithBody<PasswordRecoveryDto>, res: Response) {
    const {email} = req.body

    const result = await this.authService.passwordRecovery(email)

    if(result.status !== ResultStatus.NoContent) {
      return res.status(resultCodeToHttpException(result.status)).send(result.extensions)
    }

    return res.sendStatus(HttpStatus.NoContent_204)
  }

  async newPassword(req: RequestWithBody<NewPasswordDto>, res: Response) {
    const {newPassword, recoveryCode} = req.body

    const result = await this.authService.newPassword({newPassword, recoveryCode})

    if(result.status !== ResultStatus.NoContent) {
      return res.status(resultCodeToHttpException(result.status)).send(result.extensions)
    }

    return res.sendStatus(HttpStatus.NoContent_204)
  }
}
