import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import linksRouter from './routes/links';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Faire confiance au premier proxy (nginx, Cloudflare, etc.)
app.set('trust proxy', 1);

// Headers de sécurité
app.use(helmet({
  // CSP désactivé pour ne pas casser les ressources externes (Google Fonts, Microlink, favicons)
  contentSecurityPolicy: false,
  // Autoriser les iframes dans l'app (aperçu Microlink)
  crossOriginEmbedderPolicy: false,
}));

// CORS restreint à l'origine déclarée en variable d'environnement
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (same-origin, outils CLI)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origine non autorisée — ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/links', linksRouter);
app.use('/api/health', healthRouter);

// Serve client build in production
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.use(errorHandler);

export default app;
