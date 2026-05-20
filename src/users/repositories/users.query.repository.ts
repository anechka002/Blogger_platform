import {UserQueryFieldsType} from "../types/user-query-fields.type";
import {PaginationOutput} from "../../core/types/pagination.output";
import {IUserView} from "../types/user.view.type";
import {calculateSkip} from "../../core/utils/calculateSkip";
import {db} from "../../db/mongo.db";
import {
  mapToUserViewModel
} from "../routers/mappers/map-to-user-view-model.utils";
import {ObjectId} from "mongodb";


export const usersQueryRepository = {
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

    const items = await db
      .getCollections()
      .userCollection.find(filter)
      .skip(skip)
      .sort({[sortBy]: sortDirection})
      .limit(pageSize)
      .toArray();

    const totalCount = await db
      .getCollections()
      .userCollection.countDocuments(filter)

    return {
      pagesCount: Math.ceil(totalCount / queryDto.pageSize),
      pageSize: queryDto.pageSize,
      page: queryDto.pageNumber,
      totalCount: totalCount,
      items: items.map(mapToUserViewModel)
    }

  },

  // Найти user по id
  async findById(id: string): Promise<IUserView | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const user = await db
      .getCollections()
      .userCollection.findOne({_id: new ObjectId(id)})
    return user ? mapToUserViewModel(user) : null
  },

}