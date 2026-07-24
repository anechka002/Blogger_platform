import mongoose, {HydratedDocument, Model, model} from "mongoose";
import {
  EmailConfirmation,
  IUserDB,
  PasswordRecovery
} from "../types/user.db.type";
import { addHours } from "date-fns";
import {randomUUID} from "node:crypto";
import {CreateUserParams} from "../types/create-user-params";

const emailConfirmationSchema = new mongoose.Schema<EmailConfirmation>({
  confirmationCode: {type: String, default: null},
  expirationDate: {type: Date, required: true},
  isConfirmed: {type: Boolean, required: true},
}, {_id: false});

const passwordRecoverySchema = new mongoose.Schema<PasswordRecovery>({
    recoveryCode: { type: String, default: null },
    expirationDate: { type: Date, default: null },
  }, {_id: false})

const userSchema = new mongoose.Schema<IUserDB>({
  login: {type: String, required: true, minlength: 1, maxlength: 100},
  email: {type: String, unique: true, required: true, minlength: 5, maxlength: 200},
  passwordHash: {type: String, required: true},
  emailConfirmation: {type: emailConfirmationSchema, required: true},
  passwordRecovery: { type: passwordRecoverySchema, required: true },
}, {timestamps: true});

class UserEntity {
  private constructor(
    public login: string,
    public email: string,
    public passwordHash: string,
    public emailConfirmation: EmailConfirmation,
    public passwordRecovery: PasswordRecovery,
  ) {}

  // Проверяет, что login, email и passwordHash не пустые
  private static validateCreateParams({login, email, passwordHash}: CreateUserParams): void {
    if(!login.trim()) {
      throw new Error('Login cannot be empty')
    }

    if(!email.trim()) {
      throw new Error('Email cannot be empty')
    }

    if(!passwordHash.trim()) {
      throw new Error('Password hash is required')
    }
  }

  // Пользователь регистрируется самостоятельно через /auth/registration
  static createForRegistration(params: CreateUserParams): UserDocument {
    this.validateCreateParams(params)

    const {login, email, passwordHash} = params;

    return new UserModel({
      login,
      email,
      passwordHash,
      emailConfirmation: {
        confirmationCode: randomUUID(),
        expirationDate: addHours(new Date(), 1),
        isConfirmed: false,
      },
      passwordRecovery: {
        recoveryCode: null,
        expirationDate: null,
      }
    })
  }

  // Администратор создаёт пользователя через POST /users
  static createByAdmin(params: CreateUserParams): UserDocument {
    this.validateCreateParams(params)

    const {login, email, passwordHash} = params;

    return new UserModel({
      login,
      email,
      passwordHash,
      emailConfirmation: {
        confirmationCode: '',
        expirationDate: new Date(),
        isConfirmed: true,
      },
      passwordRecovery: {
        recoveryCode: null,
        expirationDate: null,
      }
    })
  }

  confirmEmail(): void {
    // Переводим пользователя в подтверждённое состояние
    this.emailConfirmation.isConfirmed = true
    // Использованный код больше не должен применяться повторно
    this.emailConfirmation.confirmationCode = null
  }

  refreshEmailConfirmation(newConfirmationCode: string, newExpirationDate: Date): void {
    // Обновляем код подтверждения и срок его действия в состоянии пользователя
    this.emailConfirmation.confirmationCode = newConfirmationCode
    this.emailConfirmation.expirationDate = newExpirationDate
  }

  setPasswordRecovery(recoveryCode: string, expirationDate: Date): string {
    // сохранили это в БД
    this.passwordRecovery.recoveryCode = recoveryCode;
    this.passwordRecovery.expirationDate = expirationDate;

    return recoveryCode
  }

  completePasswordRecovery(newPasswordHash: string): void {
    // сохранили новый passwordHash
    this.passwordHash = newPasswordHash;

    // После успешной смены пароля код больше нельзя использовать повторно
    this.passwordRecovery.recoveryCode = null
    this.passwordRecovery.expirationDate = null
  }

}

interface UserMethods {
  confirmEmail(): void
  refreshEmailConfirmation(newConfirmationCode: string, newExpirationDate: Date): void
  setPasswordRecovery(recoveryCode: string, expirationDate: Date): string
  completePasswordRecovery(newPasswordHash: string): void
}

type UserStatics = typeof UserEntity;

type UserModel = Model<IUserDB, {}, UserMethods> & UserStatics

export type UserDocument = HydratedDocument<IUserDB, UserMethods>

userSchema.loadClass(UserEntity);

export const UserModel  = model<IUserDB, UserModel>('users', userSchema);