import { Router, Request, Response } from 'express';
import * as linkService from '../services/linkService';
import * as ratingService from '../services/ratingService';
import * as reportService from '../services/reportService';
import { validateCreateLink, validateUpdateLink } from '../middleware/validateLink';
import { requireAuth } from '../middleware/auth';
import { actionLimiter, clickLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, category, tags, sort } = req.query;
    const links = await linkService.getAllLinks({
      search: search as string,
      category: category as string,
      tags: tags as string,
      sort: sort as string,
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

// Ratings - public
router.get('/ratings', async (req: Request, res: Response) => {
  try {
    const visitorId = req.query.visitorId as string | undefined;
    const summaries = await ratingService.getBulkRatingSummaries(visitorId);
    res.json(summaries);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des notes' });
  }
});

router.post('/:id/rate', actionLimiter, async (req: Request, res: Response) => {
  try {
    const { visitorId, score } = req.body;
    if (!visitorId || typeof score !== 'number' || score < 1 || score > 5) {
      res.status(400).json({ error: 'visitorId et score (1-5) requis' });
      return;
    }
    const summary = await ratingService.rateLink(req.params.id, visitorId, score);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la notation' });
  }
});

// Report dead link - public
router.post('/:id/report-dead', actionLimiter, async (req: Request, res: Response) => {
  try {
    const { visitorId } = req.body;
    if (!visitorId) {
      res.status(400).json({ error: 'visitorId requis' });
      return;
    }
    const report = await reportService.reportDeadLink(req.params.id, visitorId);
    if (!report) {
      res.json({ alreadyReported: true });
      return;
    }
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du signalement' });
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
router.post('/:id/click', clickLimiter, async (req: Request, res: Response) => {
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

// Bulk import - admin only
router.post('/import', requireAuth, async (req: Request, res: Response) => {
  try {
    const { links } = req.body;
    if (!Array.isArray(links) || links.length === 0) {
      res.status(400).json({ error: 'Un tableau "links" non vide est requis' });
      return;
    }
    if (links.length > 200) {
      res.status(400).json({ error: 'Maximum 200 liens par import' });
      return;
    }

    const results = { created: 0, skipped: 0, errors: [] as string[] };

    for (const item of links) {
      try {
        if (!item.title || !item.url || !item.category) {
          results.errors.push(`"${item.title || item.url || '?'}" — titre, url et catégorie requis`);
          results.skipped++;
          continue;
        }
        await linkService.createLink({
          title: item.title,
          url: item.url,
          description: item.description || '',
          category: item.category,
          tags: Array.isArray(item.tags) ? item.tags : [],
          icon: item.icon || '',
        });
        results.created++;
      } catch {
        results.errors.push(`"${item.title || item.url}" — erreur d'insertion`);
        results.skipped++;
      }
    }

    res.status(201).json(results);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de l'import" });
  }
});

// Reorder links - admin only
router.put('/reorder', requireAuth, async (req: Request, res: Response) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      res.status(400).json({ error: 'Un tableau "orderedIds" est requis' });
      return;
    }
    await linkService.reorderLinks(orderedIds);
    res.json({ message: 'Ordre mis à jour' });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors du réordonnement" });
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
