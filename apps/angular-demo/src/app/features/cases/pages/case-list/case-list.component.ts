import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoRoleService } from '../../../../shared/demo-role.service';
import { CaseListBusiness } from './case-list.business';
import { CaseListStore } from './case-list.store';

@Component({
  selector: 'app-case-list',
  standalone: true,
  imports: [RouterLink],
  providers: [CaseListBusiness, CaseListStore],
  templateUrl: './case-list.component.html',
})
export class CaseListComponent implements OnInit {
  readonly business = inject(CaseListBusiness);
  readonly roles = inject(DemoRoleService);
  readonly state = this.business.state;

  async ngOnInit(): Promise<void> {
    await this.business.load();
  }
}
