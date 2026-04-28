import {WithId} from "mongodb";
import {Blog} from "../../types/blog";
import {BlogViewDto} from "../../dto/blogViewDto";

export const mapToBlogViewModel = (blog: WithId<Blog>): BlogViewDto => {
  return {
    id: blog._id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt.toISOString(),
    isMembership: blog.isMembership,
  }
}