'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/design-system/primitives/Card/Card';
import { Badge } from '@/design-system/primitives/Badge/Badge';
import { Progress } from '@/design-system/primitives/Progress/Progress';
import { TrendingUp, Users, Gift, MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useCustomerActivityMetrics, useStampTimeline, useCampaignPerformance } from '@/lib/hooks/useAnalytics';
import { useCustomers } from '@/lib/hooks/useCustomers';
import { useCampaigns } from '@/lib/hooks/useCampaigns';

export default function DashboardPage() {
  const { user } = useAuth();
  const businessId = user?.user_metadata?.business_id;

  // Fetch real data
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

  if (loadingActivity || loadingCustomers || loadingCampaigns) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-warm-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-warm-900 mb-2">Dashboard</h1>
        <p className="text-warm-600">Resumen de tu programa de lealtad</p>
      </div>

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
          <CardHeader>
            <CardTitle>Campañas Activas</CardTitle>
            <CardDescription>Tus campañas de mensajería</CardDescription>
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
