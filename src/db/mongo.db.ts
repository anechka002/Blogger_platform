import { Collection, Db, MongoClient } from 'mongodb';
import { SETTINGS } from '../core/settings/settings';
import {Blog} from "../blogs/types/blog";
import {Post} from "../posts/types/post";
import {IUserDB} from "../users/types/user.db.type";
import {ICommentDB} from "../comments/types/comment.db.type";
import {
  IRefreshTokenBlacklistDB
} from "../auth/types/refresh-token-blacklist.db.type";
import {ApiRequestLogDb} from "../auth/types/api-request-log.db.type";

const BLOG_COLLECTION_NAME = 'blogs';
const POST_COLLECTION_NAME = 'posts';
const USER_COLLECTION_NAME = 'users';
const COMMENT_COLLECTION_NAME = 'comments';
const REFRESH_TOKEN_BLACKLIST_COLLECTION_NAME = 'refreshTokenBlacklist';
const API_REQUEST_LOGS_COLLECTION_NAME = 'apiRequestLogs';

export const db = {
  client: null as MongoClient | null,

  getDb(): Db {
    if (!db.client) {
      throw new Error('Mongo client is not initialized');
    }

    return db.client.db(SETTINGS.DB_NAME);
  },

  async run(url: string) {
    try {
      db.client = new MongoClient(url);
      await db.client.connect();
      await db.getDb().command({ ping: 1 });

      console.log('Connected successfully to mongo server');
    } catch (e: unknown) {
      console.error("Can't connect to mongo server", e);

      if (db.client) {
        await db.client.close()
      }

      db.client = null
    }
  },

  async stop() {
    if (!db.client) {
      throw new Error('No active client')
    }

    await db.client.close()
    db.client = null
    console.log('Connection successfully closed')
  },

  async drop() {
    try {
      //await db.getDb().dropDatabase()
      const collections = await db.getDb().listCollections().toArray();

      for (const collection of collections) {
        const collectionName = collection.name;
        await db.getDb().collection(collectionName).deleteMany({});
      }
    } catch (e: unknown) {
      console.error('Error in drop db:', e);
      await db.stop();
    }
  },

  // Создаём TTL index, чтобы MongoDB автоматически удаляла старые логи запросов.
  async createIndexes() {
    await db.getCollections().refreshTokenBlacklistCollection.createIndex(
      {expiresDate: 1},
      {expireAfterSeconds: 0}
    )

    await db.getCollections().apiRequestLogsCollection.createIndex(
      {date: 1},
      {expireAfterSeconds: 10}
    )
  },

  getCollections(): {
    blogCollection: Collection<Blog>;
    postCollection: Collection<Post>;
    userCollection: Collection<IUserDB>;
    commentCollection: Collection<ICommentDB>;
    refreshTokenBlacklistCollection: Collection<IRefreshTokenBlacklistDB>
    apiRequestLogsCollection: Collection<ApiRequestLogDb>
  } {
    const database = db.getDb();

    return {
      blogCollection: database.collection<Blog>(BLOG_COLLECTION_NAME),
      postCollection: database.collection<Post>(POST_COLLECTION_NAME),
      userCollection: database.collection<IUserDB>(USER_COLLECTION_NAME),
      commentCollection: database.collection<ICommentDB>(COMMENT_COLLECTION_NAME),
      refreshTokenBlacklistCollection: database.collection<IRefreshTokenBlacklistDB>(REFRESH_TOKEN_BLACKLIST_COLLECTION_NAME),
      apiRequestLogsCollection: database.collection<ApiRequestLogDb>(API_REQUEST_LOGS_COLLECTION_NAME),
    };
  },
}