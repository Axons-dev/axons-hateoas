import { describe, expect, it } from 'vitest';
import { SIREN_MEDIA_TYPE, SirenParser, sirenParser } from './siren-parser';

describe('SirenParser', () => {
  it('is created by the factory and supports Siren content types', () => {
    const parser = sirenParser();

    expect(parser).toBeInstanceOf(SirenParser);
    expect(parser.mediaType).toBe(SIREN_MEDIA_TYPE);
    expect(parser.supports('application/vnd.siren+json; charset=utf-8')).toBe(true);
    expect(parser.supports('application/json')).toBe(false);
  });

  it('maps Siren entity to normalized resource model', () => {
    const parser = new SirenParser();

    const resource = parser.parse({
      class: ['case'],
      properties: { id: 'CASE-001', status: 'DRAFT' },
      links: [{ rel: ['self'], href: '/api/cases/CASE-001' }],
      actions: [{ name: 'submit', method: 'POST', href: '/api/cases/CASE-001/submit' }],
    });

    expect(resource.classes).toEqual(['case']);
    expect(resource.links[0].rel).toEqual(['self']);
    expect(resource.actions[0].name).toBe('submit');
  });

  it('maps action fields and embedded entities recursively', () => {
    const parser = new SirenParser();

    const resource = parser.parse({
      class: ['post'],
      properties: { id: 'POST-001' },
      entities: [
        {
          rel: ['item', 'comment'],
          class: ['comment'],
          properties: { id: 'COMMENT-001' },
          links: [{ rel: ['self'], href: '/comments/COMMENT-001', title: 'Self' }],
          actions: [
            {
              name: 'edit-comment',
              title: 'Edit comment',
              method: 'PATCH',
              href: '/comments/COMMENT-001',
              type: 'application/json',
              fields: [
                {
                  name: 'body',
                  type: 'textarea',
                  title: 'Comment',
                  value: 'Current body',
                  required: true,
                  options: [{ value: 'Current body', title: 'Current' }],
                },
              ],
            },
          ],
          entities: [
            {
              rel: ['metadata'],
              class: ['metadata'],
              properties: { version: 1 },
            },
          ],
        },
      ],
    });

    expect(resource.entities[0]).toMatchObject({
      rel: ['item', 'comment'],
      classes: ['comment'],
      properties: { id: 'COMMENT-001' },
    });
    expect(resource.entities[0].actions[0].fields[0]).toEqual({
      name: 'body',
      type: 'textarea',
      title: 'Comment',
      value: 'Current body',
      required: true,
      options: [{ value: 'Current body', title: 'Current' }],
    });
    expect(resource.entities[0].entities[0].properties).toEqual({ version: 1 });
  });

  it('defaults missing Siren arrays to empty normalized arrays', () => {
    const resource = new SirenParser().parse({});

    expect(resource).toMatchObject({
      classes: [],
      properties: {},
      links: [],
      actions: [],
      entities: [],
    });
  });
});
