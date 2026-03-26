import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

async function reseed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[Reseed] MONGODB_URI manquante — crée un fichier server/.env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('[Reseed] Connecté à MongoDB');

  // Drop les deux collections
  const db = mongoose.connection.db!;
  const collections = await db.listCollections().toArray();
  const names = collections.map(c => c.name);

  if (names.includes('links')) {
    await db.dropCollection('links');
    console.log('[Reseed] Collection "links" supprimée');
  }
  if (names.includes('healthstatuses')) {
    await db.dropCollection('healthstatuses');
    console.log('[Reseed] Collection "healthstatuses" supprimée');
  }

  // Réinsère depuis links.json
  const linksPath = path.join(__dirname, '../src/storage/data/links.json');
  const links = JSON.parse(fs.readFileSync(linksPath, 'utf-8'));

  const linkCollection = db.collection('links');
  await linkCollection.insertMany(links);
  console.log(`[Reseed] ${links.length} liens insérés`);

  await mongoose.disconnect();
  console.log('[Reseed] Terminé');
}

reseed().catch(err => {
  console.error('[Reseed] Erreur:', err);
  process.exit(1);
});
