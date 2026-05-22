import jwt from 'jsonwebtoken'
import {SETTINGS} from "../../core/settings/settings";

export const jwtService = {
  async createJWT(userId: string): Promise<string> {
    return jwt.sign(
      { userId },
      SETTINGS.ACCESS_TOKEN_SECRET,
      { expiresIn: SETTINGS.ACCESS_TOKEN_TIME }
    )
  },

  async decodeJWT(token: string): Promise<any> {
    try {
      return jwt.decode(token);
    } catch(error: unknown) {
      console.log("Can't decode token", error)
      return null
    }
  },

  async verifyJwt(token: string): Promise<{userId: string} | null> {
    try {
      const result = jwt.verify(token, SETTINGS.ACCESS_TOKEN_SECRET) as {userId: string};
      return result
    } catch(error: unknown) {
      console.log("Token verify some error", error)
      return null
    }
  }
}
