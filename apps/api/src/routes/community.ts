import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// GET /community — lista posts da comunidade
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const { type, materiaId, universidadId, q } = req.query;

  const where: Record<string, unknown> = {};
  if (type && type !== 'TODO') where.type = type as string;
  if (materiaId) where.materiaId = materiaId as string;
  // universidadId nao existe no schema ainda; ignorar por enquanto

  const posts = await prisma.communityPost.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      user: { select: { id: true, nombre: true, avatarUrl: true } },
      materia: { select: { id: true, nombre: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { id: true, nombre: true } },
        },
      },
      likes: { select: { userId: true } },
      saves: { select: { userId: true } },
    },
  });

  const mapped = posts.map((post) => ({
    id: post.id,
    type: post.type,
    title: post.title,
    content: post.content,
    author: { id: post.user.id, name: post.user.nombre || 'Estudiante', avatarUrl: post.user.avatarUrl || '' },
    materiaId: post.materiaId,
    materiaName: post.materia?.nombre || null,
    tags: post.tags,
    metrics: { likes: post.likes.length, comments: post.comments.length, reposts: 0 },
    hasLiked: post.likes.some((l) => l.userId === user.id),
    hasSaved: post.saves.some((s) => s.userId === user.id),
    createdAt: post.createdAt.toISOString(),
    comments: post.comments.map((c) => ({
      id: c.id,
      postId: c.postId,
      author: { id: c.user.id, name: c.user.nombre || 'Estudiante' },
      text: c.text,
      createdAt: c.createdAt.toISOString(),
      likes: 0,
      hasLiked: false,
    })),
  }));

  res.json(mapped);
});

// POST /community — criar post
router.post('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const { type, title, content, materiaId, tags } = req.body;

  if (!title || !content) {
    res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
    return;
  }

  const post = await prisma.communityPost.create({
    data: {
      userId: user.id,
      type: type || 'TODO',
      title,
      content,
      materiaId: materiaId || null,
      tags: tags || [],
    },
    include: {
      user: { select: { id: true, nombre: true, avatarUrl: true } },
      materia: { select: { id: true, nombre: true } },
      comments: { include: { user: { select: { id: true, nombre: true } } } },
      likes: { select: { userId: true } },
      saves: { select: { userId: true } },
    },
  });

  const mapped = {
    id: post.id,
    type: post.type,
    title: post.title,
    content: post.content,
    author: { id: post.user.id, name: post.user.nombre || 'Estudiante', avatarUrl: post.user.avatarUrl || '' },
    materiaId: post.materiaId,
    materiaName: post.materia?.nombre || null,
    tags: post.tags,
    metrics: { likes: post.likes.length, comments: post.comments.length, reposts: 0 },
    hasLiked: false,
    hasSaved: false,
    createdAt: post.createdAt.toISOString(),
    comments: [],
  };

  res.status(201).json(mapped);
});

// POST /community/:id/like — toggle like
router.post('/:id/like', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const { id } = req.params;

  const existing = await prisma.communityLike.findUnique({
    where: { postId_userId: { postId: id, userId: user.id } },
  });

  if (existing) {
    await prisma.communityLike.delete({ where: { id: existing.id } });
    res.json({ liked: false });
    return;
  }

  await prisma.communityLike.create({
    data: { postId: id, userId: user.id },
  });
  res.json({ liked: true });
});

// POST /community/:id/save — toggle save
router.post('/:id/save', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const { id } = req.params;

  const existing = await prisma.communitySave.findUnique({
    where: { postId_userId: { postId: id, userId: user.id } },
  });

  if (existing) {
    await prisma.communitySave.delete({ where: { id: existing.id } });
    res.json({ saved: false });
    return;
  }

  await prisma.communitySave.create({
    data: { postId: id, userId: user.id },
  });
  res.json({ saved: true });
});

// POST /community/:id/comments — adicionar comentário
router.post('/:id/comments', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const { id } = req.params;
  const { text } = req.body;

  if (!text) {
    res.status(400).json({ error: 'Texto é obrigatório' });
    return;
  }

  const comment = await prisma.communityComment.create({
    data: {
      postId: id,
      userId: user.id,
      text,
    },
    include: {
      user: { select: { id: true, nombre: true } },
    },
  });

  res.status(201).json({
    id: comment.id,
    postId: comment.postId,
    author: { id: comment.user.id, name: comment.user.nombre || 'Estudiante' },
    text: comment.text,
    createdAt: comment.createdAt.toISOString(),
    likes: 0,
    hasLiked: false,
  });
});

export default router;
