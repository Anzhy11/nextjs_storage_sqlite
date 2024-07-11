import { NextResponse } from "next/server";
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Initialize the database
const db = new sqlite3.Database(path.join(process.cwd(), 'uploads.db'));

type Row = {
  name: string
  image_path: any
}

export async function DELETE(req: Request) {
  try {
    const { id }: { id: number } = await req.json();

    // Get image paths for the name
    const imagePaths = await new Promise<string[]>((resolve, reject) => {
      db.all("SELECT image_path FROM images WHERE form_id = ?", [id], (err, rows: Row[]) => {
        if (err) reject(err);
        resolve(rows.map(row => row.image_path));
      });
    });

    // Delete images from the filesystem
    imagePaths.forEach(imagePath => {
      const filePath = path.join(process.cwd(), 'public/uploads', imagePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // Delete the name and associated images from the database
    await new Promise<void>((resolve, reject) => {
      db.serialize(() => {
        db.run("DELETE FROM images WHERE form_id = ?", [id], (err) => {
          if (err) reject(err);
        });
        db.run("DELETE FROM forms WHERE id = ?", [id], (err) => {
          if (err) reject(err);
          resolve();
        });
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
