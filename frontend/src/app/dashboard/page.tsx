'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/design-system/primitives/Card/Card';
import { Badge } from '@/design-system/primitives/Badge/Badge';
import { Button } from '@/design-system/primitives/Button/Button';
import { Progress } from '@/design-system/primitives/Progress/Progress';
import { TrendingUp, Users, Gift, MessageCircle, X, CreditCard, QrCode as QrCodeIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useCustomerActivityMetrics, useStampTimeline, useCampaignPerformance } from '@/lib/hooks/useAnalytics';
import { useCustomers } from '@/lib/hooks/useCustomers';
import { useCampaigns } from '@/lib/hooks/useCampaigns';
import { useBusiness } from '@/lib/hooks/useBusiness';
import { useFirstCustomerCelebration } from '@/lib/hooks/useFirstCustomerCelebration';
import { FirstCustomerCelebration } from '@/components/FirstCustomerCelebration';
import { useRewardRedemptions } from '@/lib/hooks/useRewardRedemptions';
import { RewardRedemptionToast } from '@/components/RewardRedemptionToast';
import { SimpleOnboardingChecklist } from '@/components/SimpleOnboardingChecklist';

export default function DashboardPage() {
  const { user } = useAuth();
  const businessId = user?.user_metadata?.business_id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const showOnboardingComplete = searchParams?.get('onboarding') === 'complete';
  const [welcomeBannerDismissed, setWelcomeBannerDismissed] = useState(false);

  // Fetch real data
  const { data: business, isLoading: loadingBusiness } = useBusiness(businessId || '');

  // First customer celebration
  const { shouldCelebrate, dismissCelebration } = useFirstCustomerCelebration(businessId || '');

  // Reward redemption celebrations
  const { latestRedemption, dismissRedemption } = useRewardRedemptions(businessId || '');

  const { data: activityMetrics, isLoading: loadingActivity } = useCustomerActivityMetrics(businessId || '');
  const { data: customers, isLoading: loadingCustomers } = useCustomers(businessId || '');
  const { data: campaigns, isLoading: loadingCampaigns } = useCampaigns(businessId || '');

  // Get stamps for this week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const { data: stampTimeline } = useStampTimeline(
    businessId || '',
    weekStart.toISOString(),
    new Date().toISOString()
  );

  // Calculate weekly stats
  const weeklyStamps = stampTimeline?.reduce((sum, day) => sum + day.count, 0) || 0;
  const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;

  // Get recent customers (sorted by last activity)
  const recentCustomers = customers
    ?.sort((a, b) => {
      const dateA = a.last_activity_at ? new Date(a.last_activity_at).getTime() : 0;
      const dateB = b.last_activity_at ? new Date(b.last_activity_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5) || [];

  if (loadingActivity || loadingCustomers || loadingCampaigns || loadingBusiness) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-warm-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  // Extract business info with defaults
  const brandColors = business?.brand_colors || { primary: '#A855F7', accent: '#F97316' };
  // Use accent as secondary for gradient (database schema has primary/accent, not primary/secondary)
  const gradientColors = {
    primary: brandColors.primary || '#A855F7',
    secondary: brandColors.accent || '#F97316'
  };
  const rewardStructure = business?.reward_structure || { stamps_required: 10, reward_description: '1 producto gratis' };
  const businessName = business?.name || 'Mi Negocio';

  // Debug logging
  console.log('Dashboard business data:', { business, brandColors, gradientColors, rewardStructure, businessName });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* First Customer Celebration Modal */}
      {shouldCelebrate && <FirstCustomerCelebration onDismiss={dismissCelebration} />}

      {/* Reward Redemption Toast */}
      {latestRedemption && (
        <RewardRedemptionToast
          customerName={latestRedemption.customer.name}
          onDismiss={dismissRedemption}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-warm-900 mb-2">Dashboard</h1>
        <p className="text-warm-600">Resumen de tu programa de lealtad</p>
      </div>

      {/* Welcome Banner (Post-Onboarding) */}
      {showOnboardingComplete && !welcomeBannerDismissed && (
        <Card className="mb-6 border-2 border-success bg-success/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl flex-shrink-0">🎉</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-success-dark mb-2">
                  ¡Configuración Completa!
                </h3>
                <p className="text-warm-700 mb-4">
                  Tu programa de fidelidad está listo. Aquí tienes tus próximos pasos:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-success text-white flex items-center justify-center font-semibold text-xs">1</span>
                    <span className="text-warm-800">Comparte tu QR con clientes (mira tu tarjeta abajo)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-warm-300 text-warm-800 flex items-center justify-center font-semibold text-xs">2</span>
                    <span className="text-warm-600">Inscribe tu primer cliente escaneando su código</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-warm-300 text-warm-800 flex items-center justify-center font-semibold text-xs">3</span>
                    <span className="text-warm-600">Opcional: Crea campañas automáticas más tarde</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setWelcomeBannerDismissed(true);
                  router.push('/dashboard');
                }}
                className="text-warm-500 hover:text-warm-700 flex-shrink-0"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simple Onboarding Checklist */}
      <div className="mb-6">
        <SimpleOnboardingChecklist businessId={businessId || ''} autoCollapse={true} />
      </div>

      {/* Card Preview Section */}
      <Card className="mb-8 border-2 border-brand-light">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Card Preview (mini version of customer card) */}
            <div
              className="w-full md:w-80 min-h-[280px] rounded-xl p-6 text-white shadow-lg flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${gradientColors.primary}, ${gradientColors.secondary})`,
                minHeight: '280px'
              }}
            >
              {business?.logo_url && (
                <img src={business.logo_url} alt={businessName} className="h-8 mb-3 object-contain" />
              )}
              <h3 className="font-bold text-xl mb-2">{businessName}</h3>
              <div className="text-sm opacity-90 mb-4">Tarjeta de Fidelidad</div>
              <div className="flex gap-1.5 mb-4 flex-wrap">
                {Array.from({ length: rewardStructure.stamps_required }).map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-xs opacity-75">{i + 1}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs opacity-75 mb-1">Premio al completar:</p>
                <p className="text-sm font-semibold">{rewardStructure.reward_description}</p>
              </div>
            </div>

            {/* QR Code & Actions */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 mb-4">
                <CreditCard className="w-6 h-6 text-brand flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-warm-900 mb-1">Tu Tarjeta Digital</h3>
                  <p className="text-sm text-warm-600">
                    Los clientes ven esta tarjeta cuando se inscriben con tu QR.
                    Compártela en redes sociales o imprime tu QR para mostrar en tu local.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard/card">
                  <Button variant="primary" size="sm" className="gap-2">
                    <CreditCard className="w-4 h-4" />
                    Ver Mi Tarjeta
                  </Button>
                </Link>
              </div>

              {activityMetrics && activityMetrics.total_customers > 0 && (
                <div className="mt-4 p-3 bg-brand-whisper rounded-lg">
                  <p className="text-sm text-warm-700">
                    <span className="font-semibold text-brand">{activityMetrics.total_customers}</span> {activityMetrics.total_customers === 1 ? 'cliente inscrito' : 'clientes inscritos'} con esta tarjeta
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Sellos Esta Semana"
          value={weeklyStamps.toString()}
          change="—"
          trend="neutral"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="Clientes Activos"
          value={activityMetrics?.active_customers.toString() || '0'}
          change="—"
          trend="neutral"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Total Clientes"
          value={activityMetrics?.total_customers.toString() || '0'}
          change="—"
          trend="neutral"
          icon={<Gift className="w-5 h-5" />}
        />
        <StatCard
          title="Campañas Activas"
          value={activeCampaigns.toString()}
          change="—"
          trend="neutral"
          icon={<MessageCircle className="w-5 h-5" />}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Clientes Recientes</CardTitle>
            <CardDescription>Últimos clientes que ganaron sellos</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCustomers.length === 0 ? (
              <p className="text-sm text-warm-600 py-4">No hay clientes registrados aún</p>
            ) : (
              <div className="space-y-4">
                {recentCustomers.map((customer) => (
                  <CustomerRow
                    key={customer.id}
                    name={customer.name}
                    stamps={customer.stamps_count || 0}
                    total={10}
                    status={
                      (customer.stamps_count || 0) >= 10
                        ? 'Premio disponible'
                        : (customer.stamps_count || 0) >= 7
                        ? 'Cerca del premio'
                        : 'Activo'
                    }
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Campañas Activas</CardTitle>
              <CardDescription>Tus campañas de mensajería</CardDescription>
            </div>
            <Link
              href="/dashboard/campaigns"
              className="text-sm font-medium text-brand hover:text-brand-deep transition-colors"
            >
              Ver todas →
            </Link>
          </CardHeader>
          <CardContent>
            {activeCampaigns === 0 ? (
              <p className="text-sm text-warm-600 py-4">No hay campañas activas</p>
            ) : (
              <div className="space-y-4">
                {campaigns
                  ?.filter(c => c.status === 'active')
                  .slice(0, 3)
                  .map((campaign) => (
                    <RuleRow
                      key={campaign.id}
                      title={campaign.name}
                      action={`${campaign.sent_count || 0} mensajes enviados`}
                      active={campaign.status === 'active'}
                    />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  trend,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 rounded-lg bg-brand-whisper text-brand">{icon}</div>
          <Badge variant={trend === 'up' ? 'success' : 'neutral'}>{change}</Badge>
        </div>
        <h3 className="text-2xl font-bold text-warm-900 mb-1">{value}</h3>
        <p className="text-sm text-warm-600">{title}</p>
      </CardContent>
    </Card>
  );
}

function CustomerRow({
  name,
  stamps,
  total,
  status,
}: {
  name: string;
  stamps: number;
  total: number;
  status: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-brand-mist flex items-center justify-center text-brand-deep font-semibold">
        {name[0]}
      </div>
      <div className="flex-1">
        <p className="font-medium text-warm-900">{name}</p>
        <Progress value={stamps} max={total} size="sm" />
      </div>
      <Badge variant={stamps === total ? 'success' : 'brand'}>{status}</Badge>
    </div>
  );
}

function RuleRow({
  title,
  action,
  active,
}: {
  title: string;
  action: string;
  active: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1">
        <div
          className={`w-2 h-2 rounded-full ${active ? 'bg-success' : 'bg-warm-300'}`}
        />
      </div>
      <div className="flex-1">
        <p className="font-medium text-warm-900">{title}</p>
        <p className="text-sm text-warm-600">→ {action}</p>
      </div>
    </div>
  );
}
