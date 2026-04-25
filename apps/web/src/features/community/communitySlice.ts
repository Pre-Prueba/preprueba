import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CommunityState, CommunityPost, PostType, CommunityFilters, CommunityComment } from '../../types/community';
import { community as communityApi } from '../../services/api';

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

export const fetchCommunityFeed = createAsyncThunk(
  'community/fetchFeed',
  async (filters: CommunityFilters) => {
    const data = await communityApi.list({
      type: filters.type === 'TODO' ? undefined : filters.type,
      materiaId: filters.materiaId ?? undefined,
      q: filters.query || undefined,
    });
    return data;
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
        state.posts = action.payload;
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
