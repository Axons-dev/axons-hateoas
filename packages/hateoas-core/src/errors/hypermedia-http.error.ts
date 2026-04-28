export class HypermediaHttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`Hypermedia HTTP error: ${status}`);
    this.name = 'HypermediaHttpError';
  }
}
