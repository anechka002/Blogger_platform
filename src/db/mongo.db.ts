import { Collection, Db, MongoClient } from 'mongodb';
import { SETTINGS } from '../core/settings/settings';
import {Blog} from "../blogs/types/blog";
import {Post} from "../posts/types/post";
import {IUserDB} from "../users/types/user.db.type";

const BLOG_COLLECTION_NAME = 'blogs';
const POST_COLLECTION_NAME = 'posts';
const USER_COLLECTION_NAME = 'users';

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

  getCollections(): {
    blogCollection: Collection<Blog>;
    postCollection: Collection<Post>;
    userCollection: Collection<IUserDB>;
  } {
    const database = db.getDb();

    return {
      blogCollection: database.collection<Blog>(BLOG_COLLECTION_NAME),
      postCollection: database.collection<Post>(POST_COLLECTION_NAME),
      userCollection: database.collection<IUserDB>(USER_COLLECTION_NAME),
    };
  },
}



//
// // Подключения к бд
// export async function runDB(url: string): Promise<void> {
//   client = new MongoClient(url);
//   const db: Db = client.db(SETTINGS.DB_NAME);
//
//   //Инициализация коллекций
//   blogCollection = db.collection<Blog>(BLOG_COLLECTION_NAME);
//   postCollection = db.collection<Post>(POST_COLLECTION_NAME);
//
//   try {
//     await client.connect();
//     await db.command({ ping: 1 });
//     console.log('✅ Connected to the database');
//   } catch (e) {
//     await client.close();
//     throw new Error(`❌ Database not connected: ${e}`);
//   }
// }
//
// export async function stopDb(){
//   if(!client){
//     throw new Error(`❌ No active client`);
//   }
//   await client.close();
// }
