import {randomUUID} from "node:crypto";

export class UserAccountDB {
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  emailConfirmation: {
    confirmationCode: string,
    expirationDate: Date,
    isConfirmed: boolean
  }

  constructor(login: string, email: string, hash: string) {
    this.login = login
    this.email = email
    this.passwordHash = hash
    this.createdAt = new Date()
    this.emailConfirmation = {
      confirmationCode: randomUUID(),
      expirationDate: new Date(),
      isConfirmed: false
    }
  }
}