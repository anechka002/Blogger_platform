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

export const usersRepository = new UsersRepository();
export const usersQueryRepository  = new UsersQueryRepository();
const devicesSessionsRepository = new DevicesSessionsRepository();
const devicesQueryRepository  = new DevicesQueryRepository();
export const apiRequestLogsRepository = new ApiRequestLogsRepository();
const blogsQueryRepository = new BlogsQueryRepository();
const blogsRepository  = new BlogsRepository();
const postsQueryRepository = new PostsQueryRepository();
const postsRepository = new PostsRepository();
const commentsQueryRepository = new CommentsQueryRepository();
const commentsRepository = new CommentsRepository();

const bcryptService = new BcryptService();
const argon2Service = new Argon2Service();
const jwtService = new JwtService();
export const nodemailerService = new NodemailerService();

const usersService = new UsersService(usersRepository, argon2Service)
export const authService = new AuthService(usersRepository, argon2Service, jwtService, nodemailerService, devicesSessionsRepository);
const deviceService = new DeviceService(devicesSessionsRepository);
const blogsService = new BlogsService(blogsRepository, postsRepository);
const postsService = new PostsService(blogsRepository, postsRepository)
const commentsService = new CommentsService(usersQueryRepository, postsQueryRepository, commentsRepository, commentsQueryRepository);

export const authController = new AuthController(authService, usersQueryRepository);
export const usersController = new UsersController(usersService, usersQueryRepository);
export const deviceController = new DeviceController(devicesQueryRepository, deviceService);
export const blogsController = new BlogsController(blogsQueryRepository, blogsService, postsQueryRepository);
export const postsController = new PostsController(postsQueryRepository, postsService)
export const commentsController = new CommentsController(postsQueryRepository, commentsQueryRepository, commentsService)

export const rateLimit = rateLimitMiddleware(apiRequestLogsRepository)
export const refreshToken = refreshTokenGuardMiddleware(devicesSessionsRepository, jwtService)
export const accessToken = accessTokenGuardMiddleware(jwtService)
export const email = emailValidation(usersRepository)
export const login = loginValidation(usersRepository)
export const postInputValidation = postInputDtoValidation(blogsRepository)