import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planner as plannerApi } from '../services/api';

export function usePlanner() {
  return useQuery({
    queryKey: ['planner'],
    queryFn: () => plannerApi.get(),
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completada }: { id: string; completada: boolean }) =>
      plannerApi.toggleTask(id, completada),
    onMutate: async ({ id, completada }) => {
      // Optmistic update
      await queryClient.cancelQueries({ queryKey: ['planner'] });
      const previous = queryClient.getQueryData(['planner']);
      queryClient.setQueryData(['planner'], (old: any[] | undefined) => 
        old?.map(t => t.id === id ? { ...t, completada } : t)
      );
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['planner'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['planner'] });
    },
  });
}

export function useSuggestPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => plannerApi.suggest(),
    onSuccess: (data) => {
      queryClient.setQueryData(['planner'], data);
    },
  });
}
export function useSyncPlanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tasks: any[]) => plannerApi.sync(tasks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner'] });
    },
  });
}
