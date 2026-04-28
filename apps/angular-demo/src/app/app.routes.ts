import type { Routes } from '@angular/router';
import { CaseListComponent } from './features/cases/pages/case-list/case-list.component';
import { CaseDetailComponent } from './features/cases/pages/case-detail/case-detail.component';
import { SocialFeedComponent } from './features/social/pages/social-feed/social-feed.component';
import { SocialPostDetailComponent } from './features/social/pages/social-post-detail/social-post-detail.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'cases', pathMatch: 'full' },
  { path: 'cases', component: CaseListComponent },
  { path: 'cases/:id', component: CaseDetailComponent },
  { path: 'social', component: SocialFeedComponent },
  { path: 'social/posts/:id', component: SocialPostDetailComponent },
];
