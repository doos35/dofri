import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { startHealthCheckCron } from './services/healthChecker';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`[Server] Démarré sur http://localhost:${PORT}`);
  startHealthCheckCron();
});
