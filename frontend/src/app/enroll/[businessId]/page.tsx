'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/design-system/primitives/Button/Button';
import { Input } from '@/design-system/primitives/Input/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/design-system/primitives/Card/Card';
import { Download, CheckCircle, AlertCircle, Loader2, Smartphone, ExternalLink, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';

interface Business {
  id: string;
  name: string;
  logo_url?: string;
  reward_structure: {
    stamps_required: number;
    reward_description: string;
  };
}

interface EnrollmentResponse {
  customer_id: string;
  stamps_count: number;
  qr_code_url: string;
}

export default function EnrollPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const businessId = params.businessId as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    countryCode: '+51',
    email: '',
    emailOptIn: true,
  });
  const [existingCustomer, setExistingCustomer] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [cardUrl, setCardUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchBusiness();
  }, [businessId]);

  async function fetchBusiness() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/businesses/${businessId}`);
      if (!res.ok) throw new Error('Negocio no encontrado');
      const data = await res.json();
      setBusiness(data); // API returns business data directly, not wrapped in data property
    } catch (err) {
      setError('No se pudo cargar la información del negocio');
    } finally {
      setLoading(false);
    }
  }

  async function checkExisting() {
    if (!formData.phone || formData.phone.length < 9) return;

    try {
      const fullPhone = formData.countryCode + formData.phone;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments/check?business_id=${businessId}&phone=${encodeURIComponent(fullPhone)}`
      );
      const data = await res.json();

      if (data.exists) {
        setExistingCustomer(true);
        setCustomerId(data.customer.id);
        setFormData(prev => ({ ...prev, name: data.customer.name }));
      }
    } catch (err) {
      console.error('Error checking existing customer:', err);
    }
  }

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setEnrolling(true);

    try {
      // Validate phone (9 digits)
      if (!/^\d{9}$/.test(formData.phone)) {
        throw new Error('El teléfono debe tener 9 dígitos');
      }

      const fullPhone = formData.countryCode + formData.phone;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          name: formData.name,
          phone: fullPhone,
          email: formData.email || undefined,
          email_opt_in: formData.emailOptIn,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Error al registrarse');
      }

      setCustomerId(data.data.customer_id);

      // Generate card URL
      const cardLink = `${window.location.origin}/card/${data.data.customer_id}`;
      setCardUrl(cardLink);

      // Generate QR code with customer ID
      const qrData = JSON.stringify({
        customer_id: data.data.customer_id,
        business_id: businessId,
      });

      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      setQrCodeDataUrl(qrUrl);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setEnrolling(false);
    }
  }

  async function handleRedownload() {
    setEnrolling(true);
    try {
      // Generate card URL
      const cardLink = `${window.location.origin}/card/${customerId}`;
      setCardUrl(cardLink);

      const qrData = JSON.stringify({
        customer_id: customerId,
        business_id: businessId,
      });

      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      setQrCodeDataUrl(qrUrl);
      setSuccess(true);
    } catch (err) {
      setError('Error al generar código QR');
    } finally {
      setEnrolling(false);
    }
  }

  function downloadQRCode() {
    const link = document.createElement('a');
    link.download = `${business?.name}-tarjeta-fidelidad.png`;
    link.href = qrCodeDataUrl;
    link.click();
  }

  async function copyCardUrl() {
    try {
      await navigator.clipboard.writeText(cardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-orange-50">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-orange-50 p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Negocio no encontrado</h2>
          <p className="text-gray-600">{error}</p>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          <Card className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Bienvenido a {business.name}!
            </h1>
            <p className="text-gray-600 mb-6">
              Tu tarjeta de fidelidad está lista
            </p>

            <div className="bg-white p-6 rounded-xl border-2 border-purple-200 mb-6">
              {qrCodeDataUrl && (
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  className="w-full max-w-xs mx-auto"
                />
              )}
            </div>

            <div className="space-y-3">
              {/* Primary action: View card */}
              <a
                href={cardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-purple-700 hover:to-purple-800 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Ver Mi Tarjeta
              </a>

              {/* Secondary actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={downloadQRCode} variant="secondary" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar QR
                </Button>

                <Button onClick={copyCardUrl} variant="secondary" className="w-full">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Link
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-900 font-medium mb-2">
                  💡 Cómo usar tu tarjeta:
                </p>
                <ol className="text-sm text-purple-800 space-y-1 text-left list-decimal list-inside">
                  <li>Guarda el link de tu tarjeta</li>
                  <li>Muestra tu QR al negocio para recibir sellos</li>
                  <li>Junta {business.reward_structure.stamps_required} sellos para tu recompensa</li>
                </ol>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                🎁 Recompensa: {business.reward_structure.reward_description}
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Business Header */}
        <Card className="p-6 mb-6 text-center">
          {business.logo_url && (
            <img
              src={business.logo_url}
              alt={business.name}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
            />
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {business.name}
          </h1>
          <p className="text-gray-600">
            Programa de Fidelidad
          </p>
        </Card>

        {/* Enrollment Form */}
        <Card className="p-6">
          {existingCustomer && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-900 text-sm font-medium mb-2">
                ¡Ya estás registrado!
              </p>
              <p className="text-blue-800 text-sm">
                Puedes volver a descargar tu tarjeta de fidelidad.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-900 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleEnroll} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Juan Pérez"
                required
                disabled={existingCustomer}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-24"
                  disabled={existingCustomer}
                >
                  <option value="+51">🇵🇪 +51</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+52">🇲🇽 +52</option>
                  <option value="+57">🇨🇴 +57</option>
                  <option value="+56">🇨🇱 +56</option>
                  <option value="+54">🇦🇷 +54</option>
                </select>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, phone: value });
                    setExistingCustomer(false);
                  }}
                  onBlur={checkExisting}
                  placeholder="912345678"
                  maxLength={9}
                  required
                  disabled={existingCustomer}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ingresa 9 dígitos
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (opcional)
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                disabled={existingCustomer}
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="emailOptIn"
                checked={formData.emailOptIn}
                onChange={(e) => setFormData({ ...formData, emailOptIn: e.target.checked })}
                className="mt-1"
                disabled={existingCustomer}
              />
              <label htmlFor="emailOptIn" className="text-sm text-gray-600">
                Acepto recibir promociones y actualizaciones por correo electrónico
              </label>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-purple-900 mb-2">
                🎁 Recompensa
              </p>
              <p className="text-sm text-purple-800">
                {business.reward_structure.reward_description}
              </p>
              <p className="text-xs text-purple-700 mt-2">
                Junta {business.reward_structure.stamps_required} sellos para obtenerla
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={enrolling}
              onClick={existingCustomer ? handleRedownload : undefined}
            >
              {enrolling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : existingCustomer ? (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Volver a Descargar Tarjeta
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 mr-2" />
                  Obtener Mi Tarjeta
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            🔒 Tus datos están seguros y solo se usan para el programa de fidelidad
          </p>
        </div>
      </div>
    </div>
  );
}
