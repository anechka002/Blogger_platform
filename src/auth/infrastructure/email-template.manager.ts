import {injectable} from "inversify";

@injectable()
export class EmailTemplateManager {
  getRegistrationConfirmationTemplate(code: string): string {
    return`<h1>Thank you for registration</h1>
       <p>To finish registration, please confirm your email:</p>
       <p>Your confirmation code:</p>
       <p>${code}</p>
       <a href="https://some-front.com/confirm-registration?code=${code}">
         Confirm email
       </a>`
  }

  getPasswordRecoveryTemplate(recoveryCode: string): string {
    return `<h1>Password recovery</h1>
       <p>To finish password recovery, please follow the link below:</p>
       <p>Your recovery code:</p>
       <p>${recoveryCode}</p>
       <a href="https://some-front.com/password-recovery?recoveryCode=${recoveryCode}">
        Recover password
      </a>`
  }
}