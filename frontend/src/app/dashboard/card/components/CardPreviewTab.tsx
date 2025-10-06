'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useBusiness } from '@/lib/hooks/useBusiness';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/design-system/primitives/Card/Card';
import { Button } from '@/design-system/primitives/Button/Button';
import { Download, Share2, QrCode as QrCodeIcon, CheckCircle2, XCircle } from 'lucide-react';
import QRCode from 'qrcode';

export function CardPreviewTab() {
  const { user } = useAuth();
  const businessId = user?.user_metadata?.business_id;
  const businessName = user?.user_metadata?.business_name || 'Tu Negocio';

  const { data: business, isLoading: loadingBusiness } = useBusiness(businessId || '');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [whatsappConnected, setWhatsappConnected] = useState<boolean | null>(null);

  const enrollmentUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/enroll/${businessId}`;

  // Extract business info with defaults
  const brandColors = business?.brand_colors || { primary: '#A855F7', accent: '#F97316' };
  const gradientColors = {
    primary: brandColors.primary || '#A855F7',
    secondary: brandColors.accent || '#F97316'
  };
  const rewardStructure = business?.reward_structure || { stamps_required: 10, reward_description: '1 producto gratis' };

  // Track page visit
  useEffect(() => {
    async function trackVisit() {
      if (businessId) {
        try {
          await supabase.rpc('track_qr_page_view', { p_business_id: businessId });
        } catch (err) {
          console.warn('Page view tracking exception:', err);
        }
      }
    }
    trackVisit();
  }, [businessId]);

  // Generate QR code
  useEffect(() => {
    if (canvasRef.current && businessId) {
      QRCode.toCanvas(
        canvasRef.current,
        enrollmentUrl,
        {
          width: 300,
          margin: 2,
          color: {
            dark: '#1F2937',
            light: '#FFFFFF',
          },
        },
        async (error) => {
          if (error) {
            console.error('QR generation error:', error);
          } else {
            setQrGenerated(true);

            // Upload QR to storage if needed
            try {
              const { data: biz } = await supabase
                .from('businesses')
                .select('qr_code_url')
                .eq('id', businessId)
                .single();

              if (!biz?.qr_code_url && canvasRef.current) {
                canvasRef.current.toBlob(async (blob) => {
                  if (!blob) return;

                  const fileName = `qr-${businessId}.png`;
                  const filePath = `qr-codes/${fileName}`;

                  const { error: uploadError } = await supabase.storage
                    .from('business-assets')
                    .upload(filePath, blob, {
                      contentType: 'image/png',
                      upsert: true,
                    });

                  if (uploadError) {
                    console.error('Error uploading QR:', uploadError);
                    return;
                  }

                  const { data: { publicUrl } } = supabase.storage
                    .from('business-assets')
                    .getPublicUrl(filePath);

                  await supabase
                    .from('businesses')
                    .update({ qr_code_url: publicUrl })
                    .eq('id', businessId);
                }, 'image/png');
              }
            } catch (error) {
              console.error('Error managing QR code:', error);
            }
          }
        }
      );
    }
  }, [businessId, enrollmentUrl]);

  // Check WhatsApp status
  useEffect(() => {
    async function checkWhatsAppStatus() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          setWhatsappConnected(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/whatsapp/status/${businessId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setWhatsappConnected(data.connected || false);
        }
      } catch (error) {
        console.error('Error checking WhatsApp status:', error);
        setWhatsappConnected(false);
      }
    }

    if (businessId) {
      checkWhatsAppStatus();
    }
  }, [businessId]);

  const handleDownload = async () => {
    if (!canvasRef.current || !qrGenerated) {
      alert('Espera a que el QR se genere completamente');
      return;
    }

    canvasRef.current.toBlob(async (blob) => {
      if (!blob) {
        alert('Error al generar la imagen');
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-${businessName.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      try {
        await supabase
          .from('businesses')
          .update({ qr_downloaded: true })
          .eq('id', businessId);
      } catch (error) {
        console.error('Error tracking download:', error);
      }
    }, 'image/png');
  };

  const handleShare = async () => {
    if (!navigator.share) {
      await navigator.clipboard.writeText(enrollmentUrl);
      alert('Enlace copiado al portapapeles');
      return;
    }

    try {
      await navigator.share({
        title: `Únete al programa de lealtad de ${businessName}`,
        text: `Escanea este código QR para unirte al programa de lealtad`,
        url: enrollmentUrl,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loadingBusiness) {
    return (
      <div className="text-center py-12">
        <p className="text-warm-600">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* WhatsApp Status Banner */}
      {whatsappConnected !== null && (
        <div className={`p-4 rounded-lg border-2 ${
          whatsappConnected
            ? 'bg-success/10 border-success/20'
            : 'bg-warning/10 border-warning/20'
        }`}>
          <div className="flex items-start gap-3">
            {whatsappConnected ? (
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`font-medium ${whatsappConnected ? 'text-success-dark' : 'text-warning-dark'}`}>
                {whatsappConnected ? 'WhatsApp Conectado' : 'WhatsApp No Conectado'}
              </p>
              <p className="text-sm text-warm-600 mt-1">
                {whatsappConnected
                  ? 'Los clientes recibirán mensajes de WhatsApp automáticamente'
                  : 'Configura WhatsApp en Configuración para enviar mensajes automáticos'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa de Tarjeta</CardTitle>
            <CardDescription>Así ven tu tarjeta los clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="w-full rounded-xl p-6 text-white shadow-lg min-h-[280px]"
              style={{
                background: `linear-gradient(135deg, ${gradientColors.primary}, ${gradientColors.secondary})`,
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
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card>
          <CardHeader>
            <CardTitle>Código QR de Inscripción</CardTitle>
            <CardDescription>Comparte este QR para inscribir clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="p-6 bg-white rounded-lg border-2 border-warm-200">
                <canvas
                  ref={canvasRef}
                  className={qrGenerated ? '' : 'opacity-0'}
                />
                {!qrGenerated && (
                  <div className="w-[300px] h-[300px] flex items-center justify-center">
                    <QrCodeIcon className="w-12 h-12 text-warm-300 animate-pulse" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 w-full">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={handleDownload}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Descargar
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleShare}
                  leftIcon={<Share2 className="w-4 h-4" />}
                >
                  Compartir
                </Button>
              </div>

              <div className="w-full p-3 bg-warm-50 rounded-lg border border-warm-200">
                <p className="text-xs text-warm-600 mb-1">Enlace directo:</p>
                <div className="text-xs text-warm-700 font-mono break-all">
                  {enrollmentUrl}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={async () => {
                    await navigator.clipboard.writeText(enrollmentUrl);
                    alert('Enlace copiado');
                  }}
                >
                  Copiar enlace
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Cómo Inscribir Clientes</CardTitle>
          <CardDescription>Pasos para compartir tu tarjeta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-whisper text-brand font-semibold flex items-center justify-center">
                1
              </span>
              <div>
                <p className="font-medium text-warm-900 mb-1">Comparte tu QR</p>
                <p className="text-sm text-warm-600">
                  Descarga e imprime el QR, o muéstralo en tu tablet/celular
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-whisper text-brand font-semibold flex items-center justify-center">
                2
              </span>
              <div>
                <p className="font-medium text-warm-900 mb-1">Cliente escanea</p>
                <p className="text-sm text-warm-600">
                  El cliente usa la cámara de su celular para escanear
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-whisper text-brand font-semibold flex items-center justify-center">
                3
              </span>
              <div>
                <p className="font-medium text-warm-900 mb-1">Registro automático</p>
                <p className="text-sm text-warm-600">
                  El cliente ingresa su info y queda inscrito
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
