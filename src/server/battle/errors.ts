export class BattleServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 400
  ) {
    super(message);
    this.name = "BattleServiceError";
  }
}

export function wrapValidationError(
  err: unknown,
  BattleValidationError: typeof import("./validation").BattleValidationError
): never {
  if (err instanceof BattleValidationError) {
    throw new BattleServiceError(err.message, err.code, 400);
  }
  throw err;
}
