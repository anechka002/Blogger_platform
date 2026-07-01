import nodemailer from "nodemailer";
import {SETTINGS} from "../../core/settings/settings";

export class NodemailerService {
  async sendEmail(email: string, subject: string, message: string): Promise<boolean> {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: SETTINGS.EMAIL,
        pass: SETTINGS.EMAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"Anna" <${SETTINGS.EMAIL}>`, // от кого: Gmail
      to:  email, // кому: Mail.ru
      subject: subject,
      html: message,
    });

    return !!info
  }
}
