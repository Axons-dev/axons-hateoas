import { Module } from '@nestjs/common';
import { SocialPermissionPolicy } from './domain/social-permission.policy';
import { InMemorySocialRepository } from './infrastructure/in-memory-social.repository';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';

@Module({
  controllers: [SocialController],
  providers: [SocialService, SocialPermissionPolicy, InMemorySocialRepository],
})
export class SocialModule {}
