import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    const files = fs.readdirSync(uploadsDir).map(file => ({
      name: file,
      size: fs.statSync(path.join(uploadsDir, file)).size
    }));
    return NextResponse.json(files);
  } catch (e: any) {
    return NextResponse.json({
      status: "fail",
      data: e.message
    });
  }
}
