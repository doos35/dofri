import { Router, Request, Response } from 'express';
import * as healthChecker from '../services/healthChecker';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const statuses = await healthChecker.getHealthStatuses();
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des statuts' });
  }
});

router.get('/:linkId', async (req: Request, res: Response) => {
  try {
    const status = await healthChecker.getHealthForLink(req.params.linkId);
    if (!status) {
      res.json({ linkId: req.params.linkId, status: 'unknown', httpCode: null, responseTimeMs: null, lastCheckedAt: null });
      return;
    }
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du statut' });
  }
});

router.post('/check', requireAuth, async (_req: Request, res: Response) => {
  try {
    const results = await healthChecker.checkAllLinks();
    res.json({ message: `Vérification terminée: ${results.length} liens vérifiés`, results });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la vérification' });
  }
});

export default router;
