import { defineSirenResource, sirenAction, sirenField, sirenLink } from '@axonsdev/hateoas-nestjs';
import type { DemoUser } from '../../common/demo-auth/demo-user.types';
import { CaseTransitionPolicy } from '../domain/case-transition.policy';
import { CaseEntity } from '../domain/case.entity';

export interface CaseHypermediaContext {
  user: DemoUser;
}

/**
 * Siren definition for the case workflow demo.
 *
 * The resource layer translates domain permissions into links and actions. It
 * deliberately does not mutate cases; mutations stay in `CasesService`.
 */
export const caseResource = defineSirenResource<CaseEntity, CaseHypermediaContext>(CaseEntity, {
  name: 'case',
  classes: ['case'],
  id: (entity) => entity.id,

  properties: {
    id: 'id',
    title: 'title',
    description: 'description',
    status: 'status',
    createdById: 'createdById',
    createdAt: 'createdAt',
    lastDecisionReason: 'lastDecisionReason',
  },

  profiles: {
    list: {
      expose: ['id', 'title', 'status', 'createdById'],
      links: ['self'],
      actions: [],
    },
    detail: {
      expose: ['id', 'title', 'description', 'status', 'createdById', 'createdAt', 'lastDecisionReason'],
      links: ['self', 'collection'],
      actions: ['edit', 'submit', 'start-review', 'approve', 'reject', 'request-changes', 'reopen', 'archive'],
    },
  },

  links: {
    self: ({ entity, url }) => sirenLink('self', url.route('cases.findOne', { id: entity.id })),
    collection: ({ url }) => sirenLink('collection', url.route('cases.findAll')),
  },

  actions: {
    edit: ({ entity, context, services, url }) => {
      const policy = services.get<CaseTransitionPolicy>(CaseTransitionPolicy);
      // Missing actions are represented by omission, not by disabled buttons.
      if (!policy.getAvailableActions(entity, context.user).includes('edit')) {
        return null;
      }

      return sirenAction('edit')
        .title('Edit case')
        .method('PATCH')
        .href(url.route('cases.edit', { id: entity.id }))
        .type('application/json')
        .field(sirenField({ name: 'title', type: 'text', title: 'Title' }))
        .field(sirenField({ name: 'description', type: 'text', title: 'Description' }))
        .build();
    },

    submit: ({ entity, context, services, url }) => {
      const policy = services.get<CaseTransitionPolicy>(CaseTransitionPolicy);
      if (!policy.getAvailableActions(entity, context.user).includes('submit')) {
        return null;
      }

      return sirenAction('submit')
        .title('Submit')
        .method('POST')
        .href(url.route('cases.submit', { id: entity.id }))
        .type('application/json')
        .build();
    },

    'start-review': ({ entity, context, services, url }) => {
      const policy = services.get<CaseTransitionPolicy>(CaseTransitionPolicy);
      if (!policy.getAvailableActions(entity, context.user).includes('start-review')) {
        return null;
      }

      return sirenAction('start-review')
        .title('Start review')
        .method('POST')
        .href(url.route('cases.startReview', { id: entity.id }))
        .type('application/json')
        .build();
    },

    approve: ({ entity, context, services, url }) => {
      const policy = services.get<CaseTransitionPolicy>(CaseTransitionPolicy);
      if (!policy.getAvailableActions(entity, context.user).includes('approve')) {
        return null;
      }

      return sirenAction('approve')
        .title('Approve')
        .method('POST')
        .href(url.route('cases.approve', { id: entity.id }))
        .type('application/json')
        .build();
    },

    reject: ({ entity, context, services, url }) => {
      const policy = services.get<CaseTransitionPolicy>(CaseTransitionPolicy);
      if (!policy.getAvailableActions(entity, context.user).includes('reject')) {
        return null;
      }

      return sirenAction('reject')
        .title('Reject')
        .method('POST')
        .href(url.route('cases.reject', { id: entity.id }))
        .type('application/json')
        .field(sirenField({ name: 'reason', title: 'Rejection reason', type: 'text', required: true }))
        .build();
    },

    'request-changes': ({ entity, context, services, url }) => {
      const policy = services.get<CaseTransitionPolicy>(CaseTransitionPolicy);
      if (!policy.getAvailableActions(entity, context.user).includes('request-changes')) {
        return null;
      }

      return sirenAction('request-changes')
        .title('Request changes')
        .method('POST')
        .href(url.route('cases.requestChanges', { id: entity.id }))
        .type('application/json')
        .field(sirenField({ name: 'reason', title: 'Requested changes', type: 'text', required: true }))
        .build();
    },

    reopen: ({ entity, context, services, url }) => {
      const policy = services.get<CaseTransitionPolicy>(CaseTransitionPolicy);
      if (!policy.getAvailableActions(entity, context.user).includes('reopen')) {
        return null;
      }

      return sirenAction('reopen')
        .title('Reopen')
        .method('POST')
        .href(url.route('cases.reopen', { id: entity.id }))
        .type('application/json')
        .build();
    },

    archive: ({ entity, context, services, url }) => {
      const policy = services.get<CaseTransitionPolicy>(CaseTransitionPolicy);
      if (!policy.getAvailableActions(entity, context.user).includes('archive')) {
        return null;
      }

      return sirenAction('archive')
        .title('Archive')
        .method('POST')
        .href(url.route('cases.archive', { id: entity.id }))
        .type('application/json')
        .build();
    },
  },
});
