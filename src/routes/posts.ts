import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { validatePostCreate, validatePostUpdate, formatValidationErrors } from '../lib/validation';
import { authenticateToken, optionalAuth } from '../lib/auth';

const router = Router();

// Get all published posts (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, authorId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const userId = (req as any).userId;

    const where: any = { published: true };
    if (authorId) where.authorId = authorId as string;

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    });

    const total = await prisma.post.count({ where });

    res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get all posts for authenticated user (including drafts)
router.get('/my-posts', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    });

    const total = await prisma.post.count({ where: { authorId: userId } });

    res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user can view unpublished post
    if (!post.published && post.authorId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create new post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;

    // Validate input
    const { error, value } = validatePostCreate(req.body);
    
    if (error) {
      const errorMessages = formatValidationErrors(error);
      return res.status(400).json({
        error: 'Validation failed',
        details: errorMessages
      });
    }

    const { title, content, published } = value;

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        published: published || false,
        authorId: userId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update post
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    // Check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id }
    });

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existingPost.authorId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate input
    const { error, value } = validatePostUpdate(req.body);
    
    if (error) {
      const errorMessages = formatValidationErrors(error);
      return res.status(400).json({
        error: 'Validation failed',
        details: errorMessages
      });
    }

    const updateData: any = {};
    if (value.title !== undefined) updateData.title = value.title.trim();
    if (value.content !== undefined) updateData.content = value.content.trim();
    if (value.published !== undefined) updateData.published = value.published;

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    // Check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id }
    });

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existingPost.authorId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.post.delete({
      where: { id }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router; 