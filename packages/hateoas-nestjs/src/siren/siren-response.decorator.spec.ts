import { describe, expect, it } from 'vitest';
import 'reflect-metadata';
import { HEADERS_METADATA } from '@nestjs/common/constants';
import { SIREN_CONTENT_TYPE } from './siren-content-type';
import { SirenResponse } from './siren-response.decorator';

class ControllerFixture {
  @SirenResponse()
  getResource() {
    return {};
  }
}

describe('SirenResponse', () => {
  it('sets the Siren content type metadata', () => {
    const metadata = Reflect.getMetadata(HEADERS_METADATA, ControllerFixture.prototype.getResource);

    expect(metadata).toContainEqual({
      name: 'Content-Type',
      value: SIREN_CONTENT_TYPE,
    });
  });
});
