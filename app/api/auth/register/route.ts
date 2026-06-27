// This API route handles new user registration
// It receives email, name, password, and role from the registration form
// Validates the input, hashes the password, and saves the user to the database

import { PrismaClient } from '@/src/generated/prisma';
import bcrypt from 'bcryptjs';

// Create a Prisma client instance to interact with the database
const prisma = new PrismaClient();

// Handle POST requests to /api/auth/register
export async function POST(req: Request) {
  try {
    // Extract form data from the request body
    const { email, name, password, role } = await req.json();

    // Validate that all required fields are provided
    if (!email || !name || !password || !role) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if a user with this email already exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    // If user exists, return an error (status 400 = Bad Request)
    if (existingUser) {
      return Response.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash the password with bcrypt (10 = salt rounds, higher = more secure but slower)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user record in the database
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,   // Store the hashed password, not the plain text
        role
      }
    });

    // Return success response with user data (status 201 = Created)
    // Exclude password from the response for security
    return Response.json({ 
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, name: user.name }
    }, { status: 201 });

  } catch (error) {
    // Log the error for debugging and return a generic error message
    console.error('Registration error:', error);
    return Response.json({ error: 'Registration failed' }, { status: 500 });
  }
}
