import {Response} from "express";
import {postsRepository} from "../../repositories/posts.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {RequestWithParams} from "../../../core/types/request-types";
import {URIParamsPostIdDto} from "../../dto/URIParamsPostIdDto";
import {PostViewDto} from "../../dto/postViewDto";
import {mapToPostViewModel} from "../mappers/map-to-post-view-model.utils";

export const getPostHandler = async (req: RequestWithParams<URIParamsPostIdDto>, res: Response<PostViewDto>)=> {
  try {
    const id = req.params.id;
    const post = await postsRepository.findById(id)
    if (!post) {
      res.sendStatus(HttpStatus.NotFound_404);
      return
    }
    const postViewModel = mapToPostViewModel(post)
    res.status(HttpStatus.Ok_200).send(postViewModel);
  } catch (error) {
    res.sendStatus(HttpStatus.InternalServerError_500)
  }
}