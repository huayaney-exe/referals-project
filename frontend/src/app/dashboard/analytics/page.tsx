'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  useCustomerActivityMetrics,
  useCampaignPerformance,
  useStampTimeline,
  useLatestAnalytics,
} from '@/lib/hooks/useAnalytics';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/design-system/primitives/Card/Card';
import { Badge } from '@/design-system/primitives/Badge/Badge';
import { TrendingUp, TrendingDown, Users, Award, AlertCircle, Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type DateRange = '7d' | '30d' | '90d';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  // Calculate date range
  const endDate = new Date().toISOString();
  const startDate = (() => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    return subDays(new Date(), days).toISOString();
  })();

  // Fetch analytics data
  const { data: customerMetrics, isLoading: metricsLoading } = useCustomerActivityMetrics(user?.id || '');
  const { data: campaignPerf, isLoading: campaignLoading } = useCampaignPerformance(user?.id || '');
  const { data: stampTimeline, isLoading: timelineLoading } = useStampTimeline(
    user?.id || '',
    startDate,
    endDate
  );
  const { data: latestSnapshot } = useLatestAnalytics(user?.id || '');

  const isLoading = metricsLoading || campaignLoading || timelineLoading;

  // Calculate retention rate
  const retentionRate = customerMetrics
    ? (customerMetrics.active_customers / customerMetrics.total_customers) * 100
    : 0;

  const atRiskRate = customerMetrics
    ? (customerMetrics.at_risk_customers / customerMetrics.total_customers) * 100
    : 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-warm-900 mb-2">Analytics</h1>
        <p className="text-warm-600">Insights de tu programa de lealtad</p>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setDateRange('7d')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            dateRange === '7d'
              ? 'bg-brand text-white'
              : 'bg-white text-warm-700 border border-warm-200 hover:border-brand'
          }`}
        >
          Últimos 7 días
        </button>
        <button
          onClick={() => setDateRange('30d')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            dateRange === '30d'
              ? 'bg-brand text-white'
              : 'bg-white text-warm-700 border border-warm-200 hover:border-brand'
          }`}
        >
          Últimos 30 días
        </button>
        <button
          onClick={() => setDateRange('90d')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            dateRange === '90d'
              ? 'bg-brand text-white'
              : 'bg-white text-warm-700 border border-warm-200 hover:border-brand'
          }`}
        >
          Últimos 90 días
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Active Customers */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-brand" />
              </div>
              <Badge variant="success">
                {retentionRate.toFixed(1)}%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-warm-900 mb-1">
              {isLoading ? '...' : customerMetrics?.active_customers || 0}
            </h3>
            <p className="text-sm text-warm-600">Clientes activos</p>
            <div className="mt-3 flex items-center gap-1 text-xs text-success">
              <TrendingUp className="w-3 h-3" />
              <span>Tasa de retención</span>
            </div>
          </CardContent>
        </Card>

        {/* At Risk Customers */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-warning" />
              </div>
              <Badge variant="warning">
                {atRiskRate.toFixed(1)}%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-warm-900 mb-1">
              {isLoading ? '...' : customerMetrics?.at_risk_customers || 0}
            </h3>
            <p className="text-sm text-warm-600">Clientes en riesgo</p>
            <div className="mt-3 text-xs text-warm-500">
              Sin actividad en 14+ días
            </div>
          </CardContent>
        </Card>

        {/* Average Stamps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-cta/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-cta" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-warm-900 mb-1">
              {isLoading ? '...' : customerMetrics?.avg_stamps_per_customer.toFixed(1) || '0'}
            </h3>
            <p className="text-sm text-warm-600">Sellos promedio</p>
            <div className="mt-3 text-xs text-warm-500">
              Por cliente
            </div>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-info" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-warm-900 mb-1">
              {isLoading ? '...' : customerMetrics?.total_customers || 0}
            </h3>
            <p className="text-sm text-warm-600">Total clientes</p>
            <div className="mt-3 text-xs text-warm-500">
              Todos los tiempos
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stamp Timeline Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad de Sellos</CardTitle>
            <CardDescription>Sellos otorgados por día</CardDescription>
          </CardHeader>
          <CardContent>
            {timelineLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-warm-500">Cargando datos...</div>
              </div>
            ) : stampTimeline && stampTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stampTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    tickFormatter={(value) => format(new Date(value), 'd MMM', { locale: es })}
                  />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                    labelFormatter={(value) => format(new Date(value as string), "d 'de' MMMM", { locale: es })}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#A855F7"
                    strokeWidth={2}
                    dot={{ fill: '#A855F7', r: 4 }}
                    name="Sellos"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-warm-300 mx-auto mb-3" />
                  <p className="text-sm text-warm-600">No hay datos para este período</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaign Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento de Campañas</CardTitle>
            <CardDescription>Mensajes enviados por campaña</CardDescription>
          </CardHeader>
          <CardContent>
            {campaignLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-warm-500">Cargando datos...</div>
              </div>
            ) : campaignPerf && campaignPerf.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={campaignPerf}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="campaign_name"
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="sent_count" fill="#F97316" name="Enviados" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-warm-300 mx-auto mb-3" />
                  <p className="text-sm text-warm-600">No hay campañas activas</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Latest Snapshot Summary */}
      {latestSnapshot && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resumen del Último Snapshot</CardTitle>
            <CardDescription>
              Generado el {format(new Date(latestSnapshot.snapshot_date), "d 'de' MMMM, yyyy", { locale: es })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-warm-600 mb-1">Clientes activos</p>
                <p className="text-2xl font-bold text-warm-900">{latestSnapshot.active_customers}</p>
              </div>
              <div>
                <p className="text-sm text-warm-600 mb-1">Total sellos</p>
                <p className="text-2xl font-bold text-warm-900">{latestSnapshot.total_stamps}</p>
              </div>
              <div>
                <p className="text-sm text-warm-600 mb-1">Recompensas</p>
                <p className="text-2xl font-bold text-warm-900">{latestSnapshot.rewards_issued}</p>
              </div>
              <div>
                <p className="text-sm text-warm-600 mb-1">Retención</p>
                <p className="text-2xl font-bold text-warm-900">
                  {latestSnapshot.retention_rate ? `${latestSnapshot.retention_rate.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
