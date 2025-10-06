'use client';

import { useState } from 'react';
import { Button } from '@/design-system/primitives/Button/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/design-system/primitives/Card/Card';
import { Input } from '@/design-system/primitives/Input/Input';
import type { RewardConfig } from '@/lib/stores/onboarding-store';

interface RewardStepProps {
  initialConfig: RewardConfig | null;
  onNext: (config: RewardConfig) => void;
  onBack: () => void;
}

const REWARD_TEMPLATES = [
  { id: 'coffee', stamps: 10, reward: '1 café gratis', icon: '☕', category: 'Cafetería' },
  { id: 'discount', stamps: 5, reward: '10% de descuento', icon: '🎫', category: 'Retail' },
  { id: 'free-item', stamps: 8, reward: '1 producto gratis', icon: '🎁', category: 'General' },
  { id: 'meal', stamps: 12, reward: '1 comida gratis', icon: '🍽️', category: 'Restaurante' },
  { id: 'service', stamps: 6, reward: '1 servicio gratis', icon: '✨', category: 'Servicios' },
  { id: 'custom', stamps: 10, reward: '', icon: '⚙️', category: 'Personalizado' },
];

export function RewardStep({ initialConfig, onNext, onBack }: RewardStepProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    initialConfig?.template_used || 'coffee'
  );
  const [stampsRequired, setStampsRequired] = useState<number>(
    initialConfig?.stamps_required || 10
  );
  const [rewardDescription, setRewardDescription] = useState<string>(
    initialConfig?.reward_description || ''
  );

  const handleTemplateSelect = (template: typeof REWARD_TEMPLATES[0]) => {
    setSelectedTemplate(template.id);
    setStampsRequired(template.stamps);
    if (template.reward) {
      setRewardDescription(template.reward);
    }
  };

  const handleNext = () => {
    if (!rewardDescription.trim()) {
      alert('Por favor describe la recompensa');
      return;
    }

    onNext({
      stamps_required: stampsRequired,
      reward_description: rewardDescription.trim(),
      template_used: selectedTemplate,
    });
  };

  const isValid = rewardDescription.trim().length > 0 && stampsRequired >= 3 && stampsRequired <= 20;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Define tu Recompensa</h2>
        <p className="text-gray-600">Elige una plantilla o crea tu propia estructura de fidelidad</p>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {REWARD_TEMPLATES.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? 'border-purple-500 shadow-lg ring-2 ring-purple-200'
                : 'border-gray-200 hover:border-purple-300'
            }`}
            onClick={() => handleTemplateSelect(template)}
          >
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-2">{template.icon}</div>
              <div className="text-sm text-gray-500 mb-1">{template.category}</div>
              <div className="font-semibold text-purple-600 mb-1">{template.stamps} sellos</div>
              <div className="text-sm text-gray-700">{template.reward || 'Personalizado'}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Recompensa</CardTitle>
          <CardDescription>Ajusta los detalles de tu programa de fidelidad</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stamps Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Sellos Requeridos: <span className="text-purple-600 font-bold">{stampsRequired}</span>
            </label>
            <input
              type="range"
              min="3"
              max="20"
              value={stampsRequired}
              onChange={(e) => setStampsRequired(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>3 sellos (rápido)</span>
              <span>20 sellos (premium)</span>
            </div>
          </div>

          {/* Reward Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción de la Recompensa
            </label>
            <Input
              type="text"
              value={rewardDescription}
              onChange={(e) => setRewardDescription(e.target.value)}
              placeholder="Ej: 1 café gratis, 10% descuento, producto gratis..."
              className="w-full"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {rewardDescription.length}/100 caracteres
            </p>
          </div>

          {/* Preview */}
          <Card className="bg-gradient-to-br from-purple-50 to-orange-50 border-purple-200">
            <CardContent className="pt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</div>
              <div className="text-center py-4">
                <div className="text-2xl mb-2">
                  {REWARD_TEMPLATES.find((t) => t.id === selectedTemplate)?.icon || '🎁'}
                </div>
                <div className="font-bold text-lg text-purple-600">
                  Completa {stampsRequired} sellos
                </div>
                <div className="text-gray-700 mt-1">
                  y recibe: <span className="font-semibold">{rewardDescription || '...'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="secondary">
          ← Atrás
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isValid}
          className="bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white"
        >
          Continuar al Diseño →
        </Button>
      </div>
    </div>
  );
}
