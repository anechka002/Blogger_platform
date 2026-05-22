import {IdType} from "./userId.type";

declare global {
  declare namespace Express {
    export interface Request {
      user: IdType | undefined;
    }
  }
}

export {};
