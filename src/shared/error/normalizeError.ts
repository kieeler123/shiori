export type NormalizedError = {
  message: string;
  stack: string | null;
};

export function normalizeError(error: unknown): NormalizedError {
  if (error instanceof Error) {
    return {
      message: error.message || "Unknown error",
      stack: error.stack ?? null,
    };
  }

  if (typeof error === "object" && error !== null) {
    const maybeMessage =
      "message" in error ? String((error as any).message) : "Unknown error";

    const maybeStack = "stack" in error ? String((error as any).stack) : null;

    return {
      message: maybeMessage,
      stack: maybeStack,
    };
  }

  return {
    message: String(error),
    stack: null,
  };
}
