'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useBusinessContext } from '@/hooks/useBusinessContext';
import { supabase } from '@/lib/supabase';
import { useBusiness } from '@/lib/hooks/useBusiness';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/design-system/primitives/Card/Card';
import { Button } from '@/design-system/primitives/Button/Button';
import { Input } from '@/design-system/primitives/Input/Input';
import { Save, Palette, Award } from 'lucide-react';

export function CardDesignTab() {
  const { user } = useAuth();
  const { businessId } = useBusinessContext();

  const { data: business, isLoading, refetch } = useBusiness(businessId || '');

  const [brandColors, setBrandColors] = useState({ primary: '#A855F7', accent: '#F97316' });
  const [rewardStructure, setRewardStructure] = useState({
    stamps_required: 10,
    reward_description: '1 producto gratis'
  });
  const [saving, setSaving] = useState(false);

  // Load business data
  useEffect(() => {
    if (business) {
      setBrandColors(business.brand_colors || { primary: '#A855F7', accent: '#F97316' });
      setRewardStructure(business.reward_structure || {
        stamps_required: 10,
        reward_description: '1 producto gratis'
      });
    }
  }, [business]);

  const handleSave = async () => {
    if (!businessId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          brand_colors: brandColors,
          reward_structure: rewardStructure,
        })
        .eq('id', businessId);

      if (error) throw error;

      alert('✅ Diseño guardado exitosamente');
      refetch();
    } catch (error) {
      console.error('Error saving design:', error);
      alert('❌ Error al guardar diseño');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-warm-600">Cargando diseño...</p>
      </div>
    );
  }

  const businessName = business?.name || 'Mi Negocio';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Design Controls */}
      <div className="space-y-6">
        {/* Colors */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-brand" />
              <CardTitle>Colores de Marca</CardTitle>
            </div>
            <CardDescription>Personaliza los colores de tu tarjeta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-900 mb-2">
                Color Primario
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={brandColors.primary}
                  onChange={(e) => setBrandColors({ ...brandColors, primary: e.target.value })}
                  className="w-16 h-16 rounded-lg border-2 border-warm-200 cursor-pointer"
                />
                <Input
                  value={brandColors.primary}
                  onChange={(e) => setBrandColors({ ...brandColors, primary: e.target.value })}
                  placeholder="#A855F7"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-900 mb-2">
                Color Secundario
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={brandColors.accent}
                  onChange={(e) => setBrandColors({ ...brandColors, accent: e.target.value })}
                  className="w-16 h-16 rounded-lg border-2 border-warm-200 cursor-pointer"
                />
                <Input
                  value={brandColors.accent}
                  onChange={(e) => setBrandColors({ ...brandColors, accent: e.target.value })}
                  placeholder="#F97316"
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rewards */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-brand" />
              <CardTitle>Estructura de Recompensas</CardTitle>
            </div>
            <CardDescription>Define cuántos sellos y qué premio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-900 mb-2">
                Sellos Requeridos
              </label>
              <Input
                type="number"
                min={1}
                max={50}
                value={rewardStructure.stamps_required}
                onChange={(e) =>
                  setRewardStructure({
                    ...rewardStructure,
                    stamps_required: parseInt(e.target.value) || 10,
                  })
                }
              />
              <p className="text-xs text-warm-600 mt-1">
                ¿Cuántos sellos necesita el cliente para su premio?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-900 mb-2">
                Descripción del Premio
              </label>
              <Input
                value={rewardStructure.reward_description}
                onChange={(e) =>
                  setRewardStructure({
                    ...rewardStructure,
                    reward_description: e.target.value,
                  })
                }
                placeholder="Ej: 1 café gratis"
              />
              <p className="text-xs text-warm-600 mt-1">
                Qué recibe el cliente al completar su tarjeta
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSave}
          isLoading={saving}
          leftIcon={<Save className="w-5 h-5" />}
        >
          Guardar Cambios
        </Button>
      </div>

      {/* Live Preview */}
      <div className="lg:sticky lg:top-8">
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa en Vivo</CardTitle>
            <CardDescription>Los cambios se reflejan al instante</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="w-full rounded-xl p-6 text-white shadow-lg min-h-[320px]"
              style={{
                background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.accent})`,
              }}
            >
              {business?.logo_url && (
                <img src={business.logo_url} alt={businessName} className="h-8 mb-3 object-contain" />
              )}
              <h3 className="font-bold text-2xl mb-2">{businessName}</h3>
              <div className="text-sm opacity-90 mb-4">Tarjeta de Fidelidad</div>

              <div className="flex gap-1.5 mb-4 flex-wrap">
                {Array.from({ length: rewardStructure.stamps_required }).map((_, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-xs opacity-75">{i + 1}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-xs opacity-75 mb-1">Premio al completar:</p>
                <p className="text-base font-semibold">{rewardStructure.reward_description}</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-brand-whisper rounded-lg">
              <p className="text-xs text-warm-700">
                💡 <strong>Tip:</strong> Usa colores que representen tu marca y selecciona un premio atractivo para tus clientes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
