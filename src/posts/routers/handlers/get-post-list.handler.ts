import { Request, Response } from 'express';
import {HttpStatus} from "../../../core/types/http-statuses";
import {PostViewDto} from "../../dto/postViewDto";
import {postsRepository} from "../../repositories/posts.repository";
import {mapToPostViewModel} from "../mappers/map-to-post-view-model.utils";

export const getPostListHandler = async (req: Request, res: Response<PostViewDto[]>)=> {
  try {
    const posts = await postsRepository.findAll();
    const postViewModels = posts.map(mapToPostViewModel)
    res.status(HttpStatus.Ok_200).send(postViewModels);
  } catch (error) {
    res.sendStatus(HttpStatus.InternalServerError_500)
  }
}