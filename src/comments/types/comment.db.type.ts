export interface ICommentDB {
  postId: string
  content: string
  commentatorInfo: {
    userId: string
    userLogin: string
  }
  createdAt: Date
}