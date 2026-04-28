import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SocialFeedBusiness } from './social-feed.business';
import { SocialFeedStore } from './social-feed.store';

@Component({
  selector: 'app-social-feed',
  standalone: true,
  imports: [RouterLink],
  providers: [SocialFeedBusiness, SocialFeedStore],
  templateUrl: './social-feed.component.html',
})
export class SocialFeedComponent implements OnInit {
  readonly business = inject(SocialFeedBusiness);
  readonly state = this.business.state;

  async ngOnInit(): Promise<void> {
    await this.business.load();
  }
}
