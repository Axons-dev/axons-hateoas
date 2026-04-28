import { Body, Controller, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { HateoasService, SirenResponse, sirenEntity, sirenLink } from '@axonsdev/hateoas-nestjs';
import { CurrentDemoUser } from '../common/demo-auth/current-demo-user.decorator';
import type { DemoUser } from '../common/demo-auth/demo-user.types';
import { CaseEntity } from './domain/case.entity';
import { CasesService } from './cases.service';

@Controller('cases')
export class CasesController {
  constructor(
    @Inject(CasesService)
    private readonly casesService: CasesService,
    @Inject(HateoasService)
    private readonly hateoas: HateoasService,
  ) {}

  /**
   * Returns the case collection with the list profile.
   *
   * The profile choice belongs here because it is an HTTP use case decision,
   * not a domain transition rule.
   */
  @Get()
  @SirenResponse()
  async findAll(@CurrentDemoUser() user: DemoUser) {
    const cases = this.casesService.findAll();

    return this.hateoas
      .collection<CaseEntity, { user: DemoUser }>(CaseEntity, cases)
      .profile('list')
      .withContext({ user })
      .toResponse();
  }

  @Get(':id')
  @SirenResponse()
  async findOne(@Param('id') id: string, @CurrentDemoUser() user: DemoUser) {
    return this.toCaseResponse(this.casesService.findOne(id), user);
  }

  @Patch(':id')
  @SirenResponse()
  async update(
    @Param('id') id: string,
    @Body() body: { title?: string; description?: string },
    @CurrentDemoUser() user: DemoUser,
  ) {
    return this.toCaseResponse(this.casesService.update(id, body, user), user);
  }

  @Post(':id/submit')
  @SirenResponse()
  async submit(@Param('id') id: string, @CurrentDemoUser() user: DemoUser) {
    return this.toCaseResponse(this.casesService.submit(id, user), user);
  }

  @Post(':id/start-review')
  @SirenResponse()
  async startReview(@Param('id') id: string, @CurrentDemoUser() user: DemoUser) {
    return this.toCaseResponse(this.casesService.startReview(id, user), user);
  }

  @Post(':id/approve')
  @SirenResponse()
  async approve(@Param('id') id: string, @CurrentDemoUser() user: DemoUser) {
    return this.toCaseResponse(this.casesService.approve(id, user), user);
  }

  @Post(':id/reject')
  @SirenResponse()
  async reject(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @CurrentDemoUser() user: DemoUser,
  ) {
    return this.toCaseResponse(this.casesService.reject(id, body, user), user);
  }

  @Post(':id/request-changes')
  @SirenResponse()
  async requestChanges(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @CurrentDemoUser() user: DemoUser,
  ) {
    return this.toCaseResponse(this.casesService.requestChanges(id, body, user), user);
  }

  @Post(':id/reopen')
  @SirenResponse()
  async reopen(@Param('id') id: string, @CurrentDemoUser() user: DemoUser) {
    return this.toCaseResponse(this.casesService.reopen(id, user), user);
  }

  @Post(':id/archive')
  @SirenResponse()
  async archive(@Param('id') id: string, @CurrentDemoUser() user: DemoUser) {
    return this.toCaseResponse(this.casesService.archive(id, user), user);
  }

  /**
   * Rebuilds the detail representation after every mutation.
   *
   * That keeps the frontend synchronized with the next set of available actions.
   */
  private toCaseResponse(caseEntity: CaseEntity, user: DemoUser) {
    return this.hateoas
      .resource<CaseEntity, { user: DemoUser }>(caseEntity)
      .profile('detail')
      .withContext({ user })
      .toResponse();
  }
}

@Controller()
export class ApiRootController {
  /**
   * Exposes demo entry points as links so clients can discover available demos.
   */
  @Get()
  @SirenResponse()
  root() {
    return sirenEntity()
      .addClass('api-root')
      .properties({ name: 'Axons HATEOAS Demo API' })
      .link(sirenLink('self', '/api'))
      .link(sirenLink('cases', '/api/cases'))
      .link(sirenLink('social-posts', '/api/social/posts'))
      .build();
  }
}
