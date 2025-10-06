'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/design-system/primitives/Card/Card';
import { Progress } from '@/design-system/primitives/Progress/Progress';
import { Badge } from '@/design-system/primitives/Badge/Badge';
import { Gift, Star, Calendar, Loader2, AlertCircle, Wallet, Download } from 'lucide-react';
import QRCode from 'qrcode';

interface Customer {
  id: string;
  name: string;
  phone: string;
  stamps_count: number;
  enrolled_at: string;
  last_stamp_at: string | null;
  total_rewards_earned: number;
}

interface CardDesign {
  template?: string;
  primaryColor?: string;
  accentColor?: string;
  useGradient?: boolean;
  logoUrl?: string;
  backgroundUrl?: string;
}

interface Business {
  id: string;
  name: string;
  logo_url?: string;
  background_image_url?: string;
  card_design?: CardDesign;
  brand_colors?: {
    primary: string;
    accent: string;
  };
  reward_structure: {
    stamps_required: number;
    reward_description: string;
  };
}

export default function LoyaltyCardPage() {
  const params = useParams();
  const customerId = params.customerId as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  async function fetchCustomerData() {
    try {
      // Fetch customer with business card_design
      const customerRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/customers/${customerId}`
      );
      if (!customerRes.ok) throw new Error('Cliente no encontrado');

      const data = await customerRes.json();
      setCustomer(data.data.customer);
      setBusiness(data.data.business);

      // Generate QR code with custom colors
      const qrData = JSON.stringify({
        customer_id: customerId,
        business_id: data.data.business.id,
      });

      const primaryColor = data.data.business.card_design?.primaryColor ||
                          data.data.business.brand_colors?.primary ||
                          '#9333EA';

      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: primaryColor,
          light: '#FFFFFF',
        },
      });

      setQrCodeDataUrl(qrUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadWalletPass() {
    // TODO: Implement when Apple Wallet backend is ready
    // GET /api/v1/customers/${customerId}/wallet
    alert('Funcionalidad de Apple Wallet estará disponible próximamente');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-orange-50">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !customer || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-orange-50 p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error || 'No se pudo cargar tu tarjeta'}</p>
        </Card>
      </div>
    );
  }

  const progress = (customer.stamps_count / business.reward_structure.stamps_required) * 100;
  const stampsUntilReward = business.reward_structure.stamps_required - customer.stamps_count;

  // Extract design from business
  const cardDesign = business.card_design || {};
  const primaryColor = cardDesign.primaryColor || business.brand_colors?.primary || '#9333EA';
  const accentColor = cardDesign.accentColor || business.brand_colors?.accent || '#F97316';
  const useGradient = cardDesign.useGradient ?? true;
  const logoUrl = business.logo_url || cardDesign.logoUrl;
  const backgroundUrl = business.background_image_url || cardDesign.backgroundUrl;

  // Card background style
  const cardBgStyle = backgroundUrl
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : useGradient
    ? {
        background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
      }
    : {
        backgroundColor: primaryColor,
      };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 p-4 pb-8">
      <div className="max-w-md mx-auto pt-8 space-y-6">
        {/* Main Loyalty Card with Business Branding */}
        <div
          className="rounded-2xl p-6 text-white shadow-2xl"
          style={cardBgStyle}
        >
          {/* Business Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt={business.name}
                  className="w-12 h-12 rounded-full object-cover bg-white"
                />
              )}
              <div>
                <h1 className="text-xl font-bold">{business.name}</h1>
                <p className="text-sm opacity-90">Tarjeta de Fidelidad</p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-6">
            <p className="text-2xl font-bold">{customer.name}</p>
            <p className="text-sm opacity-90">{customer.phone}</p>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progreso</span>
              <Badge
                variant={stampsUntilReward === 0 ? 'success' : 'neutral'}
                className="bg-white/20 text-white"
              >
                <Star className="w-3 h-3 mr-1" />
                {customer.stamps_count}/{business.reward_structure.stamps_required}
              </Badge>
            </div>

            <div className="bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {stampsUntilReward > 0 ? (
              <p className="text-sm">
                Te faltan <strong>{stampsUntilReward}</strong> {stampsUntilReward === 1 ? 'sello' : 'sellos'} para:{' '}
                <strong>{business.reward_structure.reward_description}</strong>
              </p>
            ) : (
              <div className="flex items-center gap-2 bg-white/20 p-3 rounded-lg">
                <Gift className="w-5 h-5" />
                <div>
                  <p className="font-semibold">¡Recompensa Desbloqueada!</p>
                  <p className="text-sm opacity-90">{business.reward_structure.reward_description}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Card */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Tu Código QR
          </h2>

          <div className="bg-white rounded-xl border-2 p-6 mb-4" style={{ borderColor: primaryColor }}>
            {qrCodeDataUrl && (
              <img
                src={qrCodeDataUrl}
                alt="QR Code de Fidelidad"
                className="w-full max-w-xs mx-auto"
              />
            )}
          </div>

          <p className="text-center text-sm text-gray-600 mb-4">
            Muestra este código al negocio para recibir sellos
          </p>

          {/* Apple Wallet Button (Prepared for future) */}
          <button
            onClick={handleDownloadWalletPass}
            className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={true}
          >
            <Wallet className="w-5 h-5" />
            Agregar a Apple Wallet
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Próximamente disponible
          </p>
        </Card>

        {/* Stamp Grid */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tus Sellos</h2>

          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: business.reward_structure.stamps_required }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-full flex items-center justify-center border-2 transition-all ${
                  i < customer.stamps_count
                    ? 'border-transparent shadow-md'
                    : 'bg-gray-100 border-gray-300'
                }`}
                style={
                  i < customer.stamps_count
                    ? {
                        background: useGradient
                          ? `linear-gradient(135deg, ${primaryColor}, ${accentColor})`
                          : primaryColor,
                      }
                    : {}
                }
              >
                {i < customer.stamps_count && (
                  <Star className="w-4 h-4 text-white fill-white" />
                )}
              </div>
            ))}
          </div>

          {customer.total_rewards_earned > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-900 font-medium text-center">
                🎁 Has canjeado {customer.total_rewards_earned} {customer.total_rewards_earned === 1 ? 'recompensa' : 'recompensas'}
              </p>
            </div>
          )}
        </Card>

        {/* Member Since */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Miembro desde{' '}
            {new Date(customer.enrolled_at).toLocaleDateString('es-PE', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
