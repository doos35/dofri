import { Request, Response, NextFunction } from 'express';

export function validateCreateLink(req: Request, res: Response, next: NextFunction): void {
  const { title, url, category } = req.body;

  const errors: string[] = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Le titre est requis');
  }

  if (!url || typeof url !== 'string') {
    errors.push("L'URL est requise");
  } else {
    try {
      new URL(url);
    } catch {
      errors.push("L'URL n'est pas valide");
    }
  }

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('La catégorie est requise');
  }

  if (errors.length > 0) {
    res.status(400).json({ error: 'Validation échouée', details: errors });
    return;
  }

  next();
}

export function validateUpdateLink(req: Request, res: Response, next: NextFunction): void {
  const { url } = req.body;

  if (url !== undefined) {
    try {
      new URL(url);
    } catch {
      res.status(400).json({ error: "L'URL n'est pas valide" });
      return;
    }
  }

  next();
}
