/**
 * Educational Onboarding Type Definitions
 *
 * Comprehensive types for world-class self-service onboarding experience.
 * Supports inline actions, progressive disclosure, and contextual help.
 */

import { LucideIcon } from 'lucide-react';

// ============================================
// CORE CHECKLIST TYPES
// ============================================

export interface ChecklistTask {
  // Database fields
  id: string;
  title: string;
  description: string;
  order_index: number;
  required: boolean;
  icon: string;
  action_hint: string;

  // Completion state
  completed: boolean;
  completed_at: string | null;

  // Educational content
  educational_content?: EducationalContent;
}

export interface EducationalContent {
  // Core explanation
  why_it_matters: string;
  what_it_does: string;
  what_happens_next: string;

  // Time estimate
  estimated_time?: string; // e.g., "2 minutos"

  // Structured guidance (optional, task-specific)
  how_to_share?: HowToShareContent;
  who_needs_it?: string[];
  how_many_to_create?: RecommendationContent;
  templates?: CampaignTemplate[];

  // Action buttons
  action_buttons: ActionButton[];

  // Help resources
  help_content: HelpContent;
}

// ============================================
// TASK-SPECIFIC CONTENT TYPES
// ============================================

/**
 * For share_enrollment_qr task
 */
export interface HowToShareContent {
  physical: {
    title: string;
    instructions: string[];
  };
  digital: {
    title: string;
    instructions: string[];
  };
}

/**
 * For create_scanner_access task
 */
export interface RecommendationContent {
  recommendation: string;
  examples: string[];
}

/**
 * For create_campaign task
 */
export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'points_multiplier' | 'bonus_stamps' | 'scheduled';
  settings: Record<string, any>;
  best_for: string;
  expected_impact?: {
    inscriptions?: string; // e.g., "+200%"
    activity?: string; // e.g., "+300%"
  };
}

// ============================================
// ACTION & HELP TYPES
// ============================================

export interface ActionButton {
  text: string;
  destination?: string; // Navigation path
  action?: string; // Function to call
  variant: 'primary' | 'secondary' | 'ghost';
  icon?: LucideIcon;
}

export interface HelpContent {
  video_url?: string;
  estimated_time?: string; // Video duration
  faq?: FAQItem[];
  tips?: string[];
}

export interface FAQItem {
  q: string; // Question
  a: string; // Answer
}

// ============================================
// ONBOARDING FLOW STATE
// ============================================

export type OnboardingStep =
  | 'welcome'
  | 'share_qr'
  | 'scanner_access'
  | 'campaign'
  | 'complete';

export interface OnboardingState {
  current_step: OnboardingStep;
  completed_tasks: string[];
  skipped_tasks: string[];

  // Task-specific state
  qr_downloaded: boolean;
  qr_page_visits: number;
  created_scanner_accesses: ScannerAccessSummary[];
  selected_campaign_template: string | null;
  campaign_created: CampaignSummary | null;

  // Progress tracking
  setup_start_time: string | null;
  setup_complete_time: string | null;
}

export interface ScannerAccessSummary {
  id: string;
  name: string;
  access_url: string;
  qr_code_url?: string;
}

export interface CampaignSummary {
  id: string;
  name: string;
  type: string;
  status: string;
  duration_days: number;
}

// ============================================
// PROGRESS & COMPLETION TYPES
// ============================================

export interface ChecklistProgress {
  total_tasks: number;
  completed_tasks: number;
  required_tasks: number;
  completed_required_tasks: number;
  progress_percent: number;
  is_complete: boolean;
}

export interface SetupCompletionData {
  completion_time: string;
  time_taken_minutes: number;

  // Summary of what was completed
  card_name: string;
  scanner_accesses_created: number;
  campaign_name: string;
  campaign_type: string;

  // Next steps guidance
  expected_first_customer_days: number;
  expected_first_reward_days: number;
}

// ============================================
// NOTIFICATION TYPES (for post-setup)
// ============================================

export type NotificationType =
  | 'first_customer'
  | 'first_team_stamp'
  | 'customer_return'
  | 'first_reward'
  | 'campaign_impact'
  | 'milestone_achievement';

export interface NotificationConfig {
  type: NotificationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'celebration';
  channels: ('push' | 'whatsapp' | 'email' | 'in_app')[];
  celebration?: {
    fullScreen?: boolean;
    confetti?: boolean;
    cta?: string;
    cta_destination?: string;
  };
}

// ============================================
// COMPONENT PROP TYPES
// ============================================

export interface OnboardingChecklistProps {
  businessId: string;
  currentStep?: OnboardingStep;
  onStepComplete?: (step: OnboardingStep) => void;
  onSetupComplete?: (data: SetupCompletionData) => void;
}

export interface TaskCardProps {
  task: ChecklistTask;
  expanded: boolean;
  onToggle: () => void;
  onComplete: () => void;
  onSkip: () => void;
}

export interface InlineActionProps {
  taskId: string;
  businessId: string;
  onSuccess: (data: any) => void;
  onError: (error: Error) => void;
}

// ============================================
// EDUCATIONAL CONTENT DEFINITIONS
// ============================================

/**
 * Pre-defined educational content for each task.
 * This lives in frontend for easy updates without DB migrations.
 */
export const TASK_EDUCATIONAL_CONTENT: Record<string, EducationalContent> = {
  create_card: {
    why_it_matters: 'Tu tarjeta es lo que los clientes verán y compartirán. Un buen diseño aumenta la participación.',
    what_it_does: 'Define cómo se ve tu programa de lealtad y qué ganan los clientes.',
    what_happens_next: 'Una vez creada, generaremos automáticamente tu QR de inscripción.',
    estimated_time: '5 minutos',
    action_buttons: [
      {
        text: 'Diseñar Mi Tarjeta',
        destination: '/onboarding',
        variant: 'primary',
      },
    ],
    help_content: {
      video_url: '/tutorials/card-design',
      estimated_time: '5:00',
      tips: [
        'Usa colores de tu marca para reconocimiento',
        'Explica claramente qué gana el cliente',
        'Mantén el premio simple y atractivo',
      ],
    },
  },

  share_enrollment_qr: {
    why_it_matters: 'Este QR es cómo los clientes SE INSCRIBEN en tu programa. Sin compartir esto, nadie puede unirse.',
    what_it_does: `Cuando un cliente escanea este QR:
✅ Se crea su cuenta automáticamente
✅ Recibe su tarjeta digital
✅ Puede empezar a acumular sellos`,
    what_happens_next: 'Los clientes que escaneen aparecerán en tu Dashboard → Clientes',
    estimated_time: '2 minutos',
    how_to_share: {
      physical: {
        title: '📍 En Tu Local (Recomendado)',
        instructions: [
          'Descarga el QR en alta calidad',
          'Imprime en tamaño A4 o más grande',
          'Coloca en: mostrador, entrada, mesas',
          'Tip: Agrega texto "Escanea para unirte"',
        ],
      },
      digital: {
        title: '📱 Digital',
        instructions: [
          'Copia el link de inscripción',
          'Comparte por WhatsApp/Instagram/Facebook',
          'Agrégalo a tu menú digital',
          'Ponlo en tu perfil de redes',
        ],
      },
    },
    action_buttons: [
      {
        text: 'Ver Mi QR',
        destination: '/dashboard/qr',
        variant: 'primary',
      },
      {
        text: 'Descargar QR',
        action: 'download_qr',
        variant: 'secondary',
      },
      {
        text: 'Copiar Link',
        action: 'copy_enrollment_link',
        variant: 'secondary',
      },
    ],
    help_content: {
      video_url: '/tutorials/share-enrollment-qr',
      estimated_time: '2:00',
      faq: [
        {
          q: '¿Dónde pongo el QR?',
          a: 'En tu mostrador, entrada, o donde los clientes paguen. Más visible = más inscripciones.',
        },
        {
          q: '¿Puedo imprimir en papel normal?',
          a: 'Sí, pero recomendamos papel grueso o plastificarlo para durabilidad.',
        },
        {
          q: '¿Funciona si lo comparto en redes?',
          a: 'Sí, también puedes copiar el link y compartirlo digitalmente.',
        },
      ],
    },
  },

  create_scanner_access: {
    why_it_matters: 'Tu equipo necesita una forma de DAR SELLOS a los clientes. Este link les da acceso al scanner sin entrar a tu dashboard.',
    what_it_does: `Cuando tu equipo usa este link:
✅ Accede al scanner desde su celular
✅ Escanea QR del cliente para dar sello
✅ No puede ver tu configuración ni finanzas
✅ Tú ves quién dio cada sello`,
    what_happens_next: 'Tu equipo podrá dar sellos. Recibirás notificación del primer sello que den.',
    estimated_time: '3 minutos',
    who_needs_it: [
      'Meseros que atienden mesas',
      'Cajeros que cobran',
      'Personal en mostrador',
      'Cualquier persona que interactúe con clientes',
    ],
    how_many_to_create: {
      recommendation: 'Crea uno por persona o por puesto',
      examples: [
        'Si tienes 3 meseros: crea 3 accesos ("Mesero Juan", "Mesero Ana", "Mesero Carlos")',
        'Si tienes una caja: crea 1 acceso ("Caja Principal")',
        'Si tienes varias sucursales: crea 1 por sucursal',
      ],
    },
    action_buttons: [
      {
        text: 'Crear Acceso Scanner',
        destination: '/dashboard/scanner-access/new',
        variant: 'primary',
      },
    ],
    help_content: {
      video_url: '/tutorials/scanner-access',
      estimated_time: '3:00',
      faq: [
        {
          q: '¿Mi equipo verá mis datos de negocio?',
          a: 'No. Solo pueden dar sellos. No ven configuración, clientes ni analytics.',
        },
        {
          q: '¿Puedo desactivar un acceso?',
          a: 'Sí, en cualquier momento desde Dashboard → Acceso Empleados.',
        },
        {
          q: '¿Qué pasa si pierden el link?',
          a: 'Puedes desactivar ese acceso y crear uno nuevo.',
        },
      ],
    },
  },

  create_campaign: {
    why_it_matters: 'Las campañas impulsan la ADOPCIÓN INICIAL de tu programa. Los clientes dudan en empezar algo nuevo. Una promoción los motiva.',
    what_it_does: `Las campañas pueden:
✅ Dar puntos dobles (cliente avanza más rápido)
✅ Dar sellos bonus (recompensa por unirse)
✅ Crear urgencia (oferta por tiempo limitado)`,
    what_happens_next: 'Tu campaña estará activa inmediatamente. Verás en Analytics el impacto en inscripciones y sellos.',
    estimated_time: '4 minutos',
    templates: [
      {
        id: 'launch_2x',
        name: '🚀 Lanzamiento: Doble Puntos',
        description: 'Todos los sellos valen doble por 7 días',
        icon: 'rocket',
        type: 'points_multiplier',
        settings: {
          multiplier: 2,
          duration_days: 7,
        },
        best_for: 'Primeras semanas del programa',
        expected_impact: {
          inscriptions: '+200%',
          activity: '+300%',
        },
      },
      {
        id: 'welcome_bonus',
        name: '🎁 Bienvenida: 2 Sellos Gratis',
        description: 'Nuevos clientes empiezan con 2 sellos',
        icon: 'gift',
        type: 'bonus_stamps',
        settings: {
          bonus_count: 2,
          trigger: 'first_enrollment',
        },
        best_for: 'Incentivar inscripciones',
        expected_impact: {
          inscriptions: '+150%',
          activity: '+100%',
        },
      },
      {
        id: 'weekend_3x',
        name: '⚡ Fin de Semana: Triple Puntos',
        description: 'Sábado y domingo puntos x3',
        icon: 'zap',
        type: 'points_multiplier',
        settings: {
          multiplier: 3,
          days: ['SAT', 'SUN'],
          duration_days: 30,
        },
        best_for: 'Aumentar tráfico de fin de semana',
        expected_impact: {
          inscriptions: '+80%',
          activity: '+200%',
        },
      },
    ],
    action_buttons: [
      {
        text: 'Crear Campaña',
        destination: '/dashboard/campaigns/new',
        variant: 'primary',
      },
    ],
    help_content: {
      video_url: '/tutorials/campaigns',
      estimated_time: '4:00',
      faq: [
        {
          q: '¿Cuándo uso puntos dobles vs sellos bonus?',
          a: 'Dobles puntos: clientes avanzan más rápido. Sellos bonus: incentivo inmediato por unirse.',
        },
        {
          q: '¿Puedo tener varias campañas activas?',
          a: 'Sí, pero recomendamos 1-2 para no confundir a los clientes.',
        },
        {
          q: '¿Cómo sé si mi campaña funciona?',
          a: 'Ve Dashboard → Analytics. Verás el aumento en sellos e inscripciones.',
        },
      ],
    },
  },
};
