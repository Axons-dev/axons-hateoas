import { Injectable } from '@angular/core';
import { HypermediaResourceStore } from '@axons/hateoas-angular';
import type { SocialPostProperties } from '../../models/social.model';

@Injectable()
export class SocialFeedStore extends HypermediaResourceStore<SocialPostProperties> {}
