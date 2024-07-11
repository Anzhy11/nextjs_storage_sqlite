import { NextResponse } from "next/server";
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Initialize the database
const db = new sqlite3.Database(path.join(process.cwd(), 'uploads.db'));

export async function DELETE(req: Request) {
  try {
    const { formId, imageName }: { formId: number; imageName: string } = await req.json();

    // Delete image from the filesystem
    const filePath = path.join(process.cwd(), 'public/uploads', imageName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete image record from the database
    await new Promise<void>((resolve, reject) => {
      db.run("DELETE FROM images WHERE form_id = ? AND image_path = ?", [formId, imageName], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    return NextResponse.json({ status: "success" });
  } catch (e: any) {
    return NextResponse.json({
      status: "fail",
      data: e.message
    });
  }
}
