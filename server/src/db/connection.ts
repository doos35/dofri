import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { LinkModel } from './models';
import { Link } from '../types';

async function seedIfEmpty(): Promise<void> {
  const count = await LinkModel.countDocuments();
  if (count > 0) return;

  // Cherche links.json à côté du fichier compilé (dist) ou du source (dev)
  const candidates = [
    path.join(__dirname, '../storage/data/links.json'),
    path.join(process.cwd(), 'src/storage/data/links.json'),
  ];

  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const links: Link[] = JSON.parse(raw);
        if (links.length > 0) {
          await LinkModel.insertMany(links);
          console.log(`[DB] ${links.length} liens importés depuis links.json`);
        }
      } catch (err) {
        console.error('[DB] Erreur lors du seeding:', err);
      }
      return;
    }
  }

  console.warn('[DB] links.json introuvable — collection démarrée vide');
}

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('[DB] MONGODB_URI manquante dans les variables d\'environnement');

  await mongoose.connect(uri);
  console.log('[DB] Connecté à MongoDB');

  await seedIfEmpty();
}
