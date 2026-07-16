import {injectable} from "inversify";
import {UserDocument, UserModel} from "../domain/user.entity";

@injectable()
export class UsersRepository {
  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id)
  }

  async save(user: UserDocument): Promise<string> {
    await user.save()
    return user._id.toString()
  }

  async delete(id: string): Promise<UserDocument | null> {
    return UserModel.findByIdAndDelete(id)
  }

  async findByLogin(login: string): Promise<UserDocument | null> {
    return UserModel.findOne({ login })
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email })
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    return UserModel.findOne({$or: [{ email: loginOrEmail }, { login: loginOrEmail }]})
  }

  // Найти пользователя по confirmationCode
  async findByConfirmationCode(code: string): Promise<UserDocument | null> {
    return UserModel.findOne({'emailConfirmation.confirmationCode': code})
  }

  // Находим пользователя по recoveryCode для восстановления пароля.
  async findByRecoveryCode(recoveryCode: string): Promise<UserDocument | null> {
    return UserModel.findOne({'passwordRecovery.recoveryCode': recoveryCode})
  }

  // Существует ли по логину или адресу электронной почты
  async doesExistByLoginOrEmail(login: string, email: string): Promise<boolean> {
    const user = await UserModel.exists({$or: [{ email: email }, { login: login }]})
    return !!user
  }

}