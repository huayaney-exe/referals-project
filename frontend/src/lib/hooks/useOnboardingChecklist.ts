/**
 * Hook for managing onboarding checklist
 *
 * Features:
 * - Fetches checklist tasks with completion status
 * - Manual task completion (for optional tasks)
 * - Progress calculation
 * - Type-safe with generated database types
 *
 * Usage:
 * ```tsx
 * const { data: tasks, isLoading } = useOnboardingChecklist(businessId);
 * const { mutate: completeTask } = useCompleteChecklistTask();
 *
 * // Manually complete a task
 * completeTask({ businessId, taskId: 'share_social' });
 * ```
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, queryWithErrorHandling, rpcWithErrorHandling } from '@/lib/supabase-client';

export interface ChecklistTask {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  required: boolean;
  icon: string | null;
  action_hint: string | null;
  completed: boolean;
  completed_at: string | null;
}

export interface ChecklistProgress {
  total_tasks: number;
  completed_tasks: number;
  required_tasks: number;
  completed_required_tasks: number;
  progress_percent: number;
  is_complete: boolean;
}

/**
 * Fetch checklist tasks with completion status for a business
 */
export function useOnboardingChecklist(businessId: string) {
  return useQuery({
    queryKey: ['onboarding-checklist', businessId],
    queryFn: async () => {
      // Fetch all task definitions
      const tasks = await queryWithErrorHandling(
        () => supabase
          .from('checklist_tasks')
          .select('*')
          .order('order_index'),
        'useOnboardingChecklist.fetchTasks'
      );

      // Fetch progress for this business
      const progress = await queryWithErrorHandling(
        () => supabase
          .from('checklist_progress')
          .select('task_id, completed, completed_at')
          .eq('business_id', businessId),
        'useOnboardingChecklist.fetchProgress'
      );

      // Create a map of task_id -> progress
      const progressMap = new Map(
        progress.map(p => [p.task_id, { completed: p.completed, completed_at: p.completed_at }])
      );

      // Merge tasks with progress
      return tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        order_index: task.order_index,
        required: task.required,
        icon: task.icon,
        action_hint: task.action_hint,
        completed: progressMap.get(task.id)?.completed || false,
        completed_at: progressMap.get(task.id)?.completed_at || null,
      })) as ChecklistTask[];
    },
    enabled: !!businessId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Manually complete a checklist task (for optional tasks or manual completion)
 */
export function useCompleteChecklistTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ businessId, taskId }: { businessId: string; taskId: string }) => {
      await rpcWithErrorHandling(
        'complete_checklist_task',
        {
          p_business_id: businessId,
          p_task_id: taskId,
        },
        'useCompleteChecklistTask'
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate checklist query to refetch
      queryClient.invalidateQueries({ queryKey: ['onboarding-checklist', variables.businessId] });
      queryClient.invalidateQueries({ queryKey: ['checklist-progress', variables.businessId] });
    },
  });
}

/**
 * Get checklist progress statistics
 */
export function useChecklistProgress(businessId: string) {
  return useQuery({
    queryKey: ['checklist-progress', businessId],
    queryFn: async () => {
      const result = await rpcWithErrorHandling<ChecklistProgress[]>(
        'get_checklist_progress',
        { p_business_id: businessId },
        'useChecklistProgress'
      );

      // RPC returns array with single row
      return result[0] || {
        total_tasks: 0,
        completed_tasks: 0,
        required_tasks: 0,
        completed_required_tasks: 0,
        progress_percent: 0,
        is_complete: false,
      };
    },
    enabled: !!businessId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Check if checklist is complete (all required tasks done)
 */
export function useIsChecklistComplete(businessId: string) {
  return useQuery({
    queryKey: ['checklist-complete', businessId],
    queryFn: async () => {
      const result = await rpcWithErrorHandling<boolean>(
        'is_checklist_complete',
        { p_business_id: businessId },
        'useIsChecklistComplete'
      );

      return result as boolean;
    },
    enabled: !!businessId,
    staleTime: 60 * 1000, // 1 minute
  });
}
