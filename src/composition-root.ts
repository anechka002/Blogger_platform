import 'reflect-metadata';
import { Container } from 'inversify';
import {UsersRepository} from "./users/repositories/users.repository";
import {UsersService} from "./users/application/users.service";
import {UsersController} from "./users/routers/controller/users-controller";
import {
  UsersQueryRepository
} from "./users/repositories/users.query.repository";
import {AuthService} from "./auth/application/auth.service";
import {AuthController} from "./auth/routers/controller/auth-controller";
import {Argon2Service} from "./auth/adapters/argon.service";
import {JwtService} from "./auth/adapters/jwt.service";
import {BcryptService} from "./auth/adapters/bcrypt.service";
import {NodemailerService} from "./auth/adapters/nodemailer.service";
import {
  DevicesSessionsRepository
} from "./devices/repositories/devices-sessions.repository";
import {DeviceService} from "./devices/application/device.service";
import {
  DevicesQueryRepository
} from "./devices/repositories/devices.query.repositories";
import {DeviceController} from "./devices/routers/controller/device-controller";
import {
  ApiRequestLogsRepository
} from "./auth/repositories/api-request-logs.repository";
import {rateLimitMiddleware} from "./auth/middlewares/rate.limit.middleware";
import {
  refreshTokenGuardMiddleware
} from "./auth/middlewares/refresh.token.guard-middleware";
import {
  accessTokenGuardMiddleware
} from "./auth/middlewares/access.token.guard-middleware";
import {CommentsService} from "./comments/application/comments.service";
import {emailValidation} from "./users/middleware/email.validation";
import {loginValidation} from "./users/middleware/login.validation";
import {
  BlogsQueryRepository
} from "./blogs/repositories/blogs.query.repository";
import {BlogsRepository} from "./blogs/repositories/blogs.repository";
import {BlogsService} from "./blogs/application/blogs.service";
import {BlogsController} from "./blogs/routers/controller/blogs-controller";
import {
  PostsQueryRepository
} from "./posts/repositories/posts.query.repository";
import {PostsRepository} from "./posts/repositories/posts.repository";
import {PostsService} from "./posts/application/posts.service";
import {PostsController} from "./posts/routers/controller/posts-controller";
import {
  CommentsQueryRepository
} from "./comments/repositories/comments.query.repository";
import {CommentsRepository} from "./comments/repositories/comments.repository";
import {
  CommentsController
} from "./comments/routers/controller/comments-controller";
import {
  postInputDtoValidation
} from "./posts/validation/post.input-dto.validation-middlewares";
import {EmailTemplateManager} from "./auth/infrastructure/email-template.manager";
import {
  CommentLikesRepository
} from "./comments/repositories/comment-likes.repository";
import {PostLikesRepository} from "./posts/repositories/post-likes.repository";

export const container: Container = new Container();

container.bind(UsersRepository).to(UsersRepository).inSingletonScope();
container.bind(UsersQueryRepository).to(UsersQueryRepository);
container.bind(DevicesSessionsRepository).to(DevicesSessionsRepository);
container.bind(DevicesQueryRepository).to(DevicesQueryRepository);
container.bind(ApiRequestLogsRepository).to(ApiRequestLogsRepository).inSingletonScope();

container.bind(BlogsQueryRepository).to(BlogsQueryRepository);
container.bind(BlogsRepository).to(BlogsRepository);
container.bind(PostsQueryRepository).to(PostsQueryRepository);
container.bind(PostsRepository).to(PostsRepository);
container.bind(CommentsQueryRepository).to(CommentsQueryRepository);
container.bind(CommentsRepository).to(CommentsRepository);
container.bind(CommentLikesRepository).to(CommentLikesRepository);
container.bind(PostLikesRepository).to(PostLikesRepository);

container.bind(BcryptService).to(BcryptService);
container.bind(Argon2Service).to(Argon2Service);
container.bind(JwtService).to(JwtService);
container.bind(NodemailerService).to(NodemailerService).inSingletonScope();
container.bind(EmailTemplateManager).to(EmailTemplateManager);

container.bind(UsersService).to(UsersService);
container.bind(AuthService).to(AuthService);
container.bind(DeviceService).to(DeviceService);
container.bind(BlogsService).to(BlogsService);
container.bind(PostsService).to(PostsService);
container.bind(CommentsService).to(CommentsService);

container.bind(UsersController).to(UsersController);
container.bind(AuthController).to(AuthController);
container.bind(DeviceController).to(DeviceController);
container.bind(BlogsController).to(BlogsController);
container.bind(PostsController).to(PostsController);
container.bind(CommentsController).to(CommentsController);

export const rateLimit = rateLimitMiddleware(container.get(ApiRequestLogsRepository))
export const refreshToken = refreshTokenGuardMiddleware(container.get(DevicesSessionsRepository), container.get(JwtService))
export const accessToken = accessTokenGuardMiddleware(container.get(JwtService))
export const email = emailValidation(container.get(UsersRepository))
export const login = loginValidation(container.get(UsersRepository))
export const postInputValidation = postInputDtoValidation(container.get(BlogsRepository))