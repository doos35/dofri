import rateLimit from 'express-rate-limit';

// Limite générale API : 100 requêtes / minute par IP
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes, réessayez dans une minute' },
});

// Limite stricte pour les actions (vote, signalement) : 20 / minute par IP
export const actionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop d\'actions, réessayez dans une minute' },
});

// Limite pour les clics : 60 / minute par IP (plus souple)
export const clickLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de clics enregistrés, réessayez dans une minute' },
});
