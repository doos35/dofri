import { Router, Request, Response } from 'express';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import { ScreenshotCacheModel, LinkModel } from '../db/models';
import { requireAuth } from '../middleware/auth';

const router = Router();

const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024; // 5 MB

// Rate limit strict : 10 screenshots / minute par IP
const screenshotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes de captures, réessayez dans une minute' },
});

/** Vérifie que l'URL est publique (pas d'IP privée / localhost / SSRF) */
function isAllowedUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    const host = parsed.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') return false;
    if (host === '0.0.0.0' || host.endsWith('.local')) return false;
    if (host === '169.254.169.254') return false;
    if (/^(10|172\.(1[6-9]|2\d|3[01])|192\.168)\./.test(host)) return false;
    return true;
  } catch {
    return false;
  }
}

/** Génère un screenshot via Microlink et le stocke en cache. Retourne true si succès. */
export async function generateScreenshot(url: string): Promise<boolean> {
  try {
    if (!isAllowedUrl(url)) return false;

    // Vérifier si déjà en cache
    const existing = await ScreenshotCacheModel.findOne({ url });
    if (existing) return true;

    // Étape 1 : appeler l'API Microlink en JSON pour obtenir l'URL du screenshot
    const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false`;
    const metaResponse = await axios.get(microlinkUrl, {
      timeout: 20000,
      responseType: 'json',
    });

    const screenshotImageUrl = metaResponse.data?.data?.screenshot?.url;
    if (!screenshotImageUrl) return false;

    // Étape 2 : télécharger l'image
    const imgResponse = await axios.get(screenshotImageUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
      maxContentLength: MAX_SCREENSHOT_SIZE,
    });

    const contentType = imgResponse.headers['content-type'] || 'image/png';
    if (!contentType.startsWith('image/')) return false;

    const imageData = Buffer.from(imgResponse.data);
    if (imageData.length > MAX_SCREENSHOT_SIZE) return false;

    await ScreenshotCacheModel.findOneAndUpdate(
      { url },
      { url, imageData, contentType, cachedAt: new Date() },
      { upsert: true }
    );

    return true;
  } catch {
    return false;
  }
}

/** GET / — Sert uniquement depuis le cache MongoDB */
router.get('/', screenshotLimiter, async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;
    if (!url) {
      res.status(400).json({ error: 'Paramètre "url" requis' });
      return;
    }

    if (!isAllowedUrl(url)) {
      res.status(400).json({ error: 'URL non autorisée' });
      return;
    }

    const cached = await ScreenshotCacheModel.findOne({ url });
    if (!cached) {
      res.status(404).json({ error: 'Aperçu non disponible' });
      return;
    }

    res.set('Content-Type', cached.contentType);
    res.set('Cache-Control', 'public, max-age=86400');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.send(cached.imageData);
  } catch {
    res.status(502).json({ error: 'Impossible de récupérer la capture' });
  }
});

/** POST /generate-all — Génère les screenshots manquants pour tous les liens (admin only) */
router.post('/generate-all', requireAuth, async (_req: Request, res: Response) => {
  try {
    const links = await LinkModel.find({}, { url: 1 }).lean();
    const urls = links.map(l => l.url).filter(u => isAllowedUrl(u));

    // Vérifier lesquels sont déjà en cache
    const cached = await ScreenshotCacheModel.find(
      { url: { $in: urls } },
      { url: 1 }
    ).lean();
    const cachedSet = new Set(cached.map(c => c.url));
    const missing = urls.filter(u => !cachedSet.has(u));

    const total = missing.length;
    let generated = 0;
    let errors = 0;

    // Générer en série avec délai de 2s entre chaque
    for (const url of missing) {
      const success = await generateScreenshot(url);
      if (success) {
        generated++;
      } else {
        errors++;
      }
      // Délai de 2s pour respecter le rate limit Microlink
      if (missing.indexOf(url) < missing.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    res.json({
      total,
      generated,
      errors,
      alreadyCached: urls.length - total,
    });
  } catch {
    res.status(500).json({ error: 'Erreur lors de la génération des aperçus' });
  }
});

export default router;
