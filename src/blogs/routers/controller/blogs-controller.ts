import {Request, Response} from "express";
import {PaginationOutput} from "../../../core/types/pagination.output";
import {BlogViewDto} from "../../dto/blogViewDto";
import {matchedData} from "express-validator";
import {BlogQueryInput} from "../input/blog-query.input";
import {HttpStatus} from "../../../core/types/http-statuses";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {
  BlogsQueryRepository
} from "../../repositories/blogs.query.repository";
import {
  RequestWithBody,
  RequestWithParams, RequestWithParamsAndBody
} from "../../../core/types/request-types";
import {URIParamsBlogIdDto} from "../../dto/URIParamsBlogIdDto";
import {CreateBlogDto} from "../../dto/createBlogDto";
import {BlogsService} from "../../application/blogs.service";
import {UpdateBlogDto} from "../../dto/updateBlogDto";
import {URIParamsBlogIdPostsDto} from "../../dto/URIParamsBlogIdPostsDto";
import {PostViewDto} from "../../../posts/dto/postViewDto";
import {BlogPostsQueryInput} from "../input/blog-posts-query.input";
import {
  PostsQueryRepository,
} from "../../../posts/repositories/posts.query.repository";
import {CreatePostForBlogDto} from "../../dto/createPostForBlogDto";
import {inject, injectable} from "inversify";

@injectable()
export class BlogsController {
  protected blogsQueryRepository: BlogsQueryRepository;
  protected blogsService: BlogsService;
  protected postsQueryRepository: PostsQueryRepository;
  constructor(
    @inject(BlogsQueryRepository) blogsQueryRepository: BlogsQueryRepository,
    @inject(BlogsService) blogsService: BlogsService,
    @inject(PostsQueryRepository) postsQueryRepository: PostsQueryRepository
  ) {
    this.blogsQueryRepository = blogsQueryRepository;
    this.blogsService = blogsService;
    this.postsQueryRepository = postsQueryRepository;
  }
  async getBlogList(req: Request, res: Response<PaginationOutput<BlogViewDto>>) {
    try {
      const queryInput = matchedData<BlogQueryInput>(req, {
        locations: ["query"],
        includeOptionals: true,
      });

      // console.log(queryInput)

      const blogs = await this.blogsQueryRepository.findMany(queryInput);

      res.status(HttpStatus.Ok_200).send(blogs);
    } catch (error: unknown) {
      errorsHandler(error, res)
    }
  }

  async getBlog(req: RequestWithParams<URIParamsBlogIdDto>, res: Response<BlogViewDto>) {
    try {
      const blog = await this.blogsQueryRepository.findByIdOrFail(req.params.id)

      res.status(HttpStatus.Ok_200).send(blog);
    } catch (error: unknown) {
      errorsHandler(error, res)
    }
  }

  async createBlog(req: RequestWithBody<CreateBlogDto>, res: Response<BlogViewDto>) {
    try {
      const createdBlogId = await this.blogsService.create(req.body)

      const blogViewModel = await this.blogsQueryRepository.findByIdOrFail(createdBlogId);

      res.status(HttpStatus.Created_201).send(blogViewModel)
    } catch (error: unknown) {
      errorsHandler(error, res)
    }
  }

  async deleteBlog(req: RequestWithParams<URIParamsBlogIdDto>, res: Response) {
    try {
      const id = req.params.id

      await this.blogsService.delete(id)

      res.sendStatus(HttpStatus.NoContent_204)
    } catch (error: unknown) {
      console.log(error);
      errorsHandler(error, res)
    }
  }

  async updateBlog(req: RequestWithParamsAndBody<URIParamsBlogIdDto, UpdateBlogDto>, res: Response) {
    try {
      await this.blogsService.update(req.params.id, req.body);

      res.sendStatus(HttpStatus.NoContent_204)
    } catch (error: unknown) {
      errorsHandler(error, res)
    }
  }

  async getBlogPosts(req: RequestWithParams<URIParamsBlogIdPostsDto>, res: Response<PaginationOutput<PostViewDto>>) {
    try {
      const blogId = req.params.blogId;

      const queryInput = matchedData<BlogPostsQueryInput>(req, {
        locations: ["query"],
        includeOptionals: true,
      });

      // console.log(queryInput);

      await this.blogsQueryRepository.findByIdOrFail(blogId)

      const result = await this.postsQueryRepository.findManyByBlogId(blogId, queryInput)

      res.status(HttpStatus.Ok_200).send(result)
    } catch(error: unknown) {
      errorsHandler(error, res)
    }
  }

  async createPostForBlog(req: RequestWithParamsAndBody<URIParamsBlogIdPostsDto, CreatePostForBlogDto>, res: Response<PostViewDto>) {
    try {
      const blogId = req.params.blogId

      const createdPostId = await this.blogsService.createPostForBlog(blogId, req.body)
      const postViewModel = await this.postsQueryRepository.findByIdOrFail(createdPostId)

      res.status(HttpStatus.Created_201).send(postViewModel)
    } catch(error: unknown) {
      errorsHandler(error, res);
    }
  }
}