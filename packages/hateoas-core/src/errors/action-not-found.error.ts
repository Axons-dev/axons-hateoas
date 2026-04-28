export class ActionNotFoundError extends Error {
  constructor(actionName: string) {
    super(`Hypermedia action not found: ${actionName}`);
    this.name = 'ActionNotFoundError';
  }
}
