import { Router, Request, Response } from 'express';
import * as linkService from '../services/linkService';
import { validateCreateLink, validateUpdateLink } from '../middleware/validateLink';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, category, tags } = req.query;
    const links = await linkService.getAllLinks({
      search: search as string,
      category: category as string,
      tags: tags as string,
    });
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des liens' });
  }
});

router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await linkService.getCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
  }
});

router.get('/tags', async (_req: Request, res: Response) => {
  try {
    const tags = await linkService.getTags();
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des tags' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const link = await linkService.getLinkById(req.params.id);
    if (!link) {
      res.status(404).json({ error: 'Lien non trouvé' });
      return;
    }
    res.json(link);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du lien' });
  }
});

// Click tracking - public (no auth needed)
router.post('/:id/click', async (req: Request, res: Response) => {
  try {
    const link = await linkService.trackClick(req.params.id);
    if (!link) {
      res.status(404).json({ error: 'Lien non trouvé' });
      return;
    }
    res.json({ clicks: link.clicks });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du suivi du clic' });
  }
});

// Toggle favorite - admin only
router.patch('/:id/favorite', requireAuth, async (req: Request, res: Response) => {
  try {
    const link = await linkService.toggleFavorite(req.params.id);
    if (!link) {
      res.status(404).json({ error: 'Lien non trouvé' });
      return;
    }
    res.json(link);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du changement de favori' });
  }
});

router.post('/', requireAuth, validateCreateLink, async (req: Request, res: Response) => {
  try {
    const link = await linkService.createLink(req.body);
    res.status(201).json(link);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la création du lien' });
  }
});

router.put('/:id', requireAuth, validateUpdateLink, async (req: Request, res: Response) => {
  try {
    const link = await linkService.updateLink(req.params.id, req.body);
    if (!link) {
      res.status(404).json({ error: 'Lien non trouvé' });
      return;
    }
    res.json(link);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du lien' });
  }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const deleted = await linkService.deleteLink(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Lien non trouvé' });
      return;
    }
    res.json({ message: 'Lien supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression du lien' });
  }
});

export default router;
