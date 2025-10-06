'use client';

import { useState, useRef } from 'react';
import { Button } from '@/design-system/primitives/Button/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/design-system/primitives/Card/Card';
import type { CardDesign } from '@/lib/stores/onboarding-store';
import { useUploadImage } from '@/lib/hooks/useOnboarding';

interface DesignStepProps {
  initialDesign: CardDesign | null;
  rewardDescription: string;
  stampsRequired: number;
  businessName: string;
  onNext: (design: CardDesign) => void;
  onBack: () => void;
}

const CARD_TEMPLATES = [
  { id: 'modern', name: 'Moderno', gradient: true, primaryColor: '#A855F7', accentColor: '#F97316' },
  { id: 'classic', name: 'Clásico', gradient: false, primaryColor: '#3B82F6', accentColor: '#10B981' },
  { id: 'elegant', name: 'Elegante', gradient: true, primaryColor: '#8B5CF6', accentColor: '#EC4899' },
  { id: 'vibrant', name: 'Vibrante', gradient: true, primaryColor: '#EF4444', accentColor: '#F59E0B' },
  { id: 'minimal', name: 'Minimalista', gradient: false, primaryColor: '#6B7280', accentColor: '#1F2937' },
  { id: 'nature', name: 'Natural', gradient: true, primaryColor: '#10B981', accentColor: '#059669' },
];

export function DesignStep({
  initialDesign,
  rewardDescription,
  stampsRequired,
  businessName,
  onNext,
  onBack,
}: DesignStepProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(initialDesign?.template_id || 'modern');
  const [primaryColor, setPrimaryColor] = useState(initialDesign?.brand_color_primary || '#A855F7');
  const [accentColor, setAccentColor] = useState(initialDesign?.brand_color_accent || '#F97316');
  const [useGradient, setUseGradient] = useState(initialDesign?.use_gradient ?? true);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(initialDesign?.logo_url);
  const [backgroundUrl, setBackgroundUrl] = useState<string | undefined>(initialDesign?.background_image_url);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const uploadImageMutation = useUploadImage();

  const handleTemplateSelect = (template: typeof CARD_TEMPLATES[0]) => {
    setSelectedTemplate(template.id);
    setPrimaryColor(template.primaryColor);
    setAccentColor(template.accentColor);
    setUseGradient(template.gradient);
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'background') => {
    try {
      const result = await uploadImageMutation.mutateAsync({ file, type });
      if (type === 'logo') {
        setLogoUrl(result.url);
      } else {
        setBackgroundUrl(result.url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Error al subir imagen. Por favor intenta de nuevo.');
    }
  };

  const handleNext = () => {
    onNext({
      template_id: selectedTemplate,
      brand_color_primary: primaryColor,
      brand_color_accent: accentColor,
      use_gradient: useGradient,
      logo_url: logoUrl,
      background_image_url: backgroundUrl,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Diseña tu Tarjeta</h2>
        <p className="text-gray-600">Personaliza la apariencia de tu programa de fidelidad</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Configuration */}
        <div className="space-y-6">
          {/* Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Plantillas</CardTitle>
              <CardDescription>Elige un estilo base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {CARD_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTemplate === template.id
                        ? 'border-purple-500 shadow-lg'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div
                      className="h-16 rounded mb-2"
                      style={{
                        background: template.gradient
                          ? `linear-gradient(135deg, ${template.primaryColor}, ${template.accentColor})`
                          : template.primaryColor,
                      }}
                    />
                    <div className="text-sm font-medium">{template.name}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Colores de Marca</CardTitle>
              <CardDescription>Personaliza tu paleta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Color Principal</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-12 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Color Acento</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-12 h-12 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="use-gradient"
                  checked={useGradient}
                  onChange={(e) => setUseGradient(e.target.checked)}
                  className="w-4 h-4 accent-purple-500"
                />
                <label htmlFor="use-gradient" className="text-sm font-medium cursor-pointer">
                  Usar gradiente
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Imágenes</CardTitle>
              <CardDescription>Logo y fondo (opcional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Logo de tu Negocio</label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                  className="hidden"
                />
                <Button
                  onClick={() => logoInputRef.current?.click()}
                  variant="secondary"
                  className="w-full"
                  disabled={uploadImageMutation.isPending}
                >
                  {uploadImageMutation.isPending && uploadImageMutation.variables?.type === 'logo'
                    ? 'Subiendo...'
                    : logoUrl
                    ? 'Cambiar Logo'
                    : 'Subir Logo'}
                </Button>
                {logoUrl && (
                  <div className="mt-2 text-xs text-green-600">✓ Logo cargado</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Imagen de Fondo</label>
                <input
                  ref={backgroundInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'background')}
                  className="hidden"
                />
                <Button
                  onClick={() => backgroundInputRef.current?.click()}
                  variant="secondary"
                  className="w-full"
                  disabled={uploadImageMutation.isPending}
                >
                  {uploadImageMutation.isPending && uploadImageMutation.variables?.type === 'background'
                    ? 'Subiendo...'
                    : backgroundUrl
                    ? 'Cambiar Fondo'
                    : 'Subir Fondo'}
                </Button>
                {backgroundUrl && (
                  <div className="mt-2 text-xs text-green-600">✓ Fondo cargado</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Preview */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
              <CardDescription>Así verán tus clientes su tarjeta</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-2xl p-8 shadow-2xl aspect-[3/2] flex flex-col justify-between"
                style={
                  backgroundUrl
                    ? {
                        backgroundImage: `url(${backgroundUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : useGradient
                    ? {
                        background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                      }
                    : {
                        backgroundColor: primaryColor,
                      }
                }
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
                  ) : (
                    <div className="text-white font-bold text-xl">{businessName}</div>
                  )}
                  <div className="text-white/90 text-sm">Fidelidad</div>
                </div>

                {/* Stamps Grid */}
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: stampsRequired }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center"
                    >
                      <span className="text-white/60 text-xs">{i + 1}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="text-center">
                  <div className="text-white text-sm mb-1">Recompensa:</div>
                  <div className="text-white font-bold text-lg">{rewardDescription}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="secondary">
          ← Atrás
        </Button>
        <Button
          onClick={handleNext}
          className="bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white"
        >
          Continuar al QR →
        </Button>
      </div>
    </div>
  );
}
