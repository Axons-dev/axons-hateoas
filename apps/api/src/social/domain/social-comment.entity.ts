export class SocialCommentEntity {
  constructor(
    readonly id: string,
    readonly postId: string,
    public body: string,
    readonly authorId: string,
    readonly createdAt: string,
    public hidden: boolean = false,
    public updatedAt: string | undefined = undefined,
  ) {}
}
