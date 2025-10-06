/**
 * Simple Action-Focused Onboarding Checklist
 *
 * Principles:
 * - Actions first, info second
 * - No overwhelming expandable sections
 * - Clear, direct calls-to-action
 * - Instant completion feedback
 * - Minimal cognitive load
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/design-system/primitives/Card/Card';
import { Button } from '@/design-system/primitives/Button/Button';
import { Progress } from '@/design-system/primitives/Progress/Progress';
import {
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  QrCode,
  Users,
  Megaphone,
  Download,
  Copy,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useOnboardingChecklist, useChecklistProgress, useCompleteChecklistTask } from '@/lib/hooks/useOnboardingChecklist';
import { useBusiness } from '@/lib/hooks/useBusiness';
import { supabase } from '@/lib/supabase';

const iconMap = {
  'credit-card': CreditCard,
  'qr-code': QrCode,
  'users': Users,
  'megaphone': Megaphone,
};

interface SimpleOnboardingChecklistProps {
  businessId: string;
  autoCollapse?: boolean;
}

export function SimpleOnboardingChecklist({
  businessId,
  autoCollapse = false,
}: SimpleOnboardingChecklistProps) {
  const router = useRouter();
  const { data: tasks, isLoading } = useOnboardingChecklist(businessId);
  const { data: progress } = useChecklistProgress(businessId);
  const { data: business } = useBusiness(businessId);
  const completeTask = useCompleteChecklistTask();

  const [isExpanded, setIsExpanded] = useState(!autoCollapse);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (isLoading || !tasks || !progress) {
    return null;
  }

  const completedCount = progress.completed_tasks;
  const totalCount = progress.total_tasks;
  const progressPercent = progress.progress_percent;

  // Hide if all tasks complete and autoCollapse enabled
  if (completedCount >= totalCount && autoCollapse) {
    return null;
  }

  // Generate enrollment URL
  const enrollmentUrl = business
    ? `${window.location.origin}/enroll/${business.id}`
    : '';

  // Handle QR download with completion tracking
  const handleDownloadQR = async () => {
    if (!business?.qr_code_url) return;

    setDownloading(true);
    try {
      // Download QR
      const response = await fetch(business.qr_code_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${business.name}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Mark QR as downloaded in database (triggers auto-completion)
      await supabase
        .from('businesses')
        .update({ qr_downloaded: true })
        .eq('id', businessId);

      // Also manually complete the task for immediate feedback
      await completeTask.mutateAsync({
        businessId,
        taskId: 'share_enrollment_qr',
      });
    } catch (error) {
      console.error('Error downloading QR:', error);
    } finally {
      setDownloading(false);
    }
  };

  // Handle copy link with completion tracking
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(enrollmentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Increment page visit count (triggers auto-completion at 2)
      await supabase.rpc('increment_qr_page_visits', {
        p_business_id: businessId,
      });

      // Also manually complete the task
      await completeTask.mutateAsync({
        businessId,
        taskId: 'share_enrollment_qr',
      });
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  return (
    <Card className="border-2 border-brand-light shadow-md">
      <CardContent className="p-4">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-warm-900 text-lg">
                Lanza tu Programa
              </h3>
              <span className="text-sm font-semibold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                {completedCount} de {totalCount} ✓
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-warm-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-warm-500" />
          )}
        </button>

        {/* Task List */}
        {isExpanded && (
          <div className="mt-4 space-y-3">
            {tasks.map((task) => {
              const IconComponent = iconMap[task.icon as keyof typeof iconMap] || Check;

              return (
                <div
                  key={task.id}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${task.completed
                      ? 'bg-success/5 border-success/30'
                      : 'bg-white border-warm-200'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                        ${task.completed
                          ? 'bg-success text-white'
                          : 'bg-brand/10 text-brand'
                        }
                      `}
                    >
                      {task.completed ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`font-semibold text-base mb-1 ${
                          task.completed
                            ? 'text-success-dark line-through'
                            : 'text-warm-900'
                        }`}
                      >
                        {task.title}
                      </h4>
                      <p className="text-sm text-warm-600 mb-3">
                        {task.description}
                      </p>

                      {/* Action Buttons - Only for incomplete tasks */}
                      {!task.completed && (
                        <div className="flex flex-wrap gap-2">
                          {/* Task-specific actions */}
                          {task.id === 'share_enrollment_qr' && (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={handleDownloadQR}
                                disabled={downloading}
                                className="gap-2"
                              >
                                {downloading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                                Descargar QR
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={handleCopyLink}
                                className="gap-2"
                              >
                                {copied ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                                {copied ? 'Copiado!' : 'Copiar Link'}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => router.push('/dashboard/qr')}
                                className="gap-2"
                              >
                                Ver Más
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </>
                          )}

                          {task.id === 'create_scanner_access' && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => router.push('/dashboard/scanner-access/new')}
                              className="gap-2"
                            >
                              <Users className="w-4 h-4" />
                              Crear Acceso
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          )}

                          {task.id === 'create_campaign' && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => router.push('/dashboard/campaigns/new')}
                              className="gap-2"
                            >
                              <Megaphone className="w-4 h-4" />
                              Crear Campaña
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Completion message */}
                      {task.completed && (
                        <p className="text-sm text-success-dark font-medium">
                          ✓ Completado
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Minimal hint - Only for incomplete tasks */}
                  {!task.completed && task.action_hint && (
                    <p className="text-xs text-warm-600 mt-3 pl-11">
                      💡 {task.action_hint}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Completion Message */}
        {completedCount >= totalCount && isExpanded && (
          <div className="mt-4 p-4 bg-gradient-to-r from-success/20 to-success/5 rounded-lg border-2 border-success/30">
            <p className="text-base font-bold text-success-dark flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              ¡Programa Configurado!
            </p>
            <p className="text-sm text-warm-700 mt-1">
              Tu sistema está listo. Ahora los clientes pueden inscribirse y tu equipo puede dar sellos.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
