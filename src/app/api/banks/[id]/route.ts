import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    
    // The id is in format "default-FileName"
    const id = resolvedParams.id;
    if (!id.startsWith('default-')) {
      return NextResponse.json({ error: 'Invalid bank ID' }, { status: 400 });
    }

    const filename = `${id.replace('default-', '')}.json`;
    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Bank file not found' }, { status: 404 });
    }

    // Clean up the id from the JSON body before saving back to file
    const bankData = { ...body };
    delete bankData.id;

    fs.writeFileSync(filePath, JSON.stringify(bankData, null, 2), 'utf8');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update bank' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    if (!id.startsWith('default-')) {
      return NextResponse.json({ error: 'Invalid bank ID' }, { status: 400 });
    }

    const filename = `${id.replace('default-', '')}.json`;
    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete bank' }, { status: 500 });
  }
}

