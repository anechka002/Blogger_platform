export type ICommentView = {
  id: string
  content: string
  commentatorInfo: Info
  createdAt: string
}

type Info = {
  userId: string
  userLogin: string
}