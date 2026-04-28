import { Injectable } from '@angular/core';
import { HypermediaResourceStore } from '@axonsdev/hateoas-angular';
import type { CaseProperties } from '../../models/case.model';

@Injectable()
export class CaseDetailStore extends HypermediaResourceStore<CaseProperties> {}
