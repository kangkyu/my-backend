import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword, generateToken } from '../lib/auth';
import { validateUserSignup, validateUserLogin, validateUserUpdate, formatValidationErrors } from '../lib/validation';
import { authenticateToken } from '../lib/auth';

const router = Router();

// User signup
router.post('/signup', async (req, res) => {
  try {
    // Validate input
    const { error, value } = validateUserSignup(req.body);
    
    if (error) {
      const errorMessages = formatValidationErrors(error);
      return res.status(400).json({
        error: 'Validation failed',
        details: errorMessages
      });
    }

    const { email, name, password } = value;

    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User created successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    // Validate input
    const { error, value } = validateUserLogin(req.body);
    
    if (error) {
      const errorMessages = formatValidationErrors(error);
      return res.status(400).json({
        error: 'Validation failed',
        details: errorMessages
      });
    }

    const { email, password } = value;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;

    // Validate input
    const { error, value } = validateUserUpdate(req.body);
    
    if (error) {
      const errorMessages = formatValidationErrors(error);
      return res.status(400).json({
        error: 'Validation failed',
        details: errorMessages
      });
    }

    const updateData: any = {};
    if (value.name !== undefined) updateData.name = value.name.trim();
    if (value.email !== undefined) {
      updateData.email = value.email.toLowerCase().trim();
      
      // Check for duplicate email if changing email
      const existingUser = await prisma.user.findUnique({
        where: { email: updateData.email }
      });
      
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Delete user account (for testing purposes)
router.delete('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;

    // Delete all user's posts first (due to foreign key constraint)
    await prisma.post.deleteMany({
      where: { authorId: userId }
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router; 