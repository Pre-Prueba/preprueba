import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CommunityState, CommunityPost, PostType, CommunityFilters, CommunityComment } from '../../types/community';

const initialState: CommunityState & { posts: CommunityPost[] } = {
  feed: [],
  posts: [],
  filters: {
    type: 'TODO',
    materiaId: null,
    universidadId: null,
    query: '',
    tag: null,
  },
  trendingTags: ['#HistoriaDeEspaña', '#Mayores25', '#Simulacro', '#RutinaDeEstudio'],
  popularMaterias: [
    { id: '1', name: 'Historia de España' },
    { id: '2', name: 'Geografía' },
    { id: '3', name: 'Biología' }
  ],
  popularUniversidades: [
    { id: 'u1', name: 'Universidad Complutense' },
    { id: 'u2', name: 'Universidad Autónoma' }
  ],
  topContributors: [
    { id: 'u1', name: 'María García', points: 450 },
    { id: 'u2', name: 'Carlos Ruiz', points: 320 },
    { id: 'u3', name: 'Ana Isabel', points: 290 },
  ],
  savedPostsIds: [],
  status: 'idle',
  error: null,
};

// Mock para simular fetch de dados (MVP)
export const fetchCommunityFeed = createAsyncThunk(
  'community/fetchFeed',
  async (_filters: CommunityFilters) => {
    // Aqui no futuro chamaremos o service/api real
    return new Promise<CommunityPost[]>((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'post-1',
            type: 'DUDA',
            title: '¿Alguien tiene apontes de los Reyes Católicos?',
            content: 'Estoy atascado con este tema y no entiendo bien la política exterior. ¿Me ajudáis?',
            author: { id: 'u1', name: 'María García', avatarUrl: '' },
            materiaId: '1',
            materiaName: 'Historia de España',
            tags: ['#ReyesCatolicos', '#Historia'],
            metrics: { likes: 12, comments: 2, reposts: 1 },
            hasLiked: false,
            hasSaved: false,
            createdAt: new Date(Date.now() - 3600000).toISOString(), // 1h ago
            comments: [
              {
                id: 'c1',
                postId: 'post-1',
                author: { id: 'u2', name: 'Carlos Ruiz' },
                text: 'Te recomiendo mucho el libro de Historia Moderna de la UNED.',
                createdAt: new Date(Date.now() - 1800000).toISOString(),
                likes: 5,
                hasLiked: false,
                isLikedByAuthor: true
              },
              {
                id: 'c2',
                postId: 'post-1',
                author: { id: 'u3', name: 'Ana Isabel' },
                text: 'Yo tengo un esquema muy bueno, si quieres te lo paso por MD.',
                createdAt: new Date(Date.now() - 900000).toISOString(),
                likes: 2,
                hasLiked: false
              }
            ]
          },
          {
            id: 'post-2',
            type: 'LOGRO',
            title: '¡He aprobado el simulacro!',
            content: 'Por fin he sacado más de un 8 en el simulacro general. ¡A seguir!',
            author: { id: 'u2', name: 'Carlos Ruiz', avatarUrl: '' },
            tags: ['#Simulacro', '#Motivacion'],
            metrics: { likes: 45, comments: 0, reposts: 0 },
            hasLiked: true,
            hasSaved: false,
            createdAt: new Date(Date.now() - 7200000).toISOString(), // 2h ago
            comments: []
          }
        ]);
      }, 500);
    });
  }
);

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    setFilterType: (state, action: PayloadAction<PostType | 'TODO'>) => {
      state.filters.type = action.payload;
    },
    setFilterMateria: (state, action: PayloadAction<string | null>) => {
      state.filters.materiaId = action.payload;
    },
    setFilterUniversidad: (state, action: PayloadAction<string | null>) => {
      state.filters.universidadId = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.query = action.payload;
    },
    setFilterTag: (state, action: PayloadAction<string | null>) => {
      state.filters.tag = action.payload;
    },
    toggleLikePost: (state, action: PayloadAction<string>) => {
      // update in posts
      const post = state.posts.find(p => p.id === action.payload);
      if (post) {
        post.hasLiked = !post.hasLiked;
        post.metrics.likes += post.hasLiked ? 1 : -1;
      }
    },
    toggleSavePost: (state, action: PayloadAction<string>) => {
      const postId = action.payload;
      const post = state.posts.find(p => p.id === postId);
      if (post) {
        post.hasSaved = !post.hasSaved;
        if (post.hasSaved) {
          if (!state.savedPostsIds.includes(postId)) {
            state.savedPostsIds.push(postId);
          }
        } else {
          state.savedPostsIds = state.savedPostsIds.filter(id => id !== postId);
        }
      }
    },
    addPost: (state, action: PayloadAction<CommunityPost>) => {
      state.posts.unshift(action.payload);
      
      // Points gamification: Adicionando 10 pontos a cada post!
      const authorId = action.payload.author.id;
      const existingUser = state.topContributors.find(u => u.id === authorId);
      if (existingUser) {
        existingUser.points += 10;
      } else {
        state.topContributors.push({
          id: authorId,
          name: action.payload.author.name,
          points: 10
        });
      }
      // Ordenar por points destrancando os prêmios
      state.topContributors.sort((a, b) => b.points - a.points);
    },
    addComment: (state, action: PayloadAction<CommunityComment>) => {
      const post = state.posts.find(p => p.id === action.payload.postId);
      if (post) {
        post.comments.push(action.payload);
        post.metrics.comments += 1;
      }
    },
    addReply: (state, action: PayloadAction<{ commentId: string; reply: CommunityComment }>) => {
      const { commentId, reply } = action.payload;
      // Search for the parent comment in all posts
      for (const post of state.posts) {
        const comment = post.comments.find(c => c.id === commentId);
        if (comment) {
          if (!comment.replies) comment.replies = [];
          comment.replies.push(reply);
          post.metrics.comments += 1;
          break;
        }
      }
    },
    toggleLikeComment: (state, action: PayloadAction<{ postId: string; commentId: string; parentId?: string }>) => {
      const { postId, commentId, parentId } = action.payload;
      const post = state.posts.find(p => p.id === postId);
      if (!post) return;

      let targetComment: CommunityComment | undefined;
      if (parentId) {
        const parent = post.comments.find(c => c.id === parentId);
        targetComment = parent?.replies?.find(r => r.id === commentId);
      } else {
        targetComment = post.comments.find(c => c.id === commentId);
      }

      if (targetComment) {
        targetComment.hasLiked = !targetComment.hasLiked;
        targetComment.likes += targetComment.hasLiked ? 1 : -1;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommunityFeed.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCommunityFeed.fulfilled, (state, action) => {
        state.status = 'idle';
        // Mock backend responses initializing the real base
        if (state.posts.length === 0) {
          state.posts = action.payload;
        }
      })
      .addCase(fetchCommunityFeed.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch community feed';
      });
  },
});

export const selectFilteredFeed = (state: { community: CommunityState }) => {
  let data = state.community.posts;
  const filters = state.community.filters;
  
  if (filters.type !== 'TODO') {
    data = data.filter(p => p.type === filters.type);
  }
  if (filters.materiaId) {
    data = data.filter(p => p.materiaId === filters.materiaId);
  }
  if (filters.universidadId) {
    data = data.filter(p => p.universidadId === filters.universidadId);
  }
  if (filters.tag) {
    data = data.filter(p => p.tags.includes(filters.tag!));
  }
  if (filters.query) {
    data = data.filter(p => p.content.toLowerCase().includes(filters.query.toLowerCase()));
  }
  return data;
};

// Seletor para descobrir o Campeão (o cara da estrelinha)
export const selectTopContributorId = (state: { community: CommunityState }) => {
  if (state.community.topContributors.length > 0) {
    return state.community.topContributors[0].id;
  }
  return null;
};

export const { 
  setFilterType, 
  setFilterMateria, 
  setFilterUniversidad, 
  setSearchQuery,
  setFilterTag,
  toggleLikePost,
  toggleSavePost,
  addPost,
  addComment,
  addReply,
  toggleLikeComment
} = communitySlice.actions;

export default communitySlice.reducer;
