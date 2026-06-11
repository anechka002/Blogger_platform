import {db} from "../../db/mongo.db";
import {
  IRefreshTokenBlacklistDB
} from "../types/refresh-token-blacklist.db.type";

export const refreshTokenBlacklistRepository = {
  async addTokenToBlackList(refreshToken: IRefreshTokenBlacklistDB):  Promise<void> {
    const token = await db
      .getCollections()
      .refreshTokenBlacklistCollection.insertOne(refreshToken)

  },

  async isTokenBlackListed(refreshToken: string): Promise<boolean> {
    const token = await db
      .getCollections()
      .refreshTokenBlacklistCollection.findOne({token: refreshToken})

    return !!token
  }
}