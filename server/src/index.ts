import 'dotenv/config';

import app from './app';
import axios from 'axios';
import cron from 'node-cron';
import { connectDB } from './db/connection';
import { startHealthCheckCron } from './services/healthChecker';

// Vérifier les variables d'environnement critiques au démarrage
const requiredEnvVars = ['JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD', 'MONGODB_URI'];
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`[FATAL] Variable d'environnement manquante : ${key}`);
    process.exit(1);
  }
}
if (process.env.JWT_SECRET!.length < 32) {
  console.error('[FATAL] JWT_SECRET doit faire au moins 32 caractères');
  process.exit(1);
}

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
