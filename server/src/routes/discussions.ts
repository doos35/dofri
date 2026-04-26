import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { DiscussionModel, MessageModel } from '../db/models';
import { requireAuth } from '../middleware/auth';
import { actionLimiter } from '../middleware/rateLimiter';

const router = Router();

const MAX_TITLE = 200;
const MAX_NAME = 40;
const MAX_CONTENT = 4000;

function clean(s: unknown, max: number): string {
  return typeof s === 'string' ? s.trim().slice(0, max) : '';
}

// Public — liste des discussions (pinned puis récentes)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const discussions = await DiscussionModel.find()
      .sort({ pinned: -1, lastMessageAt: -1 })
      .lean();
    res.json(discussions);
  } catch {
    res.status(500).json({ error: 'Erreur lors de la récupération des discussions' });
  }
});

// Public — créer une discussion (avec premier message obligatoire)
router.post('/', actionLimiter, async (req: Request, res: Response) => {
  try {
    const title = clean(req.body.title, MAX_TITLE);
    const authorName = clean(req.body.authorName, MAX_NAME);
    const authorId = clean(req.body.authorId, 100);
    const content = clean(req.body.content, MAX_CONTENT);

    if (!title || title.length < 3) {
      res.status(400).json({ error: 'Le titre doit contenir au moins 3 caractères' });
      return;
    }
    if (!authorName || authorName.length < 2) {
      res.status(400).json({ error: 'Le pseudo doit contenir au moins 2 caractères' });
      return;
    }
    if (!authorId) {
      res.status(400).json({ error: 'Identifiant visiteur requis' });
      return;
    }
    if (!content || content.length < 1) {
      res.status(400).json({ error: 'Le message ne peut pas être vide' });
      return;
    }

    const now = new Date().toISOString();
    const discussionId = uuid();

    const discussion = await DiscussionModel.create({
      id: discussionId,
      title,
      authorName,
      authorId,
      createdAt: now,
      updatedAt: now,
      messageCount: 1,
      lastMessageAt: now,
      pinned: false,
    });

    await MessageModel.create({
      id: uuid(),
      discussionId,
      authorName,
      authorId,
      content,
      createdAt: now,
    });

    res.status(201).json(discussion);
  } catch {
    res.status(500).json({ error: 'Erreur lors de la création de la discussion' });
  }
});

// Public — détail d'une discussion + messages
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const discussion = await DiscussionModel.findOne({ id: req.params.id }).lean();
    if (!discussion) {
      res.status(404).json({ error: 'Discussion non trouvée' });
      return;
    }
    const messages = await MessageModel.find({ discussionId: req.params.id })
      .sort({ createdAt: 1 })
      .lean();
    res.json({ ...discussion, messages });
  } catch {
    res.status(500).json({ error: 'Erreur lors de la récupération de la discussion' });
  }
});

// Public — poster un message dans une discussion
router.post('/:id/messages', actionLimiter, async (req: Request, res: Response) => {
  try {
    const discussionId = req.params.id;
    const discussion = await DiscussionModel.findOne({ id: discussionId });
    if (!discussion) {
      res.status(404).json({ error: 'Discussion non trouvée' });
      return;
    }

    const authorName = clean(req.body.authorName, MAX_NAME);
    const authorId = clean(req.body.authorId, 100);
    const content = clean(req.body.content, MAX_CONTENT);

    if (!authorName || authorName.length < 2) {
      res.status(400).json({ error: 'Le pseudo doit contenir au moins 2 caractères' });
      return;
    }
    if (!authorId) {
      res.status(400).json({ error: 'Identifiant visiteur requis' });
      return;
    }
    if (!content) {
      res.status(400).json({ error: 'Le message ne peut pas être vide' });
      return;
    }

    const now = new Date().toISOString();
    const message = await MessageModel.create({
      id: uuid(),
      discussionId,
      authorName,
      authorId,
      content,
      createdAt: now,
    });

    await DiscussionModel.updateOne(
      { id: discussionId },
      { $inc: { messageCount: 1 }, $set: { lastMessageAt: now, updatedAt: now } }
    );

    res.status(201).json(message);
  } catch {
    res.status(500).json({ error: "Erreur lors de l'envoi du message" });
  }
});

// Admin — supprimer un message
router.delete('/:id/messages/:messageId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id, messageId } = req.params;
    const deleted = await MessageModel.findOneAndDelete({ id: messageId, discussionId: id });
    if (!deleted) {
      res.status(404).json({ error: 'Message non trouvé' });
      return;
    }
    const remaining = await MessageModel.countDocuments({ discussionId: id });
    const last = await MessageModel.findOne({ discussionId: id })
      .sort({ createdAt: -1 })
      .lean();
    await DiscussionModel.updateOne(
      { id },
      {
        $set: {
          messageCount: remaining,
          lastMessageAt: last?.createdAt || new Date().toISOString(),
        },
      }
    );
    res.json({ message: 'Message supprimé' });
  } catch {
    res.status(500).json({ error: 'Erreur lors de la suppression du message' });
  }
});

// Admin — supprimer une discussion entière
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const deleted = await DiscussionModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      res.status(404).json({ error: 'Discussion non trouvée' });
      return;
    }
    await MessageModel.deleteMany({ discussionId: req.params.id });
    res.json({ message: 'Discussion supprimée' });
  } catch {
    res.status(500).json({ error: 'Erreur lors de la suppression de la discussion' });
  }
});

// Admin — épingler / désépingler
router.patch('/:id/pin', requireAuth, async (req: Request, res: Response) => {
  try {
    const discussion = await DiscussionModel.findOne({ id: req.params.id });
    if (!discussion) {
      res.status(404).json({ error: 'Discussion non trouvée' });
      return;
    }
    discussion.pinned = !discussion.pinned;
    await discussion.save();
    res.json(discussion);
  } catch {
    res.status(500).json({ error: 'Erreur lors du changement épinglage' });
  }
});

export default router;
