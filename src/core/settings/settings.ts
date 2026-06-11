import dotenv from 'dotenv'
import {SignOptions} from "jsonwebtoken";

dotenv.config()

export const SETTINGS =  {
  PORT: process.env.PORT || 5001,
  MONGO_URL: process.env.MONGO_URL || 'mongodb://0.0.0.0:27017',
  DB_NAME: process.env.DB_NAME || 'blogger_platform',

  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string, // Secret key для access token.
  ACCESS_TOKEN_TIME: process.env.ACCESS_TOKEN_TIME as SignOptions['expiresIn'], // Время жизни access token.

  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string, // Secret key для refresh token.
  REFRESH_TOKEN_TIME: process.env.REFRESH_TOKEN_TIME as SignOptions['expiresIn'], // // Время жизни refresh token.

  DB_TYPE: process.env.DB_TYPE, // Тип базы данных.

  EMAIL: process.env.EMAIL as string, // Email, с которого приложение будет отправлять письма.
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD as string, // Пароль/ app password от почты для отправки писем.
}
