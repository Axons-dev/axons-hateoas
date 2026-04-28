import { applyDecorators, Header } from '@nestjs/common';
import { SIREN_CONTENT_TYPE } from './siren-content-type';

export function SirenResponse(): MethodDecorator {
  return applyDecorators(Header('Content-Type', SIREN_CONTENT_TYPE));
}
