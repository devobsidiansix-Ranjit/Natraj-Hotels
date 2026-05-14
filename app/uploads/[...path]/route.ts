import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function GET(req: Request, { params }: { params: { path: string[] } }) {
  try {
    const filename = params.path.join('/');
    const filePath = path.join(process.cwd(), "uploads", filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    const buffer = await readFile(filePath);
    const fileExtension = filename.split('.').pop()?.toLowerCase();
    
    let contentType = 'image/jpeg';
    if (fileExtension === 'png') contentType = 'image/png';
    else if (fileExtension === 'gif') contentType = 'image/gif';
    else if (fileExtension === 'webp') contentType = 'image/webp';
    else if (fileExtension === 'svg') contentType = 'image/svg+xml';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
