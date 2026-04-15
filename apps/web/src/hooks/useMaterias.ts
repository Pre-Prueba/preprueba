import { useQuery } from '@tanstack/react-query';
import { materias as materiasApi } from '../services/api';
import { useAuthStore } from '../store/auth';

export function useMaterias() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['materias'],
    queryFn: () => materiasApi.list(),
    enabled: !!user,
  });
}

export function useMateria(id?: string) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['materias', id],
    queryFn: () => materiasApi.get(id!),
    enabled: !!user && !!id,
  });
}
