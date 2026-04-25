import { useQuery } from '@tanstack/react-query';
import { flashcards as flashcardsApi } from '../services/api';
import { useAuthStore } from '../store/auth';

export function useFlashcards(params?: { materiaId?: string; estado?: string }) {
  const { user, subscription } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';
  const hasSubscription = isAdmin || (subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING');

  return useQuery({
    queryKey: ['flashcards', params],
    queryFn: () => flashcardsApi.list(params),
    enabled: !!user && hasSubscription,
    placeholderData: (previousData) => previousData,
  });
}
