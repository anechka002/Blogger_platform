import jwt from 'jsonwebtoken'
import {SETTINGS} from "../../core/settings/settings";

export const jwtService = {
  async createJWT(userId: string): Promise<string> {
    const token = jwt.sign(
      { userId },
      SETTINGS.ACCESS_TOKEN_SECRET,
      { expiresIn: SETTINGS.ACCESS_TOKEN_TIME }
    )

    return token
  },
}
