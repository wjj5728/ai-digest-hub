export async function withRetry<T>(task: () => Promise<T>, maxRetries = 2, delayMs = 600) {
  let lastError: unknown;

  for (let i = 0; i <= maxRetries; i += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (i === maxRetries) break;
      await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("retry failed");
}
