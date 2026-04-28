export class UnsupportedMediaTypeError extends Error {
  constructor(contentType: string) {
    super(`Unsupported hypermedia content type: ${contentType || '<empty>'}`);
    this.name = 'UnsupportedMediaTypeError';
  }
}
