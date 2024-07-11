import { NextResponse } from "next/server";
import sqlite3 from 'sqlite3';
import path from 'path';

// Initialize the database
const db = new sqlite3.Database(path.join(process.cwd(), 'uploads.db'));

export async function GET() {
  try {
    // Fetch names and images with IDs
    const names = await new Promise<any[]>((resolve, reject) => {
      db.all("SELECT id, name FROM forms", [], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    const images = await new Promise<any[]>((resolve, reject) => {
      db.all("SELECT form_id, image_path FROM images", [], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    // Combine data
    const result = names.map(name => {
      const associatedImages = images
        .filter(image => image.form_id === name.id)
        .map(image => image.image_path);

      return {
        id: name.id,
        name: name.name,
        images: associatedImages
      };
    });

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({
      status: "fail",
      data: e.message
    });
  }
}
