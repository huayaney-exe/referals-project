/**
 * Enhanced Onboarding Checklist Component
 *
 * World-class self-service onboarding with:
 * - Expandable educational content per task
 * - Inline help resources (videos, FAQs)
 * - Contextual guidance and tips
 * - Progress tracking with time estimates
 *
 * Usage:
 * ```tsx
 * <EnhancedOnboardingChecklist
 *   businessId={businessId}
 *   currentStep="share_qr"
 *   onStepComplete={(step) => console.log('Completed:', step)}
 * />
 * ```
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  Lightbulb,
  HelpCircle,
  PlayCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useOnboardingChecklist, useChecklistProgress } from '@/lib/hooks/useOnboardingChecklist';
import { TASK_EDUCATIONAL_CONTENT, type ChecklistTask, type OnboardingStep } from '@/types/onboarding';

const iconMap = {
  'credit-card': CreditCard,
  'qr-code': QrCode,
  'users': Users,
  'megaphone': Megaphone,
};

interface EnhancedOnboardingChecklistProps {
  businessId: string;
  currentStep?: OnboardingStep;
  autoCollapse?: boolean;
  onStepComplete?: (step: string) => void;
}

export function EnhancedOnboardingChecklist({
  businessId,
  currentStep,
  autoCollapse = false,
  onStepComplete,
}: EnhancedOnboardingChecklistProps) {
  const { data: tasks, isLoading } = useOnboardingChecklist(businessId);
  const { data: progress } = useChecklistProgress(businessId);

  const [isExpanded, setIsExpanded] = useState(!autoCollapse);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState<Record<string, boolean>>({});

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

  const toggleHelp = (taskId: string) => {
    setShowHelp(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleTaskExpand = (taskId: string) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  return (
    <Card className="border-2 border-brand-light shadow-lg">
      <CardContent className="p-4">
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
          aria-expanded={isExpanded}
          aria-label="Toggle onboarding checklist"
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
            <ChevronUp className="w-5 h-5 text-warm-500 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-warm-500 flex-shrink-0" />
          )}
        </button>

        {/* Task List - Collapsible */}
        {isExpanded && (
          <div className="mt-6 space-y-3">
            {tasks.map((task) => {
              const IconComponent = iconMap[task.icon as keyof typeof iconMap] || Check;
              const educational = TASK_EDUCATIONAL_CONTENT[task.id];
              const isExpanded = expandedTask === task.id;
              const helpShown = showHelp[task.id];

              return (
                <div
                  key={task.id}
                  className={`
                    rounded-xl border-2 transition-all
                    ${task.completed
                      ? 'bg-success/5 border-success/30'
                      : 'bg-white border-warm-200 hover:border-brand/50'
                    }
                  `}
                >
                  {/* Task Header */}
                  <button
                    onClick={() => handleTaskExpand(task.id)}
                    className="w-full p-4 flex items-start gap-3 text-left"
                    disabled={task.completed}
                  >
                    {/* Icon/Checkbox */}
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

                    {/* Task Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={`font-semibold text-base ${
                            task.completed
                              ? 'text-success-dark line-through'
                              : 'text-warm-900'
                          }`}
                        >
                          {task.title}
                        </h4>
                        {educational?.estimated_time && !task.completed && (
                          <span className="flex items-center gap-1 text-xs text-warm-600 bg-warm-100 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            {educational.estimated_time}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-warm-600">
                        {task.description}
                      </p>

                      {!task.completed && task.action_hint && !isExpanded && (
                        <p className="text-xs text-brand mt-2 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          {task.action_hint}
                        </p>
                      )}
                    </div>

                    {/* Expand Indicator */}
                    {!task.completed && (
                      <ChevronDown
                        className={`w-5 h-5 text-warm-400 flex-shrink-0 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Expanded Educational Content */}
                  {isExpanded && !task.completed && educational && (
                    <div className="px-4 pb-4 space-y-4">
                      {/* Why It Matters */}
                      <div className="bg-brand/5 rounded-lg p-4 border border-brand/20">
                        <div className="flex items-start gap-2 mb-2">
                          <Lightbulb className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                          <h5 className="font-semibold text-warm-900">
                            ¿Por qué es importante?
                          </h5>
                        </div>
                        <p className="text-sm text-warm-700 whitespace-pre-line leading-relaxed">
                          {educational.why_it_matters}
                        </p>
                      </div>

                      {/* What It Does */}
                      <div className="space-y-2">
                        <h5 className="font-semibold text-warm-900 flex items-center gap-2">
                          <span className="text-brand">✓</span>
                          ¿Qué hace?
                        </h5>
                        <p className="text-sm text-warm-700 whitespace-pre-line leading-relaxed pl-6">
                          {educational.what_it_does}
                        </p>
                      </div>

                      {/* How To Share (for share_enrollment_qr) */}
                      {educational.how_to_share && (
                        <div className="space-y-3">
                          <h5 className="font-semibold text-warm-900">
                            ¿Cómo compartir?
                          </h5>

                          {/* Physical */}
                          <div className="bg-warm-50 rounded-lg p-4 border border-warm-200">
                            <h6 className="font-medium text-warm-800 mb-2">
                              {educational.how_to_share.physical.title}
                            </h6>
                            <ul className="space-y-1.5">
                              {educational.how_to_share.physical.instructions.map((instruction, i) => (
                                <li key={i} className="text-sm text-warm-700 flex gap-2">
                                  <span className="text-success font-bold">✓</span>
                                  <span>{instruction}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Digital */}
                          <div className="bg-warm-50 rounded-lg p-4 border border-warm-200">
                            <h6 className="font-medium text-warm-800 mb-2">
                              {educational.how_to_share.digital.title}
                            </h6>
                            <ul className="space-y-1.5">
                              {educational.how_to_share.digital.instructions.map((instruction, i) => (
                                <li key={i} className="text-sm text-warm-700 flex gap-2">
                                  <span className="text-success font-bold">✓</span>
                                  <span>{instruction}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Who Needs It (for create_scanner_access) */}
                      {educational.who_needs_it && (
                        <div className="space-y-2">
                          <h5 className="font-semibold text-warm-900">
                            ¿Quién necesita esto?
                          </h5>
                          <ul className="space-y-1.5 pl-6">
                            {educational.who_needs_it.map((who, i) => (
                              <li key={i} className="text-sm text-warm-700 flex gap-2">
                                <span className="text-brand">•</span>
                                <span>{who}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* How Many (for create_scanner_access) */}
                      {educational.how_many_to_create && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <h5 className="font-semibold text-blue-900 mb-2">
                            {educational.how_many_to_create.recommendation}
                          </h5>
                          <ul className="space-y-1.5">
                            {educational.how_many_to_create.examples.map((example, i) => (
                              <li key={i} className="text-sm text-blue-800 flex gap-2">
                                <span className="font-bold">→</span>
                                <span>{example}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Campaign Templates (for create_campaign) */}
                      {educational.templates && educational.templates.length > 0 && (
                        <div className="space-y-3">
                          <h5 className="font-semibold text-warm-900">
                            Plantillas Recomendadas:
                          </h5>
                          <div className="grid gap-3">
                            {educational.templates.slice(0, 2).map((template) => (
                              <div
                                key={template.id}
                                className="bg-gradient-to-br from-brand/5 to-brand/10 rounded-lg p-4 border-2 border-brand/20"
                              >
                                <div className="flex items-start gap-3 mb-2">
                                  <span className="text-2xl">{template.icon}</span>
                                  <div className="flex-1">
                                    <h6 className="font-semibold text-warm-900">
                                      {template.name}
                                    </h6>
                                    <p className="text-sm text-warm-700 mt-0.5">
                                      {template.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                  <span className="text-xs text-warm-600 bg-white/80 px-2 py-1 rounded">
                                    {template.best_for}
                                  </span>
                                  {template.expected_impact && (
                                    <div className="flex gap-2 text-xs">
                                      <span className="text-success font-semibold">
                                        {template.expected_impact.inscriptions}
                                      </span>
                                      <span className="text-brand font-semibold">
                                        {template.expected_impact.activity}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        {educational.action_buttons.map((button, i) => (
                          button.destination ? (
                            <Link key={i} href={button.destination}>
                              <Button
                                variant={button.variant}
                                size="sm"
                                className="gap-2"
                              >
                                {button.icon && <button.icon className="w-4 h-4" />}
                                {button.text}
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              key={i}
                              variant={button.variant}
                              size="sm"
                              onClick={() => {
                                // Handle action
                                console.log('Action:', button.action);
                              }}
                            >
                              {button.text}
                            </Button>
                          )
                        ))}
                      </div>

                      {/* Help Section - Collapsible */}
                      {educational.help_content && (
                        <div className="border-t border-warm-200 pt-4">
                          <button
                            onClick={() => toggleHelp(task.id)}
                            className="flex items-center gap-2 text-sm font-medium text-warm-700 hover:text-brand transition-colors"
                          >
                            <HelpCircle className="w-4 h-4" />
                            ¿Necesitas ayuda?
                            {helpShown ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>

                          {helpShown && (
                            <div className="mt-3 space-y-3">
                              {/* Video Tutorial */}
                              {educational.help_content.video_url && (
                                <a
                                  href={educational.help_content.video_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 p-3 bg-warm-50 rounded-lg border border-warm-200 hover:border-brand transition-colors"
                                >
                                  <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
                                    <PlayCircle className="w-6 h-6 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-warm-900">
                                      Ver Tutorial en Video
                                    </p>
                                    {educational.help_content.estimated_time && (
                                      <p className="text-xs text-warm-600">
                                        Duración: {educational.help_content.estimated_time}
                                      </p>
                                    )}
                                  </div>
                                  <ExternalLink className="w-4 h-4 text-warm-400" />
                                </a>
                              )}

                              {/* FAQ */}
                              {educational.help_content.faq && (
                                <div className="space-y-2">
                                  {educational.help_content.faq.map((item, i) => (
                                    <details
                                      key={i}
                                      className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden"
                                    >
                                      <summary className="p-3 cursor-pointer text-sm font-medium text-warm-800 hover:bg-warm-100 transition-colors">
                                        {item.q}
                                      </summary>
                                      <p className="px-3 pb-3 text-sm text-warm-700 leading-relaxed">
                                        {item.a}
                                      </p>
                                    </details>
                                  ))}
                                </div>
                              )}

                              {/* Tips */}
                              {educational.help_content.tips && (
                                <div className="space-y-1">
                                  {educational.help_content.tips.map((tip, i) => (
                                    <p key={i} className="text-xs text-warm-600 flex gap-2">
                                      <span className="text-brand">💡</span>
                                      {tip}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Completion Message */}
        {completedRequiredCount >= requiredCount && isExpanded && (
          <div className="mt-6 p-4 bg-gradient-to-r from-success/20 via-success/10 to-success/5 rounded-xl border-2 border-success/30">
            <p className="text-base font-bold text-success-dark flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              ¡Programa Configurado!
            </p>
            <p className="text-sm text-warm-700 mt-2">
              Tu sistema está listo para operar. Ahora comparte tu QR y links con tu equipo.
            </p>
            {completedCount < totalCount && (
              <p className="text-xs text-warm-600 mt-2">
                Completa las tareas opcionales para maximizar tu alcance
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
