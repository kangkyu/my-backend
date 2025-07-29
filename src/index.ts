import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { prisma } from './lib/prisma';
import { validateUserSignup, formatValidationErrors } from './lib/validation';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { posts: true }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/users', async (req, res) => {
  try {
    // Validate input using Joi
    const { error, value } = validateUserSignup(req.body);

    if (error) {
      const errorMessages = formatValidationErrors(error);
      return res.status(400).json({
        error: 'Validation failed',
        details: errorMessages
      });
    }

    const { email, name } = value;

    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Create user with validated and sanitized data
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim()
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// For Vercel serverless functions
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Export for Vercel
export default app;
