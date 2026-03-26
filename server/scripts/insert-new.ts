import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const newLinks = [
  {
    id: 'dofri-0039-4000-8000-000000000039',
    title: 'Hunyuan3D',
    url: 'https://3d-models.hunyuan.tencent.com/',
    description: "Générateur de modèles 3D par IA développé par Tencent. Créez des assets 3D à partir de texte ou d'images.",
    category: 'IA',
    tags: ['ia', '3d', 'génération', 'modèles'],
    icon: 'https://www.google.com/s2/favicons?domain=3d-models.hunyuan.tencent.com&sz=64',
    favorite: false,
    clicks: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'dofri-0040-4000-8000-000000000040',
    title: 'Wan Video',
    url: 'https://wan.video/',
    description: "Outil IA de génération vidéo. Créez des vidéos à partir de texte ou d'images.",
    category: 'IA',
    tags: ['ia', 'vidéo', 'génération', 'outils'],
    icon: 'https://www.google.com/s2/favicons?domain=wan.video&sz=64',
    favorite: false,
    clicks: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'dofri-0041-4000-8000-000000000041',
    title: 'SwitchRom',
    url: 'https://switchrom.net/',
    description: 'Catalogue de ROMs Nintendo Switch téléchargeables.',
    category: 'Jeux',
    tags: ['roms', 'nintendo', 'switch', 'téléchargement'],
    icon: 'https://www.google.com/s2/favicons?domain=switchrom.net&sz=64',
    favorite: false,
    clicks: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'dofri-0042-4000-8000-000000000042',
    title: 'RomStation',
    url: 'https://www.romstation.fr/',
    description: "Plateforme française de téléchargement de ROMs avec émulateur intégré. Large catalogue rétro et consoles récentes.",
    category: 'Jeux',
    tags: ['roms', 'émulateur', 'rétro', 'téléchargement'],
    icon: 'https://www.google.com/s2/favicons?domain=romstation.fr&sz=64',
    favorite: false,
    clicks: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'dofri-0043-4000-8000-000000000043',
    title: 'LiveWatch',
    url: 'https://livewatch.sbs',
    description: 'Streaming live de chaînes TV et événements sportifs en direct.',
    category: 'TV en direct',
    tags: ['tv', 'live', 'streaming', 'sport'],
    icon: 'https://www.google.com/s2/favicons?domain=livewatch.sbs&sz=64',
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
