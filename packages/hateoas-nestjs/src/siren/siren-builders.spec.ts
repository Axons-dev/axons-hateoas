import { describe, expect, it } from 'vitest';
import { sirenAction, sirenEntity, sirenField, sirenLink } from './siren-builders';

describe('Siren builders', () => {
  it('builds entities with classes, properties, links, actions, and embedded entities', () => {
    const action = sirenAction('submit')
      .title('Submit')
      .method('POST')
      .href('/submit')
      .type('application/json')
      .field(sirenField({ name: 'reason', required: true }))
      .build();

    const entity = sirenEntity()
      .addClass('case')
      .properties({ id: 'CASE-001' })
      .link(sirenLink(['self', 'canonical'], '/cases/CASE-001', { title: 'Self' }))
      .action(action)
      .actionIf(false, sirenAction('hidden').href('/hidden').build())
      .entity({
        rel: ['item'],
        class: ['comment'],
        properties: { id: 'COMMENT-001' },
      } as never)
      .build();

    expect(entity).toEqual({
      class: ['case'],
      properties: { id: 'CASE-001' },
      links: [{ rel: ['self', 'canonical'], href: '/cases/CASE-001', title: 'Self' }],
      actions: [{
        name: 'submit',
        title: 'Submit',
        method: 'POST',
        href: '/submit',
        type: 'application/json',
        fields: [{ name: 'reason', required: true }],
      }],
      entities: [{
        rel: ['item'],
        class: ['comment'],
        properties: { id: 'COMMENT-001' },
      }],
    });
  });
});
