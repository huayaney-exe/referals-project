/**
 * Onboarding Checklist Component
 *
 * Displays a collapsible checklist widget showing onboarding progress.
 * Features:
 * - Auto-collapsible when all required tasks complete
 * - Progress bar showing completion percentage
 * - Icon indicators for each task
 * - Task descriptions and action hints
 * - Manual completion for optional tasks (share_social)
 *
 * Usage:
 * ```tsx
 * <OnboardingChecklist businessId={businessId} autoCollapse={true} />
 * ```
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/design-system/primitives/Card/Card';
import { Button } from '@/design-system/primitives/Button/Button';
import { Progress } from '@/design-system/primitives/Progress/Progress';
import {
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  QrCode,
  UserPlus,
  Stamp,
  Share2,
} from 'lucide-react';
import { useOnboardingChecklist, useChecklistProgress } from '@/lib/hooks/useOnboardingChecklist';

const iconMap = {
  'credit-card': CreditCard,
  'qr-code': QrCode,
  'user-plus': UserPlus,
  'stamp': Stamp,
  'share-2': Share2,
};

interface OnboardingChecklistProps {
  businessId: string;
  autoCollapse?: boolean;
}

export function OnboardingChecklist({
  businessId,
  autoCollapse = false,
}: OnboardingChecklistProps) {
  const { data: tasks, isLoading } = useOnboardingChecklist(businessId);
  const { data: progress } = useChecklistProgress(businessId);

  const [isExpanded, setIsExpanded] = useState(!autoCollapse);

  if (isLoading || !tasks || !progress) {
    return null;
  }

  const completedCount = progress.completed_tasks;
  const totalCount = progress.total_tasks;
  const requiredCount = progress.required_tasks;
  const completedRequiredCount = progress.completed_required_tasks;
  const progressPercent = progress.progress_percent;

  // Hide if all required tasks complete and autoCollapse enabled
  if (completedRequiredCount >= requiredCount && autoCollapse) {
    return null;
  }

  return (
    <Card className="border-2 border-brand-light">
      <CardContent className="p-4">
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-warm-900">
                Lanza tu Programa
              </h3>
              <span className="text-sm font-semibold text-brand">
                {completedCount} de {totalCount} ✓
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-warm-500 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-warm-500 flex-shrink-0" />
          )}
        </button>

        {/* Task List - Collapsible */}
        {isExpanded && (
          <div className="mt-4 space-y-2">
            {tasks.map((task) => {
              const IconComponent = iconMap[task.icon as keyof typeof iconMap] || Check;

              return (
                <div
                  key={task.id}
                  className={`
                    flex items-start gap-3 p-3 rounded-lg transition-all
                    ${
                      task.completed
                        ? 'bg-success/10 border border-success/20'
                        : 'bg-warm-50 border border-warm-200'
                    }
                  `}
                >
                  {/* Icon/Checkbox */}
                  <div
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                      ${
                        task.completed
                          ? 'bg-success text-white'
                          : 'bg-warm-200 text-warm-500'
                      }
                    `}
                  >
                    {task.completed ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <IconComponent className="w-4 h-4" />
                    )}
                  </div>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium text-sm ${
                        task.completed
                          ? 'text-success-dark line-through'
                          : 'text-warm-900'
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-warm-600 mt-0.5">
                        {task.description}
                      </p>
                    )}
                    {!task.completed && task.action_hint && (
                      <p className="text-xs text-brand mt-1">
                        💡 {task.action_hint}
                      </p>
                    )}
                  </div>

                  {/* Optional Badge */}
                  {!task.required && (
                    <span className="text-xs text-warm-500 flex-shrink-0 mt-1">
                      Opcional
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Completion Message */}
        {completedRequiredCount >= requiredCount && isExpanded && (
          <div className="mt-4 p-3 bg-gradient-to-r from-success/10 to-success/5 rounded-lg border border-success/20">
            <p className="text-sm font-medium text-success-dark">
              🎉 ¡Completaste los pasos esenciales! Tu programa está listo.
            </p>
            {completedCount < totalCount && (
              <p className="text-xs text-warm-600 mt-1">
                Completa las tareas opcionales para maximizar tu alcance
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
