'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCampaigns } from '@/lib/hooks/useCampaigns';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/design-system/primitives/Card/Card';
import { Button } from '@/design-system/primitives/Button/Button';
import { Badge } from '@/design-system/primitives/Badge/Badge';
import { MessageCircle, Plus, Send, Clock, CheckCircle, XCircle, X } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CampaignsPage() {
  const { user } = useAuth();
  const businessId = user?.user_metadata?.business_id || '';
  const { data: campaigns, isLoading } = useCampaigns(businessId);
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams?.get('success') === 'true') {
      setShowSuccess(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const activeCampaigns = campaigns?.filter((c) => c.status === 'active') || [];
  const draftCampaigns = campaigns?.filter((c) => c.status === 'draft') || [];
  const totalSent = campaigns?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0;

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Success Banner */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-success/10 border-2 border-success/20 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center text-white">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-success-dark">¡Campaña creada exitosamente!</p>
              <p className="text-sm text-warm-700">Tu campaña está lista y aparecerá en la lista abajo.</p>
            </div>
          </div>
          <button
            onClick={() => setShowSuccess(false)}
            className="text-warm-500 hover:text-warm-700"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-warm-900 mb-2">Campañas</h1>
          <p className="text-warm-600">Automatiza mensajes para retener clientes</p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button variant="cta" leftIcon={<Plus className="w-5 h-5" />}>
            Nueva Campaña
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent>
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-success/10 text-success">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-warm-900 mb-1">{activeCampaigns.length}</h3>
            <p className="text-sm text-warm-600">Campañas Activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-warm-900 mb-1">{draftCampaigns.length}</h3>
            <p className="text-sm text-warm-600">Borradores</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-brand-whisper text-brand">
                <Send className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-warm-900 mb-1">{totalSent}</h3>
            <p className="text-sm text-warm-600">Mensajes Enviados</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List */}
      <Card>
        <CardHeader>
          <CardTitle>Todas las Campañas</CardTitle>
          <CardDescription>
            Mensajes automáticos basados en eventos de clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns && campaigns.length > 0 ? (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <CampaignRow key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-warm-100 mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-warm-400" />
              </div>
              <p className="text-warm-600 mb-4">Aún no tienes campañas</p>
              <Link href="/dashboard/campaigns/new">
                <Button variant="primary" leftIcon={<Plus className="w-5 h-5" />}>
                  Crear Primera Campaña
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CampaignRow({ campaign }: { campaign: any }) {
  const statusConfig = {
    draft: { label: 'Borrador', variant: 'neutral' as const, icon: Clock },
    active: { label: 'Activa', variant: 'success' as const, icon: CheckCircle },
    paused: { label: 'Pausada', variant: 'warning' as const, icon: Clock },
    completed: { label: 'Completada', variant: 'neutral' as const, icon: CheckCircle },
  };

  const config = statusConfig[campaign.status as keyof typeof statusConfig] || statusConfig.draft;
  const StatusIcon = config.icon;
  const successRate =
    campaign.sent_count > 0
      ? Math.round((campaign.sent_count / (campaign.sent_count + (campaign.failed_count || 0))) * 100)
      : 0;

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-warm-200 hover:border-brand-light hover:bg-brand-whisper/50 transition-all">
      <div className="w-12 h-12 rounded-lg bg-brand-mist flex items-center justify-center text-brand">
        <MessageCircle className="w-6 h-6" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-warm-900">{campaign.name}</h4>
          <Badge variant={config.variant}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>
        <p className="text-sm text-warm-600 line-clamp-1">{campaign.message_template}</p>
      </div>

      <div className="text-right">
        <div className="flex items-center gap-4">
          {campaign.sent_count > 0 && (
            <div>
              <p className="text-sm font-medium text-warm-900">
                {campaign.sent_count} enviados
              </p>
              <p className="text-xs text-success">{successRate}% éxito</p>
            </div>
          )}
          <div>
            <p className="text-xs text-warm-500">
              {campaign.created_at &&
                format(new Date(campaign.created_at), "d 'de' MMM", { locale: es })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
