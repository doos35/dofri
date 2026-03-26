import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const newLinks = [
  {
    id: 'dofri-0036-4000-8000-000000000036',
    title: 'AI Agents Directory',
    url: 'https://aiagentsdirectory.com/',
    description: "Annuaire complet d'agents IA classés par catégorie et cas d'usage.",
    category: 'IA',
    tags: ['ia', 'agents', 'annuaire', 'outils'],
    icon: 'https://www.google.com/s2/favicons?domain=aiagentsdirectory.com&sz=64',
    favorite: false,
    clicks: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'dofri-0037-4000-8000-000000000037',
    title: 'AIxploria',
    url: 'https://www.aixploria.com/',
    description: "Moteur de recherche et répertoire d'outils IA avec fiches détaillées et avis.",
    category: 'IA',
    tags: ['ia', 'outils', 'annuaire', 'recherche'],
    icon: 'https://www.google.com/s2/favicons?domain=aixploria.com&sz=64',
    favorite: false,
    clicks: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'dofri-0038-4000-8000-000000000038',
    title: 'AI Agents List',
    url: 'https://aiagentslist.com/',
    description: "Liste collaborative d'agents IA avec descriptions, prix et comparatifs.",
    category: 'IA',
    tags: ['ia', 'agents', 'comparatif', 'liste'],
    icon: 'https://www.google.com/s2/favicons?domain=aiagentslist.com&sz=64',
    favorite: false,
    clicks: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

async function insertNew() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[Insert] MONGODB_URI manquante — crée un fichier server/.env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('[Insert] Connecté à MongoDB');

  const db = mongoose.connection.db!;
  const collection = db.collection('links');

  let inserted = 0;
  for (const link of newLinks) {
    const exists = await collection.findOne({ id: link.id });
    if (exists) {
      console.log(`[Insert] "${link.title}" existe déjà — ignoré`);
    } else {
      await collection.insertOne(link);
      console.log(`[Insert] "${link.title}" inséré`);
      inserted++;
    }
  }

  console.log(`[Insert] Terminé — ${inserted} lien(s) ajouté(s)`);
  await mongoose.disconnect();
}

insertNew().catch(err => {
  console.error('[Insert] Erreur:', err);
  process.exit(1);
});
