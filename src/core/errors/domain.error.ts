export class DomainError extends Error {
  public readonly source?: string
  public readonly code?: string

  constructor(message: string, source?: string, code?: string) {
    super(message)

    this.name = 'DomainError'
    this.source = source
    this.code = code
  }
}