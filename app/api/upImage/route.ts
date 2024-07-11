import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import sqlite3 from 'sqlite3';

const pump = promisify(pipeline);

// Initialize the database
const db = new sqlite3.Database(path.join(process.cwd(), 'uploads.db'));

// Create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      image_path TEXT NOT NULL,
      FOREIGN KEY (form_id) REFERENCES forms(id)
    )
  `);
});

export async function POST(req: any) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files');
    const name = formData.get('name');
    const uploadedFiles: any = [];

    // Start a database transaction
    db.serialize(async () => {
      // Insert form data
      const formId = await new Promise<number>((resolve, reject) => {
        db.run("INSERT INTO forms (name) VALUES (?)", [name], function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });

      for (const file of files) {
        // Generate a unique filename
        const timestamp = Date.now();
        const uniqueId = uuidv4();
        const fileExtension = file.name.split('.').pop();
        const newFileName = `${timestamp}-${uniqueId}.${fileExtension}`;
        const filePath = path.join(process.cwd(), 'public/uploads', newFileName);

        // Ensure uploads directory exists
        fs.mkdirSync(path.join(process.cwd(), 'public/uploads'), { recursive: true });

        // Save the file
        await pump(file.stream(), fs.createWriteStream(filePath));

        // Save image information to the database
        await new Promise<void>((resolve, reject) => {
          db.run("INSERT INTO images (form_id, image_path) VALUES (?, ?)", [formId, newFileName], function (err) {
            if (err) reject(err);
            else resolve();
          });
        });

        uploadedFiles.push({ name: newFileName, size: file.size });
      }
    });

    return NextResponse.json({
      status: "success",
      files: uploadedFiles
    });
  } catch (e: any) {
    return NextResponse.json({
      status: "fail",
      data: e.message
    });
  }
}

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
