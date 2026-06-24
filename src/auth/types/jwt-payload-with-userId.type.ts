export type JWTPayloadWithUserId = {
  userId: string
  deviceId: string
  iat: number
  exp: number
}