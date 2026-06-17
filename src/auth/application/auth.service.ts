import {usersRepository} from "../../users/repositories/users.repository";
import {argon2Service} from "../adapters/argon.service";
import {jwtService} from "../adapters/jwt.service";
import {ResultStatus} from "../../core/result/resultCode";
import {Result} from "../../core/result/result.type";
import {IUserDB} from "../../users/types/user.db.type";
import {add} from "date-fns";
import {randomUUID} from "node:crypto";
import {nodemailerService} from "../adapters/nodemailer.service";
import {ILoginView} from "../types/login.view.type";
import {
  refreshTokenBlacklistRepository
} from "../repositories/refresh-token-blacklist.repository";
import {
  IRefreshTokenBlacklistDB
} from "../types/refresh-token-blacklist.db.type";

export const authService = {
  // Login пользователя
  async loginUser(loginOrEmail: string, password: string): Promise<Result<ILoginView | null>> {
    const user = await usersRepository.findByLoginOrEmail(loginOrEmail);

    // console.log('user: ', user)
    // console.log('passwordHash: ', user?.passwordHash)

    if (!user) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'loginOrEmail', message: 'Unauthorized' }],
      }
    }

    const isPasswordCorrect = await argon2Service.checkPassword(password, user.passwordHash)

    if (!isPasswordCorrect) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'password', message: 'Unauthorized' }],
      };
    }

    const tokens = await jwtService.createJWT(user._id.toString())

    return {
      status: ResultStatus.Success,
      data: tokens,
      extensions: [],
    };
  },

  // Регистрация пользователя
  async registerUser(login: string, email: string, password: string): Promise<Result<IUserDB | null>> {
    const userByLogin = await usersRepository.findByLogin(login);

    if (userByLogin) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'login', message: 'Already Registered' }],
      }
    }

    const userByEmail = await usersRepository.findByEmail(email);
    if (userByEmail) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'email', message: 'Already Registered' }],
      }
    }

    const passwordHash = await argon2Service.generateHash(password);

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
      }
    }

    const result = await usersRepository.create(newUser);

    nodemailerService.sendEmail(
      newUser.email,
      'Registration confirmation',
      `<h1>Thank you for registration</h1>
       <p>To finish registration, please confirm your email:</p>
       <p>Your confirmation code:</p>
       <p>${newUser.emailConfirmation.confirmationCode}</p>
       <a href="https://some-front.com/confirm-registration?code=${newUser.emailConfirmation.confirmationCode}">
         Confirm email
       </a>`
    ).catch(error => console.log('error in send email', error));

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: newUser
    }
  },

  // Подтверждает регистрацию пользователя по коду подтверждения
  async registrationConfirmation(code: string): Promise<Result<IUserDB | null>> {
    // Ищем пользователя, у которого emailConfirmation.confirmationCode === code
    const user = await usersRepository.findByConfirmationCode(code);

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
    const isConfirmed = await usersRepository.confirmEmail(user._id.toString())
    if (!isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ message: 'Email was not confirmed', field: 'emailConfirmation.isConfirmed' }],
      }
    }

    // после confirmEmail ещё раз найти пользователя
    const confirmedUser = await usersRepository.findById(user._id.toString())

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: confirmedUser
    }
  },

  // Повторно отправляет письмо для подтверждения регистрации
  async registrationEmailResending(email: string): Promise<Result<IUserDB | null>> {
    // Ищем user по email
    const userByEmail = await usersRepository.findByEmail(email);

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
    const isUpdated = await usersRepository.updateConfirmationCode(userByEmail._id.toString(), newConfirmationCode, newExpirationDate)
    if (!isUpdated) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ message: 'Confirmation code was not updated', field: 'email' }],
      }
    }

    // Отправляем новое письмо
    nodemailerService.sendEmail(
      userByEmail.email,
      'Registration confirmation',
      `<p>${newConfirmationCode}</p>
       <a href="https://some-front.com/confirm-registration?code=${newConfirmationCode}">
         Confirm email
       </a>`
    ).catch(error => console.log('error in send email', error));

    // Возвращаем 204
    return {
      status: ResultStatus.Success,
      extensions: [],
      data: null
    }
  },

  // Обновляем пару токенов: выдаём новый accessToken и новый refreshToken
  async refreshToken(userId: string, oldRefreshToken: string): Promise<Result<ILoginView | null>> {
    // Ищем пользователя в базе по userId, который пришёл из middleware
    const user = await usersRepository.findById(userId);
    if (!user) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'refreshToken', message: 'Unauthorized' }],
      }
    }

    const tokens = await jwtService.createJWT(user._id.toString())

    const payload = await jwtService.verifyRefreshToken(oldRefreshToken)
    if (!payload) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [],
      }
    }

    const refreshToken: IRefreshTokenBlacklistDB = {
      token: oldRefreshToken,
      userId,
      createdAt: new Date(),
      expiresDate: new Date(payload.exp * 1000)
    }

    await refreshTokenBlacklistRepository.addTokenToBlackList(refreshToken)

    return {
      status: ResultStatus.Success,
      data: tokens,
      extensions: [],
    };
  },

  // Logout пользователя
  async logoutUser({userId, oldRefreshToken}:{userId: string, oldRefreshToken: string}): Promise<Result<boolean | null>> {
    // Ищем пользователя в базе по userId, который пришёл из middleware
    const user = await usersRepository.findById(userId);
    if (!user) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'logout', message: 'Unauthorized' }],
      }
    }

    // Проверяем, лежит ли этот refresh token уже в blacklist
    const isBlacklisted = await refreshTokenBlacklistRepository.isTokenBlackListed(oldRefreshToken)
    if(isBlacklisted) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'logout', message: 'Unauthorized' }],
      }
    }

    // Проверяем сам refresh token:
    // валидная ли подпись, не истёк ли срок жизни
    const payload = await jwtService.verifyRefreshToken(oldRefreshToken)
    if (!payload) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [],
      }
    }

    // Проверяем, что userId из middleware совпадает с userId внутри refresh token.
    // Если не совпадает — значит токен не принадлежит этому пользователю.
    if(payload.userId !== userId) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [],
      }
    }

    // Создаём документ, который положим в blacklist
    const refreshToken: IRefreshTokenBlacklistDB = {
      token: oldRefreshToken,
      userId,
      createdAt: new Date(),
      expiresDate: new Date(payload.exp * 1000)
    }


    // Добавляем старый refresh token в blacklist
    // После этого им уже нельзя будет сделать refresh
    await refreshTokenBlacklistRepository.addTokenToBlackList(refreshToken)

    // Возвращаем успешный результат
    return {
      status: ResultStatus.Success,
      data: true,
      extensions: [],
    };
  }

}
