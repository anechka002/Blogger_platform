import {CreateBlogDto} from "../../../src/blogs/dto/createBlogDto";

export function getBlogDto(): CreateBlogDto {
  return {
    name: 'Blog',
    description: 'blog description',
    websiteUrl: 'https://blog.com',
  };
}
