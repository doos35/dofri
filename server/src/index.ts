import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import axios from 'axios';
import cron from 'node-cron';
import { connectDB } from './db/connection';
import { startHealthCheckCron } from './services/healthChecker';

const PORT = process.env.PORT || 3001;

function startKeepAlivePing(): void {
  const selfUrl = process.env.RENDER_EXTERNAL_URL;
  if (!selfUrl) return; // pas sur Render, on ne fait rien

  console.log(`[KeepAlive] Self-ping activé → ${selfUrl}/api/health toutes les 10 min`);

  cron.schedule('*/10 * * * *', async () => {
    try {
      await axios.get(`${selfUrl}/api/health`, { timeout: 10000 });
    } catch {
      // silencieux — l'important c'est que la requête parte
    }
  });
}

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[Server] Démarré sur http://localhost:${PORT}`);
      startHealthCheckCron();
      startKeepAlivePing();
    });
  })
  .catch(err => {
    console.error('[Server] Impossible de démarrer — erreur DB:', err);
    process.exit(1);
  });
