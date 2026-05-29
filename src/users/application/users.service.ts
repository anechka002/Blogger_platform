import {CreateUserDto} from "../types/create-user.dto";
import {usersRepository} from "../repositories/users.repository";
import {IUserDB} from "../types/user.db.type";
import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";
import {UniqueFieldError} from "../../core/errors/unique-field.error";
import {bcryptService} from "../../auth/adapters/bcrypt.service";
import {argon2Service} from "../../auth/adapters/argon.service";

export const usersService = {
  async createUser(dto: CreateUserDto): Promise<string> {
    const { login, email, password } = dto;

    const passwordHash = await argon2Service.generateHash(password);

    const userByLogin = await usersRepository.findByLogin(login)
    if (userByLogin) {
      throw new UniqueFieldError('login','login should be unique')
    }

    const userByEmail = await usersRepository.findByEmail(email);
    if (userByEmail) {
      throw new UniqueFieldError('email','email should be unique')
    }

    const newUser: IUserDB = {
      login,
      email,
      passwordHash,
      createdAt: new Date(),
      emailConfirmation: {
        confirmationCode: '',
        expirationDate: new Date(),
        isConfirmed: true,
      }
    }
    return await usersRepository.create(newUser);
  },

  async deleteUser(id: string): Promise<boolean> {
    const userId = await usersRepository.findById(id)

    if (!userId) {
      throw new RepositoryNotFoundError('User not found')
    }

    return await usersRepository.delete(id)
  },

}
