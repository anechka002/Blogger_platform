export interface IUserDB {
  login: string
  email: string
  passwordHash: string
  createdAt: Date
  emailConfirmation: {
    confirmationCode: string | null
    expirationDate: Date
    isConfirmed: boolean
  }
  passwordRecovery: {
    recoveryCode: string | null
    expirationDate: Date | null
  }
}