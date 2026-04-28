export class SocialUserEntity {
  constructor(
    readonly id: string,
    readonly displayName: string,
    readonly handle: string,
    readonly role: 'MEMBER' | 'MODERATOR',
  ) {}
}
