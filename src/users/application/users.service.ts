import {CreateUserDto} from "../types/create-user.dto";
import {
  UsersRepository,
} from "../repositories/users.repository";
import {IUserDB} from "../types/user.db.type";
import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";
import {UniqueFieldError} from "../../core/errors/unique-field.error";
import {Argon2Service} from "../../auth/adapters/argon.service";

export class UsersService {
  protected usersRepository: UsersRepository
  protected argon2Service: Argon2Service
  constructor(repo: UsersRepository, argon2Service: Argon2Service) {
    this.usersRepository = repo;
    this.argon2Service = argon2Service;
  }

  async createUser(dto: CreateUserDto): Promise<string> {
    const { login, email, password } = dto;

    const passwordHash = await this.argon2Service.generateHash(password);

    const userByLogin = await this.usersRepository.findByLogin(login)
    if (userByLogin) {
      throw new UniqueFieldError('login','login should be unique')
    }

    const userByEmail = await this.usersRepository.findByEmail(email);
    if (userByEmail) {
      throw new UniqueFieldError('email','email should be unique')
    }

    const newUser = new IUserDB(
      login,
      email,
      passwordHash,
      new Date(),
      {
        confirmationCode: '',
        expirationDate: new Date(),
        isConfirmed: true,
      },
      {
        recoveryCode: null,
        expirationDate: null,
      }
    )

    return await this.usersRepository.create(newUser);
  }

  async deleteUser(id: string): Promise<boolean> {
    const userId = await this.usersRepository.findById(id)

    if (!userId) {
      throw new RepositoryNotFoundError('User not found')
    }

    return await this.usersRepository.delete(id)
  }

}
