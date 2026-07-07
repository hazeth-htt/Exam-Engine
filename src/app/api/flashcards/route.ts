import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      return NextResponse.json([]);
    }
    const files = fs.readdirSync(dataDir).filter(f => f.startsWith('flashcards') && f.endsWith('.json'));
    const decks = [];
    for (const file of files) {
      const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          decks.push(...parsed);
        } else {
          decks.push(parsed);
        }
      } catch(e) {
        console.error(`Failed to parse ${file}`, e);
      }
    }
    return NextResponse.json(decks);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to read data directory' }, { status: 500 });
  }
}
