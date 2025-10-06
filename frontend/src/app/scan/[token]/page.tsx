'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card } from '@/design-system/primitives/Card/Card';
import { Button } from '@/design-system/primitives/Button/Button';
import { Camera, Plus, Minus, CheckCircle, XCircle, Loader2, Gift, AlertCircle } from 'lucide-react';

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

interface ValidationResult {
  is_valid: boolean;
  business_id: string;
  business_name: string;
  location_name: string | null;
}

export default function PublicScannerPage() {
  const params = useParams();
  const token = params.token as string;

  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [businessInfo, setBusinessInfo] = useState<ValidationResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [rewardsEarned, setRewardsEarned] = useState(0);
  const [requiredStamps, setRequiredStamps] = useState(10);

  useEffect(() => {
    validateToken();
  }, [token]);

  useEffect(() => {
    if (scanning && !scanner) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      html5QrcodeScanner.render(onScanSuccess, onScanFailure);
      setScanner(html5QrcodeScanner);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [scanning]);

  async function validateToken() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/scanner/validate/${token}`);
      const data = await res.json();

      if (res.ok && data.data.is_valid) {
        setTokenValid(true);
        setBusinessInfo(data.data);
        setScanning(true);
      } else {
        setTokenValid(false);
      }
    } catch (error) {
      console.error('Error validating token:', error);
      setTokenValid(false);
    }
  }

  async function onScanSuccess(decodedText: string) {
    try {
      const qrData = JSON.parse(decodedText);
      const { customer_id, business_id } = qrData;

      if (!customer_id || !business_id) {
        throw new Error('Código QR inválido');
      }

      // Stop scanning and clear camera
      setScanning(false);
      if (scanner) {
        await scanner.clear();
        setScanner(null);
      }

      // Fetch customer and business data
      const [customerRes, businessRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/customers/${customer_id}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/businesses/${business_id}`),
      ]);

      if (!customerRes.ok || !businessRes.ok) {
        throw new Error('Error al cargar datos del cliente');
      }

      const customerData = await customerRes.json();
      const businessData = await businessRes.json();

      // Verify customer belongs to same business as token
      if (business_id !== businessInfo?.business_id) {
        throw new Error('Este cliente no pertenece a este negocio');
      }

      setCustomer(customerData.data.customer);
      setBusiness(businessData); // Business API returns direct object
      setRequiredStamps(businessData.reward_structure?.stamps_required || 10);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al escanear código QR');
      setScanning(true);
    }
  }

  function onScanFailure(error: string) {
    // Silently ignore scan failures
  }

  function handleQuantityChange(delta: number) {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)));
  }

  async function handleConfirm() {
    if (!customer || !business) return;

    setProcessing(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/scanner/${token}/stamp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customer.id,
          quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Error al agregar sellos');
      }

      setRewardsEarned(data.data.rewards_earned || 0);
      setSuccess(true);

      // Reset after 3 seconds
      setTimeout(() => {
        setCustomer(null);
        setBusiness(null);
        setQuantity(1);
        setSuccess(false);
        setRewardsEarned(0);
        setScanning(true);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al confirmar venta');
    } finally {
      setProcessing(false);
    }
  }

  async function handleRedeem() {
    if (!customer) return;

    setProcessing(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/scanner/${token}/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customer.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Error al canjear recompensa');
      }

      setSuccess(true);

      // Reset after 3 seconds
      setTimeout(() => {
        setCustomer(null);
        setBusiness(null);
        setQuantity(1);
        setSuccess(false);
        setScanning(true);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al canjear recompensa');
    } finally {
      setProcessing(false);
    }
  }

  function handleCancel() {
    setCustomer(null);
    setBusiness(null);
    setQuantity(1);
    setError('');
    setScanning(true);
  }

  // Token validation loading/error states
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-orange-50">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-orange-50 p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso No Válido</h2>
          <p className="text-gray-600 mb-6">
            Este link de acceso ha expirado o fue desactivado. Por favor contacta al administrador del negocio.
          </p>
          <p className="text-xs text-gray-500">Powered by Seya</p>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          {rewardsEarned > 0 ? (
            <>
              <Gift className="w-20 h-20 text-green-500 mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡{rewardsEarned} Recompensa{rewardsEarned > 1 ? 's' : ''} Desbloqueada{rewardsEarned > 1 ? 's' : ''}!
              </h2>
              <p className="text-gray-600">El cliente ha completado su tarjeta de fidelidad</p>
            </>
          ) : (
            <>
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡{quantity} Sello{quantity > 1 ? 's' : ''} Agregado{quantity > 1 ? 's' : ''}!
              </h2>
              <p className="text-gray-600">Registrado exitosamente</p>
            </>
          )}
        </Card>
      </div>
    );
  }

  // Customer confirmation view
  if (customer && business) {
    const currentStamps = customer.stamps_count;
    const requiredStamps = business.reward_structure.stamps_required;
    const isCardComplete = currentStamps >= requiredStamps;
    const willCompleteCard = !isCardComplete && (currentStamps + quantity) >= requiredStamps;
    const afterStamps = Math.min(currentStamps + quantity, requiredStamps);
    const progress = (currentStamps / requiredStamps) * 100;
    const afterProgress = (afterStamps / requiredStamps) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          {/* Business Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{businessInfo?.business_name}</h1>
            {businessInfo?.location_name && (
              <p className="text-gray-600">📍 {businessInfo.location_name}</p>
            )}
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
              {isCardComplete ? 'Canjear Recompensa' : 'Registrar Venta'}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-900 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-700 mb-1">Cliente</p>
                <p className="font-semibold text-gray-900">{customer.name}</p>
                <p className="text-sm text-gray-600">{customer.phone}</p>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {isCardComplete ? 'Tarjeta Completa' : 'Progreso Actual'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {currentStamps}/{requiredStamps}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isCardComplete ? 'bg-green-500' : 'bg-purple-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {!isCardComplete && quantity > 0 && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-green-700">Después de confirmar</span>
                      <span className="text-sm text-green-600">
                        {afterStamps}/{requiredStamps}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${afterProgress}%` }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* STATE 1: Incomplete Card - Show Quantity Selector */}
              {!isCardComplete && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    Cantidad de Ventas
                  </label>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      onClick={() => handleQuantityChange(-1)}
                      variant="secondary"
                      disabled={quantity <= 1}
                      className="w-12 h-12"
                    >
                      <Minus className="w-5 h-5" />
                    </Button>

                    <div className="w-20 h-12 flex items-center justify-center border-2 border-purple-600 rounded-lg">
                      <span className="text-2xl font-bold text-purple-600">{quantity}</span>
                    </div>

                    <Button
                      onClick={() => handleQuantityChange(1)}
                      variant="secondary"
                      disabled={quantity >= 10}
                      className="w-12 h-12"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Máximo 10 ventas por transacción
                  </p>
                </div>
              )}

              {/* STATE 2: Card Complete - Show Reward Info */}
              {isCardComplete && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <p className="text-green-900 font-semibold text-center mb-1">
                    🎁 ¡Recompensa Lista para Canjear!
                  </p>
                  <p className="text-sm text-green-800 text-center">
                    {business.reward_structure.reward_description}
                  </p>
                </div>
              )}

              {/* STATE 3: Will Complete Card - Show Preview */}
              {willCompleteCard && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <p className="text-green-900 font-semibold text-center mb-1">
                    🎁 ¡Recompensa Desbloqueada!
                  </p>
                  <p className="text-sm text-green-800 text-center">
                    {business.reward_structure.reward_description}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <Button onClick={handleCancel} variant="secondary" disabled={processing}>
                  Cancelar
                </Button>

                {/* STATE 2: Card Complete - Redeem Button */}
                {isCardComplete ? (
                  <Button onClick={handleRedeem} disabled={processing}>
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Canjeando...
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4 mr-2" />
                        Canjear Recompensa
                      </>
                    )}
                  </Button>
                ) : (
                  /* STATE 1 & 3: Incomplete or Will Complete - Confirm Button */
                  <Button onClick={handleConfirm} disabled={processing}>
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : willCompleteCard ? (
                      <>Completar y Canjear</>
                    ) : (
                      <>Confirmar {quantity} Venta{quantity > 1 ? 's' : ''}</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Footer */}
          <p className="text-xs text-gray-500 text-center mt-4">Powered by Seya</p>
        </div>
      </div>
    );
  }

  // Scanner view
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Business Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{businessInfo?.business_name}</h1>
          {businessInfo?.location_name && (
            <p className="text-gray-600">📍 {businessInfo.location_name}</p>
          )}
        </div>

        <Card className="p-6">
          <div className="text-center mb-6">
            <Camera className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Escanear Tarjeta</h2>
            <p className="text-gray-600">Posiciona el código QR del cliente frente a la cámara</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-900 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div id="qr-reader" className="rounded-lg overflow-hidden" />

          <p className="text-xs text-gray-500 text-center mt-4">
            🔒 Asegúrate de tener permisos de cámara activados
          </p>
        </Card>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-4">Powered by Seya</p>
      </div>
    </div>
  );
}
