import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import * as reportService from '../services/reportService';

const router = Router();

router.get('/', requireAuth, async (_req: Request, res: Response) => {
  try {
    const [reports, undismissedCount] = await Promise.all([
      reportService.getUndismissedReports(),
      reportService.getUndismissedCount(),
    ]);
    res.json({ reports, undismissedCount });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des signalements' });
  }
});

router.get('/count', requireAuth, async (_req: Request, res: Response) => {
  try {
    const count = await reportService.getUndismissedCount();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du comptage des signalements' });
  }
});

router.patch('/:id/dismiss', requireAuth, async (req: Request, res: Response) => {
  try {
    const success = await reportService.dismissReport(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Signalement non trouvé' });
      return;
    }
    res.json({ message: 'Signalement traité' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du traitement du signalement' });
  }
});

router.post('/dismiss-all', requireAuth, async (_req: Request, res: Response) => {
  try {
    const count = await reportService.dismissAllReports();
    res.json({ message: `${count} signalement(s) traité(s)` });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du traitement des signalements' });
  }
});

export default router;
