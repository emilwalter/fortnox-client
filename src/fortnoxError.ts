export class FortnoxError extends Error {
  constructor(public message: string, public statusCode?: number) {
    super(
      typeof message === "object" ? JSON.stringify(message, null, 2) : message
    );
    Object.setPrototypeOf(this, FortnoxError.prototype);
  }
}
