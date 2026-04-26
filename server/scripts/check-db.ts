import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const db = mongoose.connection.db!;

  const collections = await db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));

  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`  ${col.name}: ${count} docs`);
  }

  const iaLinks = await db.collection('links').find({ category: 'IA' }).toArray();
  console.log('\nIA links in "links" collection:', iaLinks.length);
  if (iaLinks.length > 0) console.log('First:', iaLinks[0].title, iaLinks[0].id);

  await mongoose.disconnect();
}
check();
