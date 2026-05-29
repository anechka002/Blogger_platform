export interface IUserDB {
  login: string
  email: string
  passwordHash: string
  createdAt: Date
  emailConfirmation: {
    confirmationCode: string
    expirationDate: Date
    isConfirmed: boolean
  }
}