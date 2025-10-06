'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCreateCampaign } from '@/lib/hooks/useCampaigns';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/design-system/primitives/Card/Card';
import { Button } from '@/design-system/primitives/Button/Button';
import { Input } from '@/design-system/primitives/Input/Input';
import { Badge } from '@/design-system/primitives/Badge/Badge';
import { ArrowLeft, Send, Save, Sparkles, Target, Clock, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';

// Template library
const TEMPLATES = [
  {
    id: 'welcome',
    name: 'Bienvenida',
    category: 'milestone',
    trigger: { type: 'customer_enrolled' },
    message: '¡Hola {nombre}! Bienvenido a {negocio}. Gana {sellos_faltantes} sellos más para tu {recompensa}. ✨',
    icon: '👋',
  },
  {
    id: 'almost_there',
    name: 'Cerca del Premio',
    category: 'milestone',
    trigger: { type: 'stamps_reached', value: 7 },
    message: '¡{nombre}, estás cerca! Solo {sellos_faltantes} sellos más para tu {recompensa}. 🎯',
    icon: '🎯',
  },
  {
    id: 'reward_ready',
    name: 'Premio Disponible',
    category: 'milestone',
    trigger: { type: 'reward_unlocked' },
    message: '🎉 ¡{nombre}, tienes un premio disponible! Ven a {negocio} para canjear tu {recompensa}.',
    icon: '🎉',
  },
  {
    id: 'inactive_7',
    name: 'Inactivo 7 días',
    category: 'time',
    trigger: { type: 'days_inactive', value: 7 },
    message: 'Te extrañamos {nombre}. Han pasado {dias_inactivo} días. Tienes {sellos} sellos esperándote en {negocio}. 💙',
    icon: '💙',
  },
  {
    id: 'inactive_14',
    name: 'Inactivo 14 días',
    category: 'time',
    trigger: { type: 'days_inactive', value: 14 },
    message: '¡Regresa {nombre}! Te extrañamos. Tienes {sellos} sellos y estamos listos para recibirte en {negocio}. 🌟',
    icon: '🌟',
  },
  {
    id: 'reactivation',
    name: 'Reactivación Especial',
    category: 'time',
    trigger: { type: 'days_inactive', value: 30 },
    message: '¡{nombre}! Te damos 2 sellos de bienvenida. Ya tienes {sellos} sellos. ¡Vuelve a {negocio}! 🎁',
    icon: '🎁',
  },
];

// Available variables with descriptions
const VARIABLES = [
  { key: '{nombre}', description: 'Nombre del cliente', example: 'Juan' },
  { key: '{sellos}', description: 'Sellos actuales', example: '8' },
  { key: '{sellos_faltantes}', description: 'Sellos hasta el premio', example: '2' },
  { key: '{recompensa}', description: 'Descripción del premio', example: '1 café gratis' },
  { key: '{negocio}', description: 'Nombre de tu negocio', example: 'Café Central' },
  { key: '{dias_inactivo}', description: 'Días sin visitar', example: '14' },
];

// Trigger types
const TRIGGER_TYPES = [
  {
    id: 'customer_enrolled',
    name: 'Cliente se inscribe',
    category: 'milestone',
    icon: <Sparkles className="w-4 h-4" />,
    description: 'Enviar cuando un cliente nuevo se une',
  },
  {
    id: 'stamps_reached',
    name: 'Sellos alcanzados',
    category: 'milestone',
    icon: <Target className="w-4 h-4" />,
    description: 'Enviar cuando el cliente llega a X sellos',
    hasValue: true,
    valueName: 'Cantidad de sellos',
  },
  {
    id: 'reward_unlocked',
    name: 'Premio desbloqueado',
    category: 'milestone',
    icon: <Sparkles className="w-4 h-4" />,
    description: 'Enviar cuando el cliente completa su tarjeta',
  },
  {
    id: 'days_inactive',
    name: 'Días inactivo',
    category: 'time',
    icon: <Clock className="w-4 h-4" />,
    description: 'Enviar después de X días sin visitar',
    hasValue: true,
    valueName: 'Días sin visitar',
  },
  {
    id: 'stamp_earned',
    name: 'Sello ganado',
    category: 'behavior',
    icon: <TrendingUp className="w-4 h-4" />,
    description: 'Enviar cada vez que gana un sello',
  },
];

export default function EnhancedCampaignPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createCampaign = useCreateCampaign();

  const [step, setStep] = useState<'template' | 'customize'>('template');
  const [name, setName] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<{ type: string; value?: number } | null>(null);
  const [error, setError] = useState('');

  const handleSelectTemplate = (template: typeof TEMPLATES[0]) => {
    setSelectedTemplate(template.id);
    setName(template.name);
    setMessageTemplate(template.message);
    setTrigger(template.trigger);
    setStep('customize');
  };

  const handleCustomTemplate = () => {
    setSelectedTemplate('custom');
    setStep('customize');
  };

  const handleSelectTrigger = (triggerType: string) => {
    setTrigger({ type: triggerType });
  };

  const handleInsertVariable = (variable: string) => {
    setMessageTemplate(messageTemplate + variable);
  };

  const handleSave = async (status: 'draft' | 'active') => {
    if (!name || !messageTemplate || !trigger) {
      setError('Completa todos los campos requeridos');
      return;
    }

    if (messageTemplate.length > 1600) {
      setError('El mensaje no puede exceder 1600 caracteres');
      return;
    }

    try {
      await createCampaign.mutateAsync({
        business_id: user?.user_metadata?.business_id || '',
        name,
        message_template: messageTemplate,
        trigger_type: trigger.type,
        trigger_config: trigger,
        status,
      });

      router.push('/dashboard/campaigns');
    } catch (err: any) {
      setError(err.message || 'Error al crear la campaña');
    }
  };

  // Preview message with example data - memoized for reactivity
  const previewMessage = useMemo(() => {
    return messageTemplate
      .replace(/{nombre}/g, 'Juan')
      .replace(/{sellos}/g, '8')
      .replace(/{sellos_faltantes}/g, '2')
      .replace(/{recompensa}/g, '1 café gratis')
      .replace(/{negocio}/g, user?.user_metadata?.business_name || 'Tu Negocio')
      .replace(/{dias_inactivo}/g, '14');
  }, [messageTemplate, user?.user_metadata?.business_name]);

  if (step === 'template') {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/campaigns">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-warm-900 mt-4 mb-2">Nueva Campaña</h1>
          <p className="text-warm-600">Elige una plantilla o crea desde cero</p>
        </div>

        {/* Template Categories */}
        <div className="mb-6">
          <div className="flex gap-2">
            <Badge variant="brand">Todos</Badge>
            <Badge variant="neutral">Hitos</Badge>
            <Badge variant="neutral">Tiempo</Badge>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-brand"
              onClick={() => handleSelectTemplate(template)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl">{template.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-warm-900 mb-1">{template.name}</h3>
                    <Badge variant={template.category === 'milestone' ? 'brand' : 'neutral'} className="text-xs">
                      {template.category === 'milestone' ? 'Hito' : 'Tiempo'}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-warm-600 line-clamp-2">{template.message}</p>
              </CardContent>
            </Card>
          ))}

          {/* Custom Template Card */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-brand border-2 border-dashed"
            onClick={handleCustomTemplate}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[160px]">
              <Plus className="w-8 h-8 text-brand mb-2" />
              <h3 className="font-semibold text-warm-900 mb-1">Plantilla Personalizada</h3>
              <p className="text-sm text-warm-600 text-center">Crea tu propio mensaje desde cero</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => setStep('template')}>
          Cambiar Plantilla
        </Button>
        <h1 className="text-3xl font-bold text-warm-900 mt-4 mb-2">Personalizar Campaña</h1>
        <p className="text-warm-600">Ajusta el mensaje y el momento de envío</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Configuration */}
        <div className="space-y-6">
          {/* Campaign Name */}
          <Card>
            <CardHeader>
              <CardTitle>Nombre de la Campaña</CardTitle>
              <CardDescription>Para identificarla en tu lista</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Ej: Recordatorio 14 días inactivo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </CardContent>
          </Card>

          {/* Trigger Selection */}
          <Card>
            <CardHeader>
              <CardTitle>¿Cuándo enviar?</CardTitle>
              <CardDescription>Selecciona el momento de envío</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {TRIGGER_TYPES.map((triggerType) => (
                <div
                  key={triggerType.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    trigger?.type === triggerType.id
                      ? 'border-brand bg-brand-whisper'
                      : 'border-warm-200 hover:border-brand/50'
                  }`}
                  onClick={() => handleSelectTrigger(triggerType.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${trigger?.type === triggerType.id ? 'text-brand' : 'text-warm-600'}`}>
                      {triggerType.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-warm-900">{triggerType.name}</p>
                      <p className="text-sm text-warm-600 mt-0.5">{triggerType.description}</p>
                      {triggerType.hasValue && trigger?.type === triggerType.id && (
                        <Input
                          className="mt-3"
                          type="number"
                          label={triggerType.valueName}
                          placeholder="Ej: 7"
                          value={trigger.value || ''}
                          onChange={(e) => setTrigger({ ...trigger, value: parseInt(e.target.value) || 0 })}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Message Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Mensaje</CardTitle>
              <CardDescription>Escribe el mensaje que recibirán tus clientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <textarea
                  className="w-full px-4 py-3 text-base bg-white border-2 border-warm-200 rounded-lg focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand/10 transition-all duration-200 min-h-[160px]"
                  placeholder="Escribe tu mensaje aquí..."
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  maxLength={1600}
                />
                <p className="text-xs text-warm-500 mt-2">{messageTemplate.length}/1600 caracteres</p>
              </div>

              {/* Variable Chips */}
              <div>
                <p className="text-sm font-medium text-warm-700 mb-2">Insertar variable:</p>
                <div className="flex flex-wrap gap-2">
                  {VARIABLES.map((variable) => (
                    <button
                      key={variable.key}
                      onClick={() => handleInsertVariable(variable.key)}
                      className="px-3 py-1.5 text-xs font-mono bg-brand-whisper text-brand rounded-md hover:bg-brand-mist transition-colors"
                      title={variable.description}
                    >
                      {variable.key}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm">{error}</div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => handleSave('draft')}
              isLoading={createCampaign.isPending}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Guardar Borrador
            </Button>
            <Button
              variant="cta"
              className="flex-1"
              onClick={() => handleSave('active')}
              isLoading={createCampaign.isPending}
              leftIcon={<Send className="w-4 h-4" />}
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
                color: '#ffffff',
              }}
            >
              Activar Campaña
            </Button>
          </div>
        </div>

        {/* Right: Preview & Variables */}
        <div className="space-y-6">
          {/* Preview */}
          <Card key={`preview-${selectedTemplate}-${messageTemplate.substring(0, 20)}`}>
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
              <CardDescription>Así verá el cliente el mensaje</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-warm-50 rounded-lg p-4 border-2 border-warm-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center text-white flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warm-900 mb-1">{user?.user_metadata?.business_name || 'Tu Negocio'}</p>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-sm text-warm-900 whitespace-pre-wrap">
                        {previewMessage || 'Tu mensaje aparecerá aquí...'}
                      </p>
                    </div>
                    <p className="text-xs text-warm-500 mt-2">Ahora</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variables Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Variables Disponibles</CardTitle>
              <CardDescription>Haz clic para insertar en el mensaje</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {VARIABLES.map((variable) => (
                  <div key={variable.key} className="flex items-start gap-3 p-3 bg-warm-50 rounded-lg">
                    <code className="text-brand font-mono text-sm font-semibold">{variable.key}</code>
                    <div className="flex-1">
                      <p className="text-sm text-warm-900">{variable.description}</p>
                      <p className="text-xs text-warm-500 mt-0.5">Ejemplo: {variable.example}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
