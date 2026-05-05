export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string, // можно использовать внутри backend
    public readonly source?: string,
  ) {
    super(message)
    this.name = 'DomainError';
  }
}