import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET!;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

/** Comparaison à temps constant pour éviter les timing attacks */
function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Comparer quand même pour garder un temps constant
    crypto.timingSafeEqual(bufA, Buffer.alloc(bufA.length));
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// Max 5 tentatives de login par fenêtre de 15 minutes par IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // ne compte pas les connexions réussies
});

router.post('/login', loginLimiter, (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
    return;
  }

  if (!timingSafeEqual(username, ADMIN_USERNAME) || !timingSafeEqual(password, ADMIN_PASSWORD)) {
    res.status(401).json({ error: 'Identifiants incorrects' });
    return;
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '8h' });

  res.json({ token, username });
});

router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ username: req.user?.username });
});

export default router;
