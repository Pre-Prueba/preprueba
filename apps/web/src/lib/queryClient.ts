import { QueryClient } from '@tanstack/react-query';

// Centralizamos o QueryClient para garantir que as configurações sejam consistentes
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 2025 Standard: Cache dados por 5 minutos, mas considere-os obsoletos após 0 seg
      // Isso garante que sempre busquemos dados novos quando a aba for refocada
      staleTime: 0,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

// BroadcastChannel para sincronização entre abas
// Quando uma aba invalida uma query, ela avisa as outras
const syncChannel = new BroadcastChannel('preprueba_data_sync');

syncChannel.onmessage = (event) => {
  if (event.data === 'invalidate_stats') {
    queryClient.invalidateQueries({ queryKey: ['stats'] });
    queryClient.invalidateQueries({ queryKey: ['materias'] });
    queryClient.invalidateQueries({ queryKey: ['planner'] });
  }
};

export function broadcastUpdate() {
  syncChannel.postMessage('invalidate_stats');
  // Invalida localmente na aba atual também
  queryClient.invalidateQueries({ queryKey: ['stats'] });
  queryClient.invalidateQueries({ queryKey: ['materias'] });
  queryClient.invalidateQueries({ queryKey: ['planner'] });
}
