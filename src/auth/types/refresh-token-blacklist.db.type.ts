export type IRefreshTokenBlacklistDB = {
  token: string // токен
  userId: string // чтобы понимать, какому пользователю принадлежал токен.
  createdAt: Date // когда токен добавили в blacklist.
  expiresDate: Date // когда этот refresh token и так перестанет быть валидным.
}