import { Module } from '@nestjs/common';
import { ApiRootController, CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { CaseTransitionPolicy } from './domain/case-transition.policy';
import { InMemoryCaseRepository } from './infrastructure/in-memory-case.repository';

@Module({
  controllers: [ApiRootController, CasesController],
  providers: [CasesService, CaseTransitionPolicy, InMemoryCaseRepository],
  exports: [CaseTransitionPolicy],
})
export class CasesModule {}
