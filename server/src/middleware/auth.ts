import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { username: string; jti?: string; exp?: number };
}

/**
 * Liste de révocation in-memory : jti -> exp (timestamp UNIX en secondes).
 * Vidée au redémarrage du serveur. Les tokens révoqués deviennent à nouveau
 * valides après restart, mais comme leur durée de vie est courte (8h), c'est
 * un compromis acceptable sans store persistant.
 */
const revoked = new Map<string, number>();

// Sweep des entrées expirées toutes les 10 minutes pour éviter la fuite mémoire.
setInterval(() => {
  const now = Math.floor(Date.now() / 1000);
  for (const [jti, exp] of revoked) {
    if (exp <= now) revoked.delete(jti);
  }
}, 10 * 60 * 1000).unref?.();

export function revokeJti(jti: string, exp: number): void {
  revoked.set(jti, exp);
}

export function isRevoked(jti: string | undefined): boolean {
  return jti != null && revoked.has(jti);
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentification requise' });
    return;
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { username: string; jti?: string; exp?: number };
    if (isRevoked(decoded.jti)) {
      res.status(401).json({ error: 'Token révoqué' });
      return;
    }
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}
