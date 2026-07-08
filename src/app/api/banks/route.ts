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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, bankName } = body;
    
    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }

    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const safeSubject = subject.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const safeBankName = bankName ? bankName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'default';
    const filename = `${safeSubject}_${safeBankName}.json`;
    const filePath = path.join(dataDir, filename);

    if (fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Bank already exists' }, { status: 400 });
    }

    const newBank = {
      metadata: {
        subject: subject,
        bankName: bankName || undefined,
        version: "1.0",
        author: "System"
      },
      examTemplates: [
        {
          id: "tpl_10",
          name: "Luyện tập nhanh (10 câu)",
          description: "Lấy ngẫu nhiên 10 câu hỏi từ ngân hàng",
          shuffleQuestions: true,
          shuffleAnswers: true,
          rules: [{ type: "default", count: 10 }]
        },
        {
          id: "tpl_20",
          name: "Luyện tập tiêu chuẩn (20 câu)",
          description: "Lấy ngẫu nhiên 20 câu hỏi từ ngân hàng",
          shuffleQuestions: true,
          shuffleAnswers: true,
          rules: [{ type: "default", count: 20 }]
        },
        {
          id: "tpl_all",
          name: "Luyện tập toàn bộ",
          description: "Ôn tập tất cả câu hỏi có trong ngân hàng",
          shuffleQuestions: true,
          shuffleAnswers: true,
          rules: [{ type: "default", count: 9999 }]
        }
      ],
      questions: []
    };

    fs.writeFileSync(filePath, JSON.stringify(newBank, null, 2), 'utf8');

    return NextResponse.json({ success: true, id: `default-${safeSubject}_${safeBankName}` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create new bank' }, { status: 500 });
  }
}
