import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, 'data');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export async function readJSON<T>(filename: string): Promise<T> {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    await writeJSON(filename, []);
    return [] as unknown as T;
  }
  const raw = await fs.promises.readFile(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export async function writeJSON<T>(filename: string, data: T): Promise<void> {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  const tmpPath = filePath + '.tmp';
  await fs.promises.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  await fs.promises.rename(tmpPath, filePath);
}
