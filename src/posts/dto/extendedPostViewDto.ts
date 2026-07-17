import {ExtendedLikesInfo} from "../../core/types/like-info.type";

export type ExtendedPostViewDto = {
  id: string,
  title: string,
  shortDescription: string,
  content: string,
  blogId: string,
  blogName: string,
  createdAt: string,
  extendedLikesInfo: ExtendedLikesInfo
}