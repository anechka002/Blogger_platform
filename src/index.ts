import express from 'express';
import { setupApp } from './setup-app';
import { SETTINGS } from './core/settings/settings';
import {db} from './db/mongo.db';

const bootstrap = async () => {
  const app = express();

  // Можно доверять заголовку X-Forwarded-For и брать IP клиента оттуда.
  app.set('trust proxy', true)

  setupApp(app);

  const PORT = SETTINGS.PORT;

  await db.run(SETTINGS.MONGO_URL);
  await db.createIndexes()

  app.listen(PORT, () => {
    console.log(`Я завелся на ${PORT} порту`);
  });
  return app;
};

bootstrap();