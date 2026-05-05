export class DomainError extends Error {
  constructor(
    message: string,
    public readonly source?: string,
    public readonly code?: string, // можно использовать внутри backend
  ) {
    super(message)
    this.name = 'DomainError';
  }
}