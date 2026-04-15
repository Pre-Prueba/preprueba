import { useQuery } from '@tanstack/react-query';
import { stats as statsApi } from '../services/api';
import { useAuthStore } from '../store/auth';

export function useStats() {
  const { user, subscription } = useAuthStore();
  
  const isAdmin = user?.role === 'ADMIN';
  const hasSubscription = isAdmin || (subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING');

  return useQuery({
    queryKey: ['stats'],
    queryFn: () => statsApi.resumen(),
    enabled: !!user && hasSubscription,
    // Manter dados antigos enquanto busca novos para evitar flickering
    placeholderData: (previousData) => previousData,
  });
}

export function useStudyTips() {
  const { user, subscription } = useAuthStore();
  
  const isAdmin = user?.role === 'ADMIN';
  const hasSubscription = isAdmin || (subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING');

  return useQuery({
    queryKey: ['stats', 'tips'],
    queryFn: () => statsApi.tips(),
    enabled: !!user && hasSubscription,
    staleTime: 1000 * 60 * 30, // Dicas podem ser cacheadas por mais tempo
  });
}
