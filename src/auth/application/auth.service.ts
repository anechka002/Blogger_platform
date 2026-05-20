import {usersRepository} from "../../users/repositories/users.repository";
import {bcryptService} from "../adapters/bcrypt.service";
import {UnauthorizedError} from "../../core/errors/unauthorized.error";

export const authService = {
  async loginUser(loginOrEmail: string, password: string): Promise<boolean> {
    const user = await usersRepository.findByLoginOrEmail(loginOrEmail);

    // console.log('user', user)
    // console.log('passwordHash', user?.passwordHash)

    if (!user) throw new UnauthorizedError()

    const isPasswordCorrect = await bcryptService.checkPassword(password, user.passwordHash)

    if (!isPasswordCorrect) throw new UnauthorizedError()

    return true
  },

}