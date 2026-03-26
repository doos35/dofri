import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './db/connection';
import { startHealthCheckCron } from './services/healthChecker';

const PORT = process.env.PORT || 3001;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[Server] Démarré sur http://localhost:${PORT}`);
      startHealthCheckCron();
    });
  })
  .catch(err => {
    console.error('[Server] Impossible de démarrer — erreur DB:', err);
    process.exit(1);
  });
