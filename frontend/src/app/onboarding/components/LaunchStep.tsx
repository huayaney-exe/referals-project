'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/design-system/primitives/Button/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/design-system/primitives/Card/Card';
import QRCode from 'qrcode';

interface LaunchStepProps {
  businessId: string;
  businessName: string;
  qrDownloaded: boolean;
  onComplete: (qrDownloaded: boolean) => void;
  onBack: () => void;
}

export function LaunchStep({ businessId, businessName, qrDownloaded, onComplete, onBack }: LaunchStepProps) {
  const [hasDownloaded, setHasDownloaded] = useState(qrDownloaded);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const enrollmentUrl = `${window.location.origin}/enroll/${businessId}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        enrollmentUrl,
        {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('QR generation error:', error);
        }
      );
    }
  }, [enrollmentUrl]);

  const downloadQR = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `${businessName.replace(/\s+/g, '-')}-qr-fidelidad.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();

    setHasDownloaded(true);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(enrollmentUrl);
    alert('¡URL copiada al portapapeles!');
  };

  const handleFinish = () => {
    onComplete(hasDownloaded);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Celebration Header */}
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
          ¡Todo Listo!
        </h2>
        <p className="text-xl text-gray-600">
          Tu programa de fidelidad está configurado y listo para usar
        </p>
      </div>

      {/* QR Code Section */}
      <Card className="border-2 border-purple-200">
        <CardHeader className="text-center">
          <CardTitle>Tu Código QR de Fidelidad</CardTitle>
          <CardDescription>Clientes escanearán este código para registrarse</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Canvas */}
          <div className="flex justify-center">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <canvas ref={canvasRef} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={downloadQR}
              className="bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white"
            >
              📥 Descargar QR
            </Button>
            <Button onClick={copyUrl} variant="secondary">
              🔗 Copiar URL
            </Button>
          </div>

          {hasDownloaded && (
            <div className="text-center text-sm text-green-600 font-medium">
              ✓ QR descargado correctamente
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-gradient-to-br from-purple-50 to-orange-50 border-purple-100">
        <CardHeader>
          <CardTitle>Próximos Pasos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="text-2xl">🖨️</div>
              <div>
                <div className="font-semibold mb-1">1. Imprime tu QR</div>
                <p className="text-sm text-gray-600">
                  Colócalo en tu mostrador, entrada, o punto de venta para que sea visible
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">📱</div>
              <div>
                <div className="font-semibold mb-1">2. Comparte en Redes</div>
                <p className="text-sm text-gray-600">
                  Usa la URL de inscripción en Instagram, Facebook, o WhatsApp para atraer clientes
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">🎯</div>
              <div>
                <div className="font-semibold mb-1">3. Crea tu Primera Campaña</div>
                <p className="text-sm text-gray-600">
                  Envía mensajes automáticos de bienvenida, recordatorios, y promociones
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Preview */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600 mt-1">Clientes Inscritos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600 mt-1">Sellos Dados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600 mt-1">Recompensas Canjeadas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="secondary">
          ← Atrás
        </Button>
        <Button
          onClick={handleFinish}
          className="bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white px-8 py-3 text-lg font-semibold"
        >
          Ir al Dashboard →
        </Button>
      </div>
    </div>
  );
}
