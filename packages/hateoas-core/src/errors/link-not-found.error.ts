export class LinkNotFoundError extends Error {
  constructor(rel: string) {
    super(`Hypermedia link not found: ${rel}`);
    this.name = 'LinkNotFoundError';
  }
}
