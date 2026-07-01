import jwt from 'jsonwebtoken'
import {SETTINGS} from "../../core/settings/settings";
import {JWTPayloadWithUserId} from "../types/jwt-payload-with-userId.type";

export class JwtService {
  async createJWT(userId: string, deviceId: string): Promise<{accessToken: string, refreshToken: string}> {
    const accessToken = jwt.sign(
      { userId },
      SETTINGS.ACCESS_TOKEN_SECRET,
      { expiresIn: SETTINGS.ACCESS_TOKEN_TIME }
    )

    const refreshToken = jwt.sign(
      { userId, deviceId },
      SETTINGS.REFRESH_TOKEN_SECRET,
      { expiresIn: SETTINGS.REFRESH_TOKEN_TIME }
    )

    return {accessToken, refreshToken}
  }

  async verifyAccessToken(token: string): Promise<JWTPayloadWithUserId | null> {
    try {
      const result = jwt.verify(token, SETTINGS.ACCESS_TOKEN_SECRET) as JWTPayloadWithUserId;
      return result
    } catch(error: unknown) {
      console.log("Token verify some error", error)
      return null
    }
  }

  async verifyRefreshToken(refreshToken: string): Promise<JWTPayloadWithUserId | null> {
    try {
      return jwt.verify(refreshToken, SETTINGS.REFRESH_TOKEN_SECRET) as JWTPayloadWithUserId;
    } catch(error: unknown) {
      console.log("RefreshToken verify some error", error)
      return null
    }
  }

  async decodeJWT(token: string): Promise<JWTPayloadWithUserId | null> {
    try {
      return jwt.decode(token) as JWTPayloadWithUserId;
    } catch(error: unknown) {
      console.log("Can't decode token", error)
      return null
    }
  }
}

