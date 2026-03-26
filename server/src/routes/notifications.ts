import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { NotificationModel } from '../db/models';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public — récupérer toutes les notifications (triées par date desc)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const notifications = await NotificationModel.find().sort({ createdAt: -1 }).lean();
    res.json(notifications);
  } catch {
    res.status(500).json({ error: 'Erreur lors de la récupération des notifications' });
  }
});

// Admin — créer une notification
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, content, badge } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Le titre est requis' });
      return;
    }
    const notification = await NotificationModel.create({
      id: uuid(),
      title,
      content: content || '',
      badge: badge || 'nouveau',
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(notification);
  } catch {
    res.status(500).json({ error: 'Erreur lors de la création de la notification' });
  }
});

// Admin — supprimer une notification
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const deleted = await NotificationModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      res.status(404).json({ error: 'Notification non trouvée' });
      return;
    }
    res.json({ message: 'Notification supprimée' });
  } catch {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

export default router;
