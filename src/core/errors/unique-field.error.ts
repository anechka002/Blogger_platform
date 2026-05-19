export class UniqueFieldError extends Error {
  constructor(public field: string, message: string) {
    super(message);

    this.name = 'UniqueFieldError';
  }
}