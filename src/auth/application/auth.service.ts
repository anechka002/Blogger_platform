import {UsersRepository,} from "../../users/repositories/users.repository";
import {ResultStatus} from "../../core/result/resultCode";
import {Result} from "../../core/result/result.type";
import {IUserDB} from "../../users/types/user.db.type";
import {randomUUID} from "node:crypto";
import {ILoginView} from "../types/login.view.type";
import {Argon2Service} from "../adapters/argon.service";
import {JwtService} from "../adapters/jwt.service";
import {NodemailerService} from "../adapters/nodemailer.service";
import {
  DevicesSessionsRepository
} from "../../devices/repositories/devices-sessions.repository";
import {EmailTemplateManager} from "../infrastructure/email-template.manager";
import {inject, injectable} from "inversify";
import {UserDocument, UserModel} from "../../users/domain/user.entity";
import {DeviceModel} from "../../devices/domain/device.entity";
import {CreateUserDto} from "../../users/types/create-user.dto";
import {addHours} from "date-fns";

@injectable()
export class AuthService {
  protected usersRepository: UsersRepository
  protected argon2Service: Argon2Service
  protected jwtService: JwtService
  protected nodemailerService: NodemailerService
  protected devicesSessionsRepository: DevicesSessionsRepository
  protected emailTemplateManager: EmailTemplateManager
  constructor(
    @inject(UsersRepository) usersRepository: UsersRepository,
    @inject(Argon2Service) argon2Service: Argon2Service,
    @inject(JwtService) jwtService: JwtService,
    @inject(NodemailerService) nodemailerService: NodemailerService,
    @inject(DevicesSessionsRepository) devicesSessionsRepository: DevicesSessionsRepository,
    @inject(EmailTemplateManager) emailTemplateManager: EmailTemplateManager
  ) {
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
    const session = new DeviceModel (
      {
        user_id: user._id.toString(),
        device_id: deviceId,
        // JWT хранит iat/exp в секундах, а new Date() ждёт миллисекунды, поэтому умножаем на 1000.
        iat: new Date(payload.iat * 1000),
        device_name: deviceName,
        ip,
        // Дата, когда refreshToken и эта session должны протухнуть
        exp: new Date(payload.exp * 1000)
      }
    )

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
  async registerUser(dto: CreateUserDto): Promise<Result<UserDocument | null>> {
    const { login, email, password } = dto;

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

    const user = UserModel.createForRegistration({login, email, passwordHash})

    await this.usersRepository.save(user);

    this.nodemailerService.sendEmail(
      user.email,
'Registration confirmation',
        this.emailTemplateManager.getRegistrationConfirmationTemplate(user.emailConfirmation.confirmationCode)
    ).catch(error => console.log('Failed to send registration confirmation email', error));

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: user
    }
  }

  // Подтверждает регистрацию пользователя по коду подтверждения
  async registrationConfirmation(code: string): Promise<Result<UserDocument | null>> {
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

    // После успешных проверок меняем состояние пользователя
    user.confirmEmail()

    // сохраняем изменения в MongoDB
    await this.usersRepository.save(user)

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: user
    }
  }

  // Повторно отправляет письмо для подтверждения регистрации
  async registrationEmailResending(email: string): Promise<Result<IUserDB | null>> {
    // Ищем user по email
    const user = await this.usersRepository.findByEmail(email);

    // Если user не найден → 400
    if (!user) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ message: 'Email is not registered', field: 'email' }],
      }
    }

    // Если user уже подтверждён → 400
    if (user.emailConfirmation.isConfirmed) {
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
    const newExpirationDate = addHours(new Date(), 1)

    // Обновляем код подтверждения и срок его действия у найденного пользователя в памяти
    user.refreshEmailConfirmation(newConfirmationCode, newExpirationDate)

    // Сохраняем обновлённый confirmationCode и новую expirationDate в MongoDB
    await this.usersRepository.save(user)

    // Отправляем новое письмо
    try {
      this.nodemailerService.sendEmail(
        user.email,
        'Registration confirmation',
        this.emailTemplateManager.getRegistrationConfirmationTemplate(newConfirmationCode))
    } catch (error: unknown) {
      console.log('Failed to send registration confirmation email', error)

      return {
        status: ResultStatus.ServerError,
        errorMessage: 'Internal Server Error',
        data: null,
        extensions: [],
      }
    }

//     // Отправляем новое письмо
//     this.nodemailerService.sendEmail(
//         user.email,
// 'Registration confirmation',
//         this.emailTemplateManager.getRegistrationConfirmationTemplate(newConfirmationCode)
//     ).catch(error => console.log('error in send email', error));

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

    // найти старую session по: userId + deviceId + oldIat
    const session = await this.devicesSessionsRepository.findByDeviceIdAndIat({userId: user._id.toString(), deviceId, oldIat})

    // Если session нет, значит старая session не найдена или уже неактуальна
    if (!session) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Session not found',
        extensions: [],
      }
    }

    // Обновляем старую device session в БД
    session.iat = newIat
    session.exp = newExp

    await this.devicesSessionsRepository.save(session)

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
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
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
    const expirationDate = addHours(new Date(), 1)

    user.setPasswordRecovery(recoveryCode, expirationDate)

    await this.usersRepository.save(user)

    // отправили письмо со ссылкой
    this.nodemailerService.sendEmail(
        user.email,
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

    let newPasswordHash: string

    try {
      // Хешируем новый пароль внешним сервисом
      newPasswordHash = await this.argon2Service.generateHash(newPassword);
    } catch (error: unknown) {
      console.error('Failed to generate password hash during password recovery', error)

      return {
        status: ResultStatus.ServerError,
        errorMessage: 'Internal Server Error',
        data: null,
        extensions: [],
      }
    }

    // Проверяем срок действия восстановления, меняем пароль и очищаем использованный код
    user.completePasswordRecovery(newPasswordHash)

    await this.usersRepository.save(user)

    // вернули 204
    return {
      status: ResultStatus.NoContent,
      errorMessage: 'No Content',
      data: null,
      extensions: []
    }
  }
}

