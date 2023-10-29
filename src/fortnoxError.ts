// src/errors/FortnoxError.ts
export class FortnoxError extends Error {
  constructor(public message: string, public statusCode?: number) {
    super(message);
    Object.setPrototypeOf(this, FortnoxError.prototype);
  }
}
