'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/design-system/primitives/Card/Card';
import { Button } from '@/design-system/primitives/Button/Button';
import { Input } from '@/design-system/primitives/Input/Input';
import { Badge } from '@/design-system/primitives/Badge/Badge';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params?.id as string;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [status, setStatus] = useState<'active' | 'paused' | 'draft'>('draft');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load campaign data
  useEffect(() => {
    if (!campaignId) return;

    const loadCampaign = async () => {
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', campaignId)
          .single();

        if (error) throw error;

        if (data) {
          setName(data.name);
          setMessageTemplate(data.message_template);
          setStatus(data.status);
        }
      } catch (err) {
        console.error('Error loading campaign:', err);
        setError('Error al cargar la campaña');
      } finally {
        setLoading(false);
      }
    };

    loadCampaign();
  }, [campaignId]);

  const handleSave = async () => {
    if (!name || !messageTemplate) {
      setError('Completa todos los campos requeridos');
      return;
    }

    if (messageTemplate.length > 1600) {
      setError('El mensaje no puede exceder 1600 caracteres');
      return;
    }

    setError('');
    setSaving(true);

    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          name,
          message_template: messageTemplate,
          status,
        })
        .eq('id', campaignId);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/campaigns');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la campaña');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/campaigns">
          <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Volver a Campañas
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-warm-900 mt-4 mb-2">Editar Campaña</h1>
        <p className="text-warm-600">Modifica los detalles de tu campaña</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-success/10 border-2 border-success/20 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center text-white">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-success-dark">¡Campaña actualizada exitosamente!</p>
            <p className="text-sm text-warm-700">Redirigiendo...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-error/10 border-2 border-error/20 rounded-lg">
          <p className="text-error font-medium">{error}</p>
        </div>
      )}

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles de la Campaña</CardTitle>
          <CardDescription>Edita el nombre, mensaje y estado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium text-warm-900 mb-2">
              Nombre de la Campaña *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Bienvenida a nuevos clientes"
              disabled={saving}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-warm-900 mb-2">
              Estado
            </label>
            <div className="flex gap-2">
              <Badge
                variant={status === 'active' ? 'success' : 'neutral'}
                className="cursor-pointer px-4 py-2"
                onClick={() => !saving && setStatus('active')}
              >
                Activa
              </Badge>
              <Badge
                variant={status === 'paused' ? 'warning' : 'neutral'}
                className="cursor-pointer px-4 py-2"
                onClick={() => !saving && setStatus('paused')}
              >
                Pausada
              </Badge>
              <Badge
                variant={status === 'draft' ? 'neutral' : 'neutral'}
                className="cursor-pointer px-4 py-2"
                onClick={() => !saving && setStatus('draft')}
              >
                Borrador
              </Badge>
            </div>
          </div>

          {/* Message Template */}
          <div>
            <label className="block text-sm font-medium text-warm-900 mb-2">
              Mensaje de WhatsApp *
            </label>
            <textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              className="w-full min-h-[120px] p-3 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
              placeholder="Escribe tu mensaje aquí..."
              disabled={saving}
            />
            <p className="text-sm text-warm-600 mt-1">
              {messageTemplate.length}/1600 caracteres
            </p>
          </div>

          {/* Preview */}
          <div className="bg-warm-50 p-4 rounded-lg border border-warm-200">
            <p className="text-xs font-medium text-warm-700 mb-2">VISTA PREVIA</p>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-warm-900 whitespace-pre-wrap">
                {messageTemplate || 'Tu mensaje aparecerá aquí...'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving || !name || !messageTemplate}
              leftIcon={<Save className="w-4 h-4" />}
              className="flex-1"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            <Link href="/dashboard/campaigns" className="flex-1">
              <Button variant="ghost" className="w-full" disabled={saving}>
                Cancelar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
