// Logo upload API route
// Receives an image file, validates it, saves to public/uploads/logos/
// Returns the logo URL

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('logo') as File | null;

    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: 'Only PNG, JPG, and WebP images are accepted' }, { status: 400 });
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      return Response.json({ error: 'File must be under 2MB' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'logos');
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'png';
    const filename = `logo-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filepath = join(uploadDir, filename);

    await writeFile(filepath, buffer);

    // Return the public URL
    const logoUrl = `/uploads/logos/${filename}`;
    return Response.json({ logoUrl }, { status: 200 });

  } catch (error) {
    console.error('Logo upload error:', error);
    return Response.json({ error: 'Failed to upload logo' }, { status: 500 });
  }
}
