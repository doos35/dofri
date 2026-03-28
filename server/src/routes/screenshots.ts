import { Router, Request, Response } from 'express';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import { ScreenshotCacheModel } from '../db/models';

const router = Router();

const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024; // 5 MB

// Rate limit strict : 10 screenshots / minute par IP (appels externes coûteux)
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
    // Bloquer localhost, IPs privées, metadata cloud
    if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') return false;
    if (host === '0.0.0.0' || host.endsWith('.local')) return false;
    if (host === '169.254.169.254') return false; // AWS metadata
    if (/^(10|172\.(1[6-9]|2\d|3[01])|192\.168)\./.test(host)) return false;
    return true;
  } catch {
    return false;
  }
}

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

    // Vérifier le cache
    const cached = await ScreenshotCacheModel.findOne({ url });
    if (cached) {
      res.set('Content-Type', cached.contentType);
      res.set('Cache-Control', 'public, max-age=86400');
      res.send(cached.imageData);
      return;
    }

    // Étape 1 : appeler l'API Microlink en JSON pour obtenir l'URL du screenshot
    const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false`;
    const metaResponse = await axios.get(microlinkUrl, {
      timeout: 20000,
      responseType: 'json',
    });

    const screenshotImageUrl = metaResponse.data?.data?.screenshot?.url;
    if (!screenshotImageUrl) {
      res.status(502).json({ error: 'Impossible de récupérer la capture' });
      return;
    }

    // Étape 2 : télécharger l'image depuis l'URL du screenshot
    const imgResponse = await axios.get(screenshotImageUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
      maxContentLength: MAX_SCREENSHOT_SIZE,
    });

    const contentType = imgResponse.headers['content-type'] || 'image/png';

    // Vérifier que c'est bien une image
    if (!contentType.startsWith('image/')) {
      res.status(502).json({ error: 'Réponse non-image reçue' });
      return;
    }

    const imageData = Buffer.from(imgResponse.data);

    if (imageData.length > MAX_SCREENSHOT_SIZE) {
      res.status(502).json({ error: 'Image trop volumineuse' });
      return;
    }

    // Stocker en cache (fire-and-forget)
    ScreenshotCacheModel.create({ url, imageData, contentType }).catch(() => {});

    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(imageData);
  } catch {
    res.status(502).json({ error: 'Impossible de récupérer la capture' });
  }
});

export default router;
