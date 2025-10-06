'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/design-system/primitives/Card/Card';
import { Button } from '@/design-system/primitives/Button/Button';
import { Input } from '@/design-system/primitives/Input/Input';
import { ArrowLeft, Loader2, Copy, Check, QrCode, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import QRCodeLib from 'qrcode';
import { supabase } from '@/lib/supabase';

export default function NewScannerAccessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
  });
  const [accessUrl, setAccessUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Get Supabase session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authenticated session');
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/scanner-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Error al crear acceso');

      const data = await res.json();
      setAccessUrl(data.data.access_url);

      // Generate QR code
      const qr = await QRCodeLib.toDataURL(data.data.access_url, {
        width: 400,
        margin: 2,
        color: {
          dark: '#9333EA',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(qr);

      setSuccess(true);
    } catch (error) {
      console.error('Error creating token:', error);
      alert('Error al crear el acceso. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(accessUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  }

  function downloadQR() {
    const link = document.createElement('a');
    link.download = `scanner-access-${formData.name}.png`;
    link.href = qrCodeUrl;
    link.click();
  }

  if (success) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Acceso Creado!</h1>
              <p className="text-gray-600">Comparte este link o QR con tu equipo</p>
            </div>

            {/* QR Code */}
            <div className="bg-white p-6 rounded-xl border-2 border-purple-200 mb-6">
              <img src={qrCodeUrl} alt="QR Code" className="w-full max-w-sm mx-auto" />
            </div>

            {/* Access URL */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Link de Acceso</label>
              <div className="flex gap-2">
                <Input value={accessUrl} readOnly className="flex-1" />
                <Button onClick={copyLink} variant="secondary">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button onClick={downloadQR} variant="secondary">
                <QrCode className="w-4 h-4 mr-2" />
                Descargar QR
              </Button>
              <a
                href={accessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Probar Scanner
              </a>
            </div>

            {/* Info */}
            <div className="bg-purple-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-purple-900 font-medium mb-2">💡 Cómo compartir:</p>
              <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
                <li>Envía el link por WhatsApp o email</li>
                <li>Imprime el QR y colócalo en tu local</li>
                <li>Guarda el QR en la galería de tu equipo</li>
              </ul>
            </div>

            <Button onClick={() => router.push('/dashboard/scanner-access')} className="w-full">
              Volver a Accesos
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard/scanner-access">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Nuevo Acceso</h1>
          <p className="text-gray-600">Dale un nombre para identificar quién usará este acceso</p>
        </div>

        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Acceso *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Caja Principal, Mesero Juan, Sucursal Centro"
                required
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                Este nombre te ayudará a identificar el acceso en el dashboard
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-900 font-medium mb-2">ℹ️ Sobre este acceso:</p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Permite usar el scanner sin acceso al dashboard completo</li>
                <li>El link permanece activo hasta que lo desactives</li>
                <li>Puedes ver estadísticas de uso en tiempo real</li>
                <li>Se puede revocar en cualquier momento</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Acceso'
                )}
              </Button>
              <Link href="/dashboard/scanner-access" className="flex-1">
                <Button type="button" variant="secondary" className="w-full">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
