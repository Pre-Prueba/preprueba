import { useQuery } from '@tanstack/react-query';
import { search as searchApi } from '../services/api';
import { useAuthStore } from '../store/auth';

export function useSearch(q: string, type?: 'all' | 'questions' | 'topics' | 'errors' | 'flashcards') {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['search', q, type],
    queryFn: () => searchApi.global(q, type),
    enabled: !!user && q.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}
