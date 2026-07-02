export class IUserDB {
  public login: string
  public email: string
  public passwordHash: string
  public createdAt: Date
  public emailConfirmation: {
    confirmationCode: string
    expirationDate: Date
    isConfirmed: boolean
  }
  public passwordRecovery: {
    recoveryCode: string | null
    expirationDate: Date | null
  }


  constructor(
    login: string,
    email: string,
    passwordHash: string,
    createdAt: Date,
    emailConfirmation: {
      confirmationCode: string
      expirationDate: Date
      isConfirmed: boolean
    },
    passwordRecovery: {
      recoveryCode: string | null
      expirationDate: Date | null
    }
  ) {
    this.login = login
    this.email = email
    this.passwordHash = passwordHash
    this.createdAt = createdAt
    this.emailConfirmation = emailConfirmation
    this.passwordRecovery = passwordRecovery
  }
}