export interface IUserDB {
  login: string
  email: string
  passwordHash: string
  createdAt: Date
  emailConfirmation: EmailConfirmation
  passwordRecovery: {
    recoveryCode: string | null
    expirationDate: Date | null
  }
}

export interface EmailConfirmation {
  confirmationCode: string | null
  expirationDate: Date
  isConfirmed: boolean
}