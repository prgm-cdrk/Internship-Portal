// Upload API for applicant resumes (PDF only)
// Saves files to public/uploads/resumes/ with unique filenames
// Returns the file URL path for storing in the database

import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('resume') as File | null;

    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type — PDF only
    if (file.type !== 'application/pdf') {
      return Response.json({ error: 'Only PDF files are accepted' }, { status: 400 });
    }

    // Validate file size — max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: 'File must be under 5MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename: userId_timestamp.pdf
    const filename = `${session.user.id}_${Date.now()}.pdf`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'resumes');

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const resumeUrl = `/uploads/resumes/${filename}`;

    return Response.json({ resumeUrl }, { status: 200 });
  } catch (error) {
    console.error('Error uploading resume:', error);
    return Response.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
