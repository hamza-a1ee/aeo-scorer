export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: string[],
  ) {
    super(message);
  }
}
