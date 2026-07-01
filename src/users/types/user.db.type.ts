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

  constructor(
    login: string,
    email: string,
    passwordHash: string,
    createdAt: Date,
    emailConfirmation: {
      confirmationCode: string
      expirationDate: Date
      isConfirmed: boolean
    }
  ) {
    this.login = login
    this.email = email
    this.passwordHash = passwordHash
    this.createdAt = createdAt
    this.emailConfirmation = emailConfirmation
  }
}