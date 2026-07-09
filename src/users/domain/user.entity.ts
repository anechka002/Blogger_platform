import mongoose, {HydratedDocument, Model, model} from "mongoose";
import {EmailConfirmation, IUserDB} from "../types/user.db.type";

type UserModel = Model<IUserDB>

export type UserDocument = HydratedDocument<IUserDB>

const emailConfirmationSchema = new mongoose.Schema<EmailConfirmation>({
  confirmationCode: {type: String, default: null},
  expirationDate: {type: Date, required: true},
  isConfirmed: {type: Boolean, required: true},
}, {_id: false});

const userSchema = new mongoose.Schema<IUserDB>({
  login: {type: String, required: true, minlength: 1, maxlength: 100},
  email: {type: String, unique: true, required: true, minlength: 5, maxlength: 200},
  passwordHash: {type: String, required: true},
  createdAt: {type: Date, required: true},
  emailConfirmation: {type: emailConfirmationSchema, required: true},
  passwordRecovery: {
    recoveryCode: { type: String, default: null },
    expirationDate: { type: Date, default: null },
  }
});

export const UserModel = model<IUserDB, UserModel>('users', userSchema);