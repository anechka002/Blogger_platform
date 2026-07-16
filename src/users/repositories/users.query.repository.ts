import {UserQueryFieldsType} from "../types/user-query-fields.type";
import {PaginationOutput} from "../../core/types/pagination.output";
import {IUserView} from "../types/user.view.type";
import {calculateSkip} from "../../core/utils/calculateSkip";
import {
  mapToUserViewModel
} from "./mappers/map-to-user-view-model.utils";
import {IMeView} from "../../auth/types/me.view";
import {
  mapToMeViewModel
} from "./mappers/map-to-me-view-model.utils";
import {injectable} from "inversify";
import {UserModel} from "../domain/user.entity";
import mongoose from "mongoose";

@injectable()
export class UsersQueryRepository {
  // Найти всех users с пагинацией и сортировкой
  async findAllUsers(queryDto: UserQueryFieldsType): Promise<PaginationOutput<IUserView>> {
    const {pageNumber, pageSize, sortBy, sortDirection, searchLoginTerm, searchEmailTerm } = queryDto;

    const searchConditions = []

    if (searchLoginTerm) {
      searchConditions.push({
        login: { $regex: searchLoginTerm, $options: 'i' },
      })
    }

    if (searchEmailTerm) {
      searchConditions.push({
        email: { $regex: searchEmailTerm, $options: 'i' },
      })
    }

    const filter = searchConditions.length > 0 ? { $or: searchConditions } : {}
    const skip = calculateSkip(pageNumber, pageSize);

    const items = await UserModel
      .find(filter)
      .skip(skip)
      .sort({[sortBy]: sortDirection})
      .limit(pageSize)
      .lean()

    const totalCount = await UserModel.countDocuments(filter)

    return {
      pagesCount: Math.ceil(totalCount / queryDto.pageSize),
      pageSize: queryDto.pageSize,
      page: queryDto.pageNumber,
      totalCount: totalCount,
      items: items.map(mapToUserViewModel)
    }

  }

  // Найти user по id
  async findById(id: string): Promise<IUserView | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null
    }
    const user = await UserModel.findById(id).lean();
    return user ? mapToUserViewModel(user) : null
  }

  // Найти me по id
  async findMeById(id: string): Promise<IMeView | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null
    }

    const user = await UserModel.findById(id).lean();
    return user ? mapToMeViewModel(user) : null
  }

}
