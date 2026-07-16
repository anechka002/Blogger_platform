import mongoose from 'mongoose';
import { SETTINGS } from '../core/settings/settings';

export const db = {
  async run(url: string) {
    try {
      await mongoose.connect(url, {dbName: SETTINGS.DB_NAME});

      console.log('Connected successfully to mongo server');
    } catch (e: unknown) {
      console.error("Can't connect to mongo server", e);
      await mongoose.disconnect();
    }
  },

  async stop() {
    await mongoose.disconnect();
    console.log('Connection successfully closed')
  },

  async drop() {
    try {
      const collections = mongoose.connection.collections

      for (const collectionName in collections) {
        await collections[collectionName].deleteMany({})
      }
    } catch (e: unknown) {
      console.error('Error in drop db:', e);
      await db.stop();
    }
  },
}