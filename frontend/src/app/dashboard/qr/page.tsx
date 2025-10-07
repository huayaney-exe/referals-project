'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useBusinessContext } from '@/hooks/useBusinessContext';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/design-system/primitives/Card/Card';
import { Button } from '@/design-system/primitives/Button/Button';
import { Download, Share2, QrCode as QrCodeIcon, CheckCircle2, XCircle } from 'lucide-react';
import QRCode from 'qrcode';

export default function QRCodePage() {
  const { user } = useAuth();
  const { businessId, business } = useBusinessContext();
  const businessName = business?.name || user?.user_metadata?.business_name || 'Tu Negocio';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [whatsappConnected, setWhatsappConnected] = useState<boolean | null>(null);

  // Generate enrollment URL
  const enrollmentUrl = `${window.location.origin}/enroll/${businessId}`;

  // Track page visit for completion detection
  useEffect(() => {
    async function trackVisit() {
      if (businessId) {
        try {
          const { error } = await supabase.rpc('track_qr_page_view', { p_business_id: businessId });
          if (error) {
            // Non-critical analytics error - log but don't block page
            console.warn('Page view tracking failed (non-critical):', error.message);
          }
        } catch (err) {
          // Fail silently - page should still work even if tracking fails
          console.warn('Page view tracking exception:', err);
        }
      }
    }
    trackVisit();
  }, [businessId]);

  useEffect(() => {
    if (canvasRef.current && businessId) {
      // Generate QR code
      QRCode.toCanvas(
        canvasRef.current,
        enrollmentUrl,
        {
          width: 300,
          margin: 2,
          color: {
            dark: '#1F2937', // warm-900
            light: '#FFFFFF',
          },
        },
        async (error) => {
          if (error) {
            console.error('QR generation error:', error);
          } else {
            setQrGenerated(true);

            // Upload QR to Supabase Storage if not already uploaded
            try {
              const { data: business } = await supabase
                .from('businesses')
                .select('qr_code_url')
                .eq('id', businessId)
                .single();

              if (!business?.qr_code_url && canvasRef.current) {
                // Convert canvas to blob
                canvasRef.current.toBlob(async (blob) => {
                  if (!blob) return;

                  const fileName = `qr-${businessId}.png`;
                  const filePath = `qr-codes/${fileName}`;

                  // Upload to storage
                  const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('business-assets')
                    .upload(filePath, blob, {
                      contentType: 'image/png',
                      upsert: true,
                    });

                  if (uploadError) {
                    console.error('Error uploading QR:', uploadError);
                    return;
                  }

                  // Get public URL
                  const { data: { publicUrl } } = supabase.storage
                    .from('business-assets')
                    .getPublicUrl(filePath);

                  // Update business with QR URL
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

  // Check WhatsApp connection status
  useEffect(() => {
    async function checkWhatsAppStatus() {
      try {
        // Get Supabase session token
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
  }, [businessId, user]);

  const handleDownload = async () => {
    if (!canvasRef.current || !qrGenerated) {
      alert('Espera a que el QR se genere completamente');
      return;
    }

    // Convert canvas to blob and download
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

      // Track download (triggers auto-completion via database trigger)
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
      // Fallback: copy to clipboard
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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-warm-900 mb-2">Código QR</h1>
        <p className="text-warm-600">Comparte este código para que tus clientes se inscriban</p>
      </div>

      {/* WhatsApp Status Banner */}
      {whatsappConnected !== null && (
        <div className={`mb-6 p-4 rounded-lg border-2 ${
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
                  : 'Configura WhatsApp en Ajustes para enviar mensajes automáticos'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Display */}
        <Card>
          <CardHeader>
            <CardTitle>Tu Código QR</CardTitle>
            <CardDescription>Los clientes escanean esto para inscribirse</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6">
              {/* QR Code */}
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

              {/* Business Name */}
              <div className="text-center">
                <p className="text-lg font-semibold text-warm-900">{businessName}</p>
                <p className="text-sm text-warm-600 mt-1">Programa de Lealtad</p>
              </div>

              {/* Action Buttons */}
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
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cómo Usar</CardTitle>
              <CardDescription>Instrucciones para inscribir clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 text-sm text-warm-700">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-whisper text-brand font-semibold flex items-center justify-center text-xs">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-warm-900">Imprime o muestra el QR</p>
                    <p className="text-warm-600 mt-1">
                      Descarga el código QR y pégalo en tu local, o muéstralo en tu tablet/celular
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-whisper text-brand font-semibold flex items-center justify-center text-xs">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-warm-900">Clientes escanean</p>
                    <p className="text-warm-600 mt-1">
                      Tus clientes usan la cámara de su celular para escanear el código
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-whisper text-brand font-semibold flex items-center justify-center text-xs">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-warm-900">Registro automático</p>
                    <p className="text-warm-600 mt-1">
                      El cliente ingresa su nombre y teléfono, y queda inscrito en tu programa
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enlace Directo</CardTitle>
              <CardDescription>También puedes compartir por WhatsApp o redes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-warm-50 rounded-lg border-2 border-warm-200 break-all text-sm text-warm-700 font-mono">
                {enrollmentUrl}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full"
                onClick={async () => {
                  await navigator.clipboard.writeText(enrollmentUrl);
                  alert('Enlace copiado');
                }}
              >
                Copiar enlace
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
