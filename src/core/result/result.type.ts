import {ResultStatus} from "./resultCode";

type ExtensionType = {
  message: string;
  field: string | null;
};

export type Result<T = null> = {
  status: ResultStatus;
  errorMessage?: string;
  extensions: ExtensionType[];
  data: T;
};