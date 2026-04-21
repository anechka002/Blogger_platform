import { Request, Response } from 'express';
import {HttpStatus} from "../../../core/types/http-statuses";
import {PostViewDto} from "../../dto/postViewDto";
import {postsRepository} from "../../repositories/posts.repository";

export const getPostListHandler = (req: Request, res: Response<PostViewDto[]>)=> {
  const posts = postsRepository.findAll();
  res.status(HttpStatus.Ok_200).send(posts);
}