import { useQuery } from '@tanstack/react-query';
import { errores as erroresApi } from '../services/api';
import { useAuthStore } from '../store/auth';

export function useErrores(params?: { materiaId?: string; tema?: string; revisado?: boolean; page?: number }) {
  const { user, subscription } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';
  const hasSubscription = isAdmin || (subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING');

  return useQuery({
    queryKey: ['errores', params],
    queryFn: () => erroresApi.list(params),
    enabled: !!user && hasSubscription,
    placeholderData: (previousData) => previousData,
  });
}
