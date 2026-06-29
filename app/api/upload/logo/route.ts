// Logo upload API route
// Receives an image file, validates it, saves to public/uploads/logos/
// Returns the logo URL

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('logo') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only PNG, JPG, and WebP images are accepted' }, { status: 400 });
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 2MB' }, { status: 400 });
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos');
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'png';
    const filename = `logo-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Convert file to buffer and write
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    // Return the public URL
    const logoUrl = `/uploads/logos/${filename}`;
    return NextResponse.json({ logoUrl }, { status: 200 });

  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 });
  }
}
