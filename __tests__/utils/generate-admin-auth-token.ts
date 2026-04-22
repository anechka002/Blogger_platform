import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME
} from "../../src/auth/middlewares/super-admin.guard-middleware";

export function generateBasicAuthToken(
  username: string = ADMIN_USERNAME,
  password: string = ADMIN_PASSWORD,
): string {
  const credentials = `${username}:${password}`;
  const token = Buffer.from(credentials).toString('base64');

  return `Basic ${token}`;
}