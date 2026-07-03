import {
  UsersRepository,
} from "../../users/repositories/users.repository";
import {ResultStatus} from "../../core/result/resultCode";
import {Result} from "../../core/result/result.type";
import {IUserDB} from "../../users/types/user.db.type";
import {add} from "date-fns";
import {randomUUID} from "node:crypto";
import {ILoginView} from "../types/login.view.type";
import {ISessionDB} from "../../devices/types/session.db.type";
import {Argon2Service} from "../adapters/argon.service";
import {JwtService} from "../adapters/jwt.service";
import {NodemailerService} from "../adapters/nodemailer.service";
import {
  DevicesSessionsRepository
} from "../../devices/repositories/devices-sessions.repository";
import {EmailTemplateManager} from "../infrastructure/email-template.manager";

export class AuthService {
  protected usersRepository: UsersRepository
  protected argon2Service: Argon2Service
  protected jwtService: JwtService
  protected nodemailerService: NodemailerService
  protected devicesSessionsRepository: DevicesSessionsRepository
  protected emailTemplateManager: EmailTemplateManager
  constructor(usersRepository: UsersRepository, argon2Service: Argon2Service, jwtService: JwtService, nodemailerService: NodemailerService, devicesSessionsRepository: DevicesSessionsRepository, emailTemplateManager: EmailTemplateManager) {
    this.usersRepository = usersRepository;
    this.argon2Service = argon2Service;
    this.jwtService = jwtService;
    this.nodemailerService = nodemailerService;
    this.devicesSessionsRepository = devicesSessionsRepository;
    this.emailTemplateManager = emailTemplateManager;
  }

  // Login пользователя
  async loginUser({loginOrEmail, password, deviceName, ip}:{loginOrEmail: string, password: string, deviceName: string, ip: string}): Promise<Result<ILoginView | null>> {
    // Ищем пользователя по login или email
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    // Если пользователь не найден — логин невозможен
    if (!user) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'loginOrEmail', message: 'Unauthorized' }],
      }
    }

    // Проверяем пароль: сравниваем обычный password из запроса с passwordHash из базы
    const isPasswordCorrect = await this.argon2Service.checkPassword(password, user.passwordHash)
    // Если пароль неверный — сессию и токены не создаём
    if (!isPasswordCorrect) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'password', message: 'Unauthorized' }],
      };
    }

    // Создаём уникальный id устройства/сессии.
    // Один login с одного браузера = одна device session.
    const deviceId = randomUUID();

    // Создаём accessToken и refreshToken.
    // В payload кладём userId и deviceId, чтобы потом понимать, какой пользователь и какая сессия делает refresh/logout.
    const tokens = await this.jwtService.createJWT(user._id.toString(), deviceId)

    // Декодируем refreshToken, чтобы достать iat и exp.
    // iat — когда токен создан.
    // exp — когда токен истекает.
    const payload = await this.jwtService.decodeJWT(tokens.refreshToken)
    // На всякий случай проверяем, что payload существует и внутри есть iat/exp.
    if(!payload || !payload.iat || !payload.exp) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Invalid token payload',
        extensions: [],
      }
    }

    // Создаём документ активной сессии устройства.
    // Эта запись показывает, что пользователь залогинен с конкретного браузера/устройства.
    const session: ISessionDB = {
      user_id: user._id.toString(),
      device_id: deviceId,
      // JWT хранит iat/exp в секундах, а new Date() ждёт миллисекунды, поэтому умножаем на 1000.
      iat: new Date(payload.iat * 1000),
      device_name: deviceName,
      ip,
      // Дата, когда refreshToken и эта session должны протухнуть
      exp: new Date(payload.exp * 1000)
    }

    // Сохраняем активную сессию устройства в БД.
    await this.devicesSessionsRepository.addSession(session)

    // Возвращаем токены handler-у
    return {
      status: ResultStatus.Success,
      data: tokens,
      extensions: [],
    };
  }

  // Регистрация пользователя
  async registerUser(login: string, email: string, password: string): Promise<Result<IUserDB | null>> {
    const userByLogin = await this.usersRepository.findByLogin(login);

    if (userByLogin) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'login', message: 'Already Registered' }],
      }
    }

    const userByEmail = await this.usersRepository.findByEmail(email);
    if (userByEmail) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'email', message: 'Already Registered' }],
      }
    }

    const passwordHash = await this.argon2Service.generateHash(password);

    const newUser: IUserDB = {
      login,
      email,
      passwordHash,
      createdAt: new Date(),
      emailConfirmation: {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 3
        }),
        isConfirmed: false
      },
      passwordRecovery: {
        recoveryCode: null,
        expirationDate: null,
      }
    }

    const result = await this.usersRepository.create(newUser);

    this.nodemailerService.sendEmail(
        newUser.email,
'Registration confirmation',
        this.emailTemplateManager.getRegistrationConfirmationTemplate(newUser.emailConfirmation.confirmationCode)
    ).catch(error => console.log('error in send email', error));

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: newUser
    }
  }

  // Подтверждает регистрацию пользователя по коду подтверждения
  async registrationConfirmation(code: string): Promise<Result<IUserDB | null>> {
    // Ищем пользователя, у которого emailConfirmation.confirmationCode === code
    const user = await this.usersRepository.findByConfirmationCode(code);

    // код не найден → 400
    if (!user) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ message: 'Confirmation code is incorrect', field: 'code' }],
      }
    }

    // email уже подтверждён → 400
    if(user.emailConfirmation.isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ message: 'Email already confirmed', field: 'code' }],
      }
    }

    // код истёк → 400
    if(user.emailConfirmation.expirationDate < new Date()) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ message: 'Confirmation code is expired', field: 'code', }],
      }
    }

    // Найди пользователя по id
    // и обнови ему:
    // emailConfirmation.isConfirmed = true
    const isConfirmed = await this.usersRepository.confirmEmail(user._id.toString())
    if (!isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ message: 'Email was not confirmed', field: 'emailConfirmation.isConfirmed' }],
      }
    }

    // после confirmEmail ещё раз найти пользователя
    const confirmedUser = await this.usersRepository.findById(user._id.toString())

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: confirmedUser
    }
  }

  // Повторно отправляет письмо для подтверждения регистрации
  async registrationEmailResending(email: string): Promise<Result<IUserDB | null>> {
    // Ищем user по email
    const userByEmail = await this.usersRepository.findByEmail(email);

    // Если user не найден → 400
    if (!userByEmail) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ message: 'Email is not registered', field: 'email' }],
      }
    }

    // Если user уже подтверждён → 400
    if (userByEmail.emailConfirmation.isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ message: 'Email already confirmed', field: 'email' }],
      }
    }

    // Генерируем новый confirmationCode
    const newConfirmationCode = randomUUID()

    // Генерируем новую expirationDate
    const newExpirationDate = add(new Date(), {hours: 1,minutes: 3})

    // Обновляем user в базе
    const isUpdated = await this.usersRepository.updateConfirmationCode(userByEmail._id.toString(), newConfirmationCode, newExpirationDate)
    if (!isUpdated) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ message: 'Confirmation code was not updated', field: 'email' }],
      }
    }

    // Отправляем новое письмо
    this.nodemailerService.sendEmail(
        userByEmail.email,
'Registration confirmation',
        this.emailTemplateManager.getRegistrationConfirmationTemplate(newConfirmationCode)
    ).catch(error => console.log('error in send email', error));

    // Возвращаем 204
    return {
      status: ResultStatus.Success,
      extensions: [],
      data: null
    }
  }

  // Обновляем пару токенов: выдаём новый accessToken и новый refreshToken для уже существующей device session
  async refreshToken({oldIat, userId, deviceId}: {userId: string, oldIat: Date, deviceId: string}): Promise<Result<ILoginView | null>> {
    // Ищем пользователя в базе по userId, который пришёл из middleware в req.user
    const user = await this.usersRepository.findById(userId);
    // Если пользователя нет — значит refresh делать нельзя
    if (!user) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'refreshToken', message: 'Unauthorized' }],
      }
    }

    // Создаём новую пару токенов.
    // deviceId оставляем тот же самый, потому что это всё ещё та же device session.
    const tokens = await this.jwtService.createJWT(user._id.toString(), deviceId);

    // Декодируем НОВЫЙ refreshToken, чтобы достать из него новые iat и exp.
    // iat — когда новый refreshToken создан
    // exp — когда новый refreshToken протухнет
    const payload = await this.jwtService.decodeJWT(tokens.refreshToken)

    // Если payload почему-то не достался, считаем, что refresh выполнить нельзя
    if (!payload) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [],
      }
    }

    // JWT хранит iat и exp в секундах, а Date работает с миллисекундами.
    const newIat = new Date(payload.iat * 1000)
    const newExp = new Date(payload.exp * 1000)

    // Обновляем старую device session в БД:
    // найти старую session по: userId + deviceId + oldIat и заменить в ней: iat → newIat и exp → newExp
    const isSessionsUpdate = await this.devicesSessionsRepository.updateSessionByDeviceIdAndIat({userId: user._id.toString(), deviceId, oldIat, newIat, newExp})

    // Если session не обновилась, значит старая session не найдена или уже неактуальна
    if(!isSessionsUpdate) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: "Session was not updated",
        extensions: [],
      }
    }

    // Если всё хорошо: session обновлена, новые токены можно вернуть клиенту
    return {
      status: ResultStatus.Success,
      data: tokens,
      extensions: [],
    };
  }

  // Logout пользователя: завершает текущую device session
  async logoutUser({userId, deviceId, oldIat}:{userId: string, deviceId: string, oldIat: Date}): Promise<Result<boolean | null>> {
    // Проверяем, что пользователь действительно существует
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'logout', message: 'Unauthorized' }],
      }
    }


    // Удаляем активную session текущего устройства.
    // Ищем именно по userId + deviceId + oldIat, чтобы удалить конкретную session, с которой пришёл refreshToken.
    const isSessionDeleted = await this.devicesSessionsRepository.deleteSession({userId: user._id.toString(), deviceId, oldIat})
    if(!isSessionDeleted) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'NotFound',
        extensions: [],
      }
    }

    // Возвращаем успешный результат
    return {
      status: ResultStatus.Success,
      data: true,
      extensions: [],
    };
  }

  async passwordRecovery(email: string): Promise<Result<null>> {
    // нашли user по email
    const userByEmail = await this.usersRepository.findByEmail(email);
    if (!userByEmail) {
      return {
        status: ResultStatus.NoContent,
        errorMessage: 'No Content',
        data: null,
        extensions: [],
      }
    }

    // создали recoveryCode
    const recoveryCode = randomUUID()

    // создали expirationDate
    const expirationDate = add(new Date(), { hours: 1, minutes: 3 })

    // сохранили это в БД
    await this.usersRepository.updatePasswordRecoveryCode(
      userByEmail._id.toString(),
      recoveryCode,
      expirationDate
    )

    // отправили письмо со ссылкой
    this.nodemailerService.sendEmail(
        userByEmail.email,
'Password recovery',
        this.emailTemplateManager.getPasswordRecoveryTemplate(recoveryCode)
    ).catch(error => console.log('error in send email', error));

    // вернули 204
    return {
      status: ResultStatus.NoContent,
      errorMessage: 'No Content',
      data: null,
      extensions: []
    }
  }

  async newPassword({newPassword, recoveryCode}: {newPassword: string, recoveryCode: string}): Promise<Result<null>> {
    // нашли user по recoveryCode
    const user = await this.usersRepository.findByRecoveryCode(recoveryCode)

    if (!user) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{field: 'recoveryCode', message: 'Recovery code is incorrect'}],
      }
    }

    // проверили expirationDate
    if(!user.passwordRecovery.expirationDate || user.passwordRecovery.expirationDate < new Date()) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{field: 'recoveryCode', message: 'Recovery code is expired'}],
      }
    }

    // захэшировали новый пароль
    const newPasswordHash = await this.argon2Service.generateHash(newPassword);

    // сохранили новый passwordHash и зачистили recoveryCode
    await this.usersRepository.updatePasswordHashAndClearRecoveryCode({userId: user._id.toString(), newPasswordHash})

    // вернули 204
    return {
      status: ResultStatus.NoContent,
      errorMessage: 'No Content',
      data: null,
      extensions: []
    }
  }
}

