import { Router, Request, Response } from 'express';
import axios from 'axios';
import { ScreenshotCacheModel } from '../db/models';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;
    if (!url) {
      res.status(400).json({ error: 'Paramètre "url" requis' });
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

    // Récupérer depuis Microlink
    const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
    const response = await axios.get(microlinkUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
    });

    const contentType = response.headers['content-type'] || 'image/png';
    const imageData = Buffer.from(response.data);

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
