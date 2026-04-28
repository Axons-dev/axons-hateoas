export class SocialPostEntity {
  constructor(
    readonly id: string,
    public body: string,
    readonly authorId: string,
    readonly imageUrl: string,
    readonly createdAt: string,
    public updatedAt: string | undefined = undefined,
  ) {}
}
