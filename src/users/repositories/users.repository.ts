import {ObjectId, WithId} from "mongodb";
import {IUserDB} from "../types/user.db.type";
import {db} from "../../db/mongo.db";

export class UsersRepository {
  async findById(id: string): Promise<WithId<IUserDB> | null> {
    return db
      .getCollections()
      .userCollection.findOne({_id: new ObjectId(id)})
  }

  async create(user: IUserDB): Promise<string> {
    const newUser = await db
      .getCollections()
      .userCollection
      .insertOne(user);
    return newUser.insertedId.toString();
  }

  async delete(id: string): Promise<boolean> {
    const isDeleted = await db
      .getCollections()
      .userCollection.deleteOne({_id: new ObjectId(id)})

    return isDeleted.deletedCount === 1
  }

  async findByLogin(login: string): Promise<WithId<IUserDB> | null> {
    return await db
      .getCollections()
      .userCollection.findOne({login})
  }

  async findByEmail(email: string): Promise<WithId<IUserDB> | null> {
    return await db
      .getCollections()
      .userCollection.findOne({email})
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<IUserDB> | null> {
    return await db
      .getCollections()
      .userCollection.findOne({$or: [{ email: loginOrEmail }, { login: loginOrEmail }]})
  }

  // Существует ли по логину или адресу электронной почты
  async doesExistByLoginOrEmail(login: string, email: string): Promise<boolean> {
    const user = await db
      .getCollections()
      .userCollection.findOne({$or: [{ email: email }, { login: login }]})
    return !!user
  }

  // Найти пользователя по confirmationCode
  async findByConfirmationCode(code: string): Promise<WithId<IUserDB> | null> {
    return await db
    .getCollections()
    .userCollection.findOne({'emailConfirmation.confirmationCode': code})
  }

  // подтвердить email этому пользователю
  async confirmEmail(userId: string): Promise<boolean> {
    const result = await db
    .getCollections()
    .userCollection.updateOne(
      {_id: new ObjectId(userId)},
      {$set: { 'emailConfirmation.isConfirmed': true },}
    )

    return result.modifiedCount === 1
  }

  // Сохраняем новый confirmationCode и expirationDate для повторной отправки письма подтверждения.
  async updateConfirmationCode(userId: string, code: string, date: Date): Promise<boolean> {
    const result = await db
    .getCollections()
      .userCollection.updateOne(
        {_id: new ObjectId(userId)},
        {$set: {
          'emailConfirmation.confirmationCode': code,
          'emailConfirmation.expirationDate': date
        }},
      )
    return result.modifiedCount === 1
  }

  // Сохраняем новый recoveryCode и дату его истечения для восстановления пароля.
  async updatePasswordRecoveryCode(userId: string, recoveryCode: string, expirationDate: Date): Promise<boolean> {
    const result = await db
    .getCollections()
    .userCollection.updateOne(
      {_id: new ObjectId(userId)},
        {$set: {
            'passwordRecovery.recoveryCode': recoveryCode,
            'passwordRecovery.expirationDate': expirationDate
          }}
      )
    return result.modifiedCount === 1
  }

  // Находим пользователя по recoveryCode для восстановления пароля.
  async findByRecoveryCode(recoveryCode: string): Promise<WithId<IUserDB> | null> {
    return await db
      .getCollections()
      .userCollection.findOne({'passwordRecovery.recoveryCode': recoveryCode})
  }

  // Обновляет хэш пароля пользователя и очищает данные восстановления пароля, чтобы recoveryCode нельзя было использовать повторно.
  async updatePasswordHashAndClearRecoveryCode({userId, newPasswordHash}:{userId: string, newPasswordHash: string}): Promise<boolean> {
    const result = await db
      .getCollections()
      .userCollection.updateOne(
        {_id: new ObjectId(userId)},
        {$set: {
            passwordHash: newPasswordHash,
            'passwordRecovery.recoveryCode': null,
            'passwordRecovery.expirationDate': null
          }}
      )
    return result.modifiedCount === 1
  }
}