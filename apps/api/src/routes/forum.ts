import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requirePremium } from '../middleware/premium';
import { AuthRequest } from '../types';

const router = Router();

// Schemas
const createPostSchema = z.object({
  titulo: z.string().min(3).max(100),
  contenido: z.string().min(10).max(10000),
  materiaId: z.string().optional(),
  quotePostId: z.string().optional(),
});

const createCommentSchema = z.object({
  contenido: z.string().min(2).max(5000),
});

// GET /forum - List posts
router.get('/', requireAuth, requirePremium, async (req: AuthRequest, res: Response) => {
  const { materiaId, page = '1' } = req.query;
  const skip = (Number(page) - 1) * 20;

  // Sanitizar materiaId para ignorar strings como "undefined" ou vazias
  const sanitizedMateriaId = (materiaId && materiaId !== 'undefined' && materiaId !== '') 
    ? String(materiaId) 
    : undefined;

  const posts = await prisma.forumPost.findMany({
    where: {
      materiaId: sanitizedMateriaId,
    },
    include: {
      user: {
        select: { id: true, nombre: true }
      },
      materia: {
        select: { id: true, nombre: true }
      },
      quotePost: {
        include: {
          user: { select: { id: true, nombre: true } },
          materia: { select: { id: true, nombre: true } }
        }
      },
      _count: {
        select: { comments: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: 20,
  });

  res.json(posts);
});

// GET /forum/:id - Detail
router.get('/:id', requireAuth, requirePremium, async (req: AuthRequest, res: Response) => {
  const post = await prisma.forumPost.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, nombre: true } },
      materia: { select: { id: true, nombre: true } },
      quotePost: {
        include: {
          user: { select: { id: true, nombre: true } },
          materia: { select: { id: true, nombre: true } }
        }
      },
      comments: {
        include: {
          user: { select: { id: true, nombre: true } }
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!post) {
    return res.status(404).json({ error: 'Post no encontrado.' });
  }

  res.json(post);
});

// POST /forum - Create Post
router.post('/', requireAuth, requirePremium, async (req: AuthRequest, res: Response) => {
  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const post = await prisma.forumPost.create({
    data: {
      titulo: parsed.data.titulo,
      contenido: parsed.data.contenido,
      materiaId: parsed.data.materiaId,
      quotePostId: parsed.data.quotePostId,
      userId: req.user.id,
    },
    include: {
      user: { select: { id: true, nombre: true } },
      materia: { select: { id: true, nombre: true } },
      quotePost: {
        include: {
          user: { select: { id: true, nombre: true } }
        }
      }
    }
  });

  res.status(201).json(post);
});

// POST /forum/:id/comments - Add Comment
router.post('/:id/comments', requireAuth, requirePremium, async (req: AuthRequest, res: Response) => {
  const parsed = createCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const comment = await prisma.forumComment.create({
    data: {
      contenido: parsed.data.contenido,
      userId: req.user.id,
      postId: req.params.id,
    },
    include: {
      user: { select: { id: true, nombre: true } }
    }
  });

  res.status(201).json(comment);
});

// PATCH /forum/:postId/comments/:commentId/accept - Mark solve
router.patch('/:postId/comments/:commentId/accept', requireAuth, requirePremium, async (req: AuthRequest, res: Response) => {
  const { postId, commentId } = req.params;

  const post = await prisma.forumPost.findUnique({
    where: { id: postId }
  });

  if (!post || post.userId !== req.user.id) {
    return res.status(403).json({ error: 'Solo el autor puede aceptar una respuesta.' });
  }

  const [updatedPost, updatedComment] = await prisma.$transaction([
    prisma.forumPost.update({
      where: { id: postId },
      data: { isSolved: true, acceptedCommentId: commentId }
    }),
    prisma.forumComment.update({
      where: { id: commentId },
      data: { isAccepted: true }
    })
  ]);

  res.json({ success: true, post: updatedPost, comment: updatedComment });
});

// POST /forum/posts/:id/like
router.post('/posts/:id/like', requireAuth, requirePremium, async (req: AuthRequest, res: Response) => {
  const post = await prisma.forumPost.update({
    where: { id: req.params.id },
    data: { likesCount: { increment: 1 } }
  });
  res.json({ likes: post.likesCount });
});

// POST /forum/comments/:id/like
router.post('/comments/:id/like', requireAuth, requirePremium, async (req: AuthRequest, res: Response) => {
  const comment = await prisma.forumComment.update({
    where: { id: req.params.id },
    data: { likesCount: { increment: 1 } }
  });
  res.json({ likes: comment.likesCount });
});

// DELETE /forum/:id - Delete Post
router.delete('/:id', requireAuth, requirePremium, async (req: AuthRequest, res: Response) => {
  const post = await prisma.forumPost.findUnique({
    where: { id: req.params.id }
  });

  if (!post) {
    return res.status(404).json({ error: 'Post no encontrado.' });
  }

  // Verificar se o usuário é o autor ou Admin
  if (post.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'No tienes permiso para eliminar este post.' });
  }

  await prisma.forumPost.delete({
    where: { id: req.params.id }
  });

  res.json({ success: true });
});

// POST /forum/:id/report - Report Post
router.post('/:id/report', requireAuth, requirePremium, async (req: AuthRequest, res: Response) => {
  const { razon } = req.body;

  if (!razon) {
    return res.status(400).json({ error: 'Debes proporcionar una razón para la denuncia.' });
  }

  await prisma.forumReport.create({
    data: {
      postId: req.params.id,
      userId: req.user.id,
      razon
    }
  });

  res.json({ success: true });
});

export default router;
