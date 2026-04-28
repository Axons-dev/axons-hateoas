import { Module } from '@nestjs/common';
import { HateoasModule } from '@axons/hateoas-nestjs';
import { CasesModule } from './cases/cases.module';
import { caseResource } from './cases/hypermedia/case.resource';
import { socialPostResource } from './social/hypermedia/social.resource';
import { SocialModule } from './social/social.module';

@Module({
  imports: [
    HateoasModule.forRoot({
      resources: [caseResource, socialPostResource],
      routes: {
        'api.root': () => '/api',
        // Cases demo 
        'cases.findAll': () => '/api/cases',
        'cases.findOne': ({ id }) => `/api/cases/${id}`,
        'cases.create': () => '/api/cases',
        'cases.edit': ({ id }) => `/api/cases/${id}`,
        'cases.submit': ({ id }) => `/api/cases/${id}/submit`,
        'cases.startReview': ({ id }) => `/api/cases/${id}/start-review`,
        'cases.approve': ({ id }) => `/api/cases/${id}/approve`,
        'cases.reject': ({ id }) => `/api/cases/${id}/reject`,
        'cases.requestChanges': ({ id }) => `/api/cases/${id}/request-changes`,
        'cases.reopen': ({ id }) => `/api/cases/${id}/reopen`,
        'cases.archive': ({ id }) => `/api/cases/${id}/archive`,

        // Social demo
        'social.posts.findAll': () => '/api/social/posts',
        'social.posts.findOne': ({ id }) => `/api/social/posts/${id}`,
      },
    }),
    CasesModule,
    SocialModule,
  ],
})
export class AppModule {}
