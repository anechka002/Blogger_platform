export type JWTPayloadWithUserId = {
  userId: string
  iat: number
  exp: number
}