import {CreateUserDto} from "../types/create-user.dto";
import {usersRepository} from "../repositories/users.repository";
import {IUserDB} from "../types/user.db.type";
import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";

export const usersService = {
  async create(dto: CreateUserDto): Promise<string> {
    const { login, email, password } = dto;
    const passwordHash = '123'

    const newUser: IUserDB = {
      login,
      email,
      passwordHash,
      createdAt: new Date(),
    }
    return await usersRepository.create(newUser);
  },

  async delete(id: string): Promise<boolean> {
    const userId = await usersRepository.findById(id)

    if (!userId) {
      throw new RepositoryNotFoundError('User not found')
    }

    return await usersRepository.delete(id)
  }
}
