import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      return NextResponse.json([]);
    }
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
    const banks = [];
    for (const file of files) {
      const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
      try {
        const parsed = JSON.parse(content);
        // Inject a stable ID based on filename to overwrite correctly in IndexedDB
        parsed.id = `default-${file.replace('.json', '')}`;
        banks.push(parsed);
      } catch(e) {
        console.error(`Failed to parse ${file}`, e);
      }
    }
    return NextResponse.json(banks);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to read data directory' }, { status: 500 });
  }
}
