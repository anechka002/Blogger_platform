export interface IUserDB {
  login: string
  email: string
  passwordHash: string
  createdAt: Date
  emailConfirmation: EmailConfirmation
  passwordRecovery: PasswordRecovery
}

export interface EmailConfirmation {
  confirmationCode: string | null
  expirationDate: Date
  isConfirmed: boolean
}

export interface PasswordRecovery {
  recoveryCode: string | null
  expirationDate: Date | null
}