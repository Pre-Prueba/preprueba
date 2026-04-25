import { useQuery } from '@tanstack/react-query';
import { dashboard as dashboardApi } from '../services/api';
import { useAuthStore } from '../store/auth';

export function useDashboardRecommendations() {
  const { user, subscription } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';
  const hasSubscription = isAdmin || (subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING');

  return useQuery({
    queryKey: ['dashboard', 'recommendations'],
    queryFn: () => dashboardApi.recommendations(),
    enabled: !!user && hasSubscription,
    placeholderData: (previousData) => previousData,
  });
}
