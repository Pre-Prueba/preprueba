export type PostType = 'DUDA' | 'FOTO' | 'CONSEJO' | 'LOGRO' | 'DEBATE';

export interface UserSnippet {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  author: UserSnippet;
  text: string;
  createdAt: string;
  likes: number;
  hasLiked: boolean;
  replyToId?: string; // Se for uma resposta a outro comentário
  replies?: CommunityComment[];
  isLikedByAuthor?: boolean; // Badge "Le gustó al autor"
}

export interface CommunityPost {
  id: string;
  type: PostType;
  title?: string;
  content: string;
  imageUrl?: string;
  author: UserSnippet;
  materiaId?: string;
  materiaName?: string;
  universidadId?: string;
  universidadName?: string;
  tags: string[];
  metrics: {
    likes: number;
    comments: number;
    reposts: number;
  };
  hasLiked: boolean;
  hasSaved: boolean;
  createdAt: string;
  comments: CommunityComment[];
}

export interface CommunityFilters {
  type: PostType | 'TODO';
  materiaId: string | null;
  universidadId: string | null;
  query: string;
  tag: string | null;
}

export interface UserContribution {
  id: string;
  name: string;
  points: number;
}

export interface CommunityState {
  feed: CommunityPost[];
  posts: CommunityPost[];
  filters: CommunityFilters;
  trendingTags: string[];
  popularMaterias: { id: string; name: string }[];
  popularUniversidades: { id: string; name: string }[];
  topContributors: UserContribution[];
  savedPostsIds: string[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}
