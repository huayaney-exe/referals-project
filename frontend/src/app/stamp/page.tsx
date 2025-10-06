'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Badge, Progress } from '@/components/ui';
import { QRScanner } from '@/components/QRScanner';
import {
  Star,
  CheckCircle,
  AlertCircle,
  Loader2,
  LogOut,
  Gift,
  ArrowLeft,
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  stamps_count: number;
}

interface Business {
  id: string;
  name: string;
  reward_structure: {
    stamps_required: number;
    reward_description: string;
  };
}

interface StampResult {
  stamps_count: number;
  reward_unlocked: boolean;
}

export default function StampPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [stamping, setStamping] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [rewardUnlocked, setRewardUnlocked] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login?redirect=/stamp');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Session expired');
      }

      setIsAuthenticated(true);
    } catch (err) {
      localStorage.removeItem('auth_token');
      router.push('/login?redirect=/stamp');
    } finally {
      setLoading(false);
    }
  }

  async function handleScan(decodedText: string) {
    if (stamping || success) return;

    setError('');
    setSuccess(false);
    setStamping(true);

    try {
      // Parse QR code data
      const qrData = JSON.parse(decodedText);
      const { customer_id, business_id } = qrData;

      if (!customer_id || !business_id) {
        throw new Error('Código QR inválido');
      }

      // Fetch customer details
      const customerRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/customers/${customer_id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (!customerRes.ok) {
        throw new Error('Cliente no encontrado');
      }

      const customerData = await customerRes.json();
      setCustomer(customerData.data.customer); // Customer API returns { data: { customer, business } }

      // Fetch business details
      const businessRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/businesses/${business_id}`
      );
      const businessData = await businessRes.json();
      setBusiness(businessData); // Business API returns business object directly
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al escanear código QR');
      setCustomer(null);
      setBusiness(null);
    } finally {
      setStamping(false);
    }
  }

  async function handleAddStamp() {
    if (!customer || !business) return;

    setError('');
    setStamping(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/stamps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          'Idempotency-Key': `stamp-${customer.id}-${Date.now()}`,
        },
        body: JSON.stringify({
          customer_id: customer.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Error al agregar sello');
      }

      const result: StampResult = data.data;
      setRewardUnlocked(result.reward_unlocked);
      setSuccess(true);

      // Update customer stamps count
      setCustomer({
        ...customer,
        stamps_count: result.stamps_count,
      });

      // Reset after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setRewardUnlocked(false);
        setCustomer(null);
        setBusiness(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar sello');
    } finally {
      setStamping(false);
    }
  }

  function handleReset() {
    setCustomer(null);
    setBusiness(null);
    setSuccess(false);
    setRewardUnlocked(false);
    setError('');
  }

  function handleLogout() {
    localStorage.removeItem('auth_token');
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-orange-50">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 p-4 pb-8">
      <div className="max-w-md mx-auto pt-8 space-y-6">
        {/* Header */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Agregar Sello</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </Card>

        {/* Scanner or Customer Details */}
        {!customer ? (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Escanea el código QR del cliente
            </h2>
            <QRScanner onScan={handleScan} onError={setError} />
            {stamping && (
              <div className="mt-4 flex items-center justify-center gap-2 text-purple-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Procesando...</span>
              </div>
            )}
          </Card>
        ) : (
          <>
            {/* Customer Info */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Cliente</h2>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="text-lg font-medium text-gray-900">{customer.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="text-base text-gray-900">{customer.phone}</p>
                </div>

                {business && (
                  <>
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">Progreso</p>
                        <Badge>
                          <Star className="w-3 h-3 mr-1" />
                          {customer.stamps_count}/{business.reward_structure.stamps_required}
                        </Badge>
                      </div>
                      <Progress
                        value={
                          (customer.stamps_count / business.reward_structure.stamps_required) * 100
                        }
                      />
                    </div>

                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-purple-900 mb-1">Recompensa</p>
                      <p className="text-sm text-purple-800">
                        {business.reward_structure.reward_description}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Success Message */}
            {success && (
              <Card className="p-6 bg-green-50 border-green-200">
                <div className="text-center">
                  {rewardUnlocked ? (
                    <>
                      <Gift className="w-16 h-16 text-green-600 mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-green-900 mb-2">
                        ¡Recompensa Desbloqueada!
                      </h3>
                      <p className="text-green-800 mb-2">
                        {business?.reward_structure.reward_description}
                      </p>
                      <p className="text-sm text-green-700">
                        El cliente puede reclamar su recompensa ahora
                      </p>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-green-900 mb-2">
                        ¡Sello Agregado!
                      </h3>
                      <p className="text-green-800">
                        {customer.stamps_count} de {business?.reward_structure.stamps_required}{' '}
                        sellos
                      </p>
                    </>
                  )}
                </div>
              </Card>
            )}

            {/* Error Message */}
            {error && (
              <Card className="p-4 bg-red-50 border-red-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-900">{error}</p>
                </div>
              </Card>
            )}

            {/* Add Stamp Button */}
            {!success && (
              <Button
                onClick={handleAddStamp}
                disabled={stamping}
                className="w-full"
                size="lg"
              >
                {stamping ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Agregando Sello...
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5 mr-2" />
                    Agregar Sello
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
