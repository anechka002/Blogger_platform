import {UpdatePostDto} from "../dto/updatePostDto";
import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";
import {CreatePostDto} from "../dto/createPostDto";
import {DomainError} from "../../core/errors/domain.error";
import {BlogsRepository} from "../../blogs/repositories/blogs.repository";
import {PostsRepository} from "../repositories/posts.repository";
import {inject, injectable} from "inversify";
import {PostModel} from "../domain/post.entity";
import {LikeStatus} from "../../core/enum/like-status.enum";
import {ResultStatus} from "../../core/result/resultCode";
import {PostLikesRepository} from "../repositories/post-likes.repository";
import {PostLikeModel} from "../domain/post-like.entity";
import {UsersRepository} from "../../users/repositories/users.repository";

@injectable()
export class PostsService {
  protected blogsRepository: BlogsRepository;
  protected postsRepository: PostsRepository;
  protected postLikesRepository: PostLikesRepository;
  protected usersRepository: UsersRepository;
  constructor(
    @inject(BlogsRepository) blogsRepository: BlogsRepository,
    @inject(PostsRepository) postsRepository: PostsRepository,
    @inject(PostLikesRepository) postLikesRepository: PostLikesRepository,
    @inject(UsersRepository) usersRepository: UsersRepository,
  ) {
    this.blogsRepository = blogsRepository;
    this.postsRepository = postsRepository;
    this.postLikesRepository = postLikesRepository;
    this.usersRepository = usersRepository;
  }
  // Создать новый пост
  async create(dto: CreatePostDto): Promise<string> {
    const foundBlog = await this.blogsRepository.findByIdOrFail(dto.blogId)

    const newPost = new PostModel (
      {
        title: dto.title,
        shortDescription: dto.shortDescription,
        content: dto.content,
        blogId: dto.blogId,
        blogName: foundBlog!.name,
        createdAt: new Date(),
      }
    )

    return await this.postsRepository.save(newPost)
  }

  // Обновить данные поста
  async update(id: string, dto: UpdatePostDto): Promise<boolean> {
    const foundPost = await this.postsRepository.findById(id)

    if (!foundPost) {
      throw new RepositoryNotFoundError('Post not found')
    }

    const foundBlog = await this.blogsRepository.findById(dto.blogId)

    if (!foundBlog) {
      throw new DomainError('Blog does not exist', 'blogId')
    }

    foundPost.title = dto.title
    foundPost.shortDescription = dto.shortDescription
    foundPost.content = dto.content
    foundPost.blogId = dto.blogId
    foundPost.blogName = foundBlog.name

    await this.postsRepository.savePost(foundPost)

    return true
  }

  // Удалить пост
  async delete(id: string): Promise<boolean> {
    const foundPost = await this.postsRepository.findById(id)

    if (!foundPost) {
      throw new RepositoryNotFoundError('Post not found')
    }

    await this.postsRepository.delete(foundPost)

    return true
  }

  async createLikeStatus({postId, userId, likeStatus}: {postId: string, userId: string, likeStatus: LikeStatus}) {
    const post = await this.postsRepository.findById(postId)
    if (!post) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: 'Post not found',
        extensions: [{field: 'postId', message: 'Post not found'}],
        data: null
      }
    }

    const user = await this.usersRepository.findById(userId)

    const currentReaction = await this.postLikesRepository.findReaction({postId, userId})

    // Случай 1: реакции в базе нет
    if (!currentReaction) {
      if(likeStatus === LikeStatus.None) {
        return {
          status: ResultStatus.Success,
          extensions: [],
          data: null
        }
      }

      const reaction = new PostLikeModel({
        post_id: postId,
        user_id: userId,
        user_login: user?.login,
        status: likeStatus,
      })

      await this.postLikesRepository.createLike(reaction)

      if (likeStatus === LikeStatus.Like) {
        post.likesCount += 1
      }

      if (likeStatus === LikeStatus.Dislike) {
        post.dislikesCount += 1
      }

      await this.postsRepository.savePost(post)

      return {
        status: ResultStatus.Success,
        extensions: [],
        data: null
      }
    }

    // Случай 2: статус уже такой же.
    if (currentReaction.status === likeStatus) {
      return {
        status: ResultStatus.Success,
        extensions: [],
        data: null
      }
    }

    // Случай 3: существующую реакцию убираем, пришёл None
    if (likeStatus === LikeStatus.None) {
      await this.postLikesRepository.deleteReaction({postId, userId})

      if (currentReaction.status === LikeStatus.Like) {
        post.likesCount -= 1
      }

      if (currentReaction.status === LikeStatus.Dislike) {
        post.dislikesCount -= 1
      }

      await this.postsRepository.savePost(post)

      return {
        status: ResultStatus.Success,
        extensions: [],
        data: null
      }
    }

    // Случай 4: меняем Like на Dislike или Dislike на Like
    const previousStatus = currentReaction.status

    currentReaction.status = likeStatus

    await this.postLikesRepository.updateReaction(currentReaction)

    // Был Like, стал Dislike: уменьшаем лайки и увеличиваем дизлайки.
    if(previousStatus === LikeStatus.Like && likeStatus === LikeStatus.Dislike) {
      post.likesCount -= 1
      post.dislikesCount += 1
    }

    // Был Dislike, стал Like: увеличиваем лайки и уменьшаем дизлайки.
    if(previousStatus === LikeStatus.Dislike && likeStatus === LikeStatus.Like) {
      post.likesCount += 1
      post.dislikesCount -= 1
    }

    await this.postsRepository.savePost(post)

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: null
    }
  }
}