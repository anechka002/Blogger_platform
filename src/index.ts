import express from 'express';
import { setupApp } from './setup-app';
import { SETTINGS } from './core/settings/settings';
import {db} from './db/mongo.db';

const bootstrap = async () => {
  const app = express();
  setupApp(app);
  const PORT = SETTINGS.PORT;

  await db.run(SETTINGS.MONGO_URL);
  await db.createIndex()

  app.listen(PORT, () => {
    console.log(`Я завелся на ${PORT} порту`);
  });
  return app;
};

bootstrap();