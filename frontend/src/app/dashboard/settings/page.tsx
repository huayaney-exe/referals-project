'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useBusinessContext } from '@/hooks/useBusinessContext';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/design-system/primitives/Card/Card';
import { Button } from '@/design-system/primitives/Button/Button';
import { Input } from '@/design-system/primitives/Input/Input';
import { Building2, Settings as SettingsIcon, MessageCircle, Save, RefreshCw } from 'lucide-react';
import { Badge } from '@/design-system/primitives/Badge/Badge';

interface BusinessSettings {
  name: string;
  email: string;
  phone?: string;
  category?: string;
  logo_url?: string;
  reward_structure: {
    stamps_required: number;
    reward_description: string;
  };
}

interface WhatsAppStatus {
  connected: boolean;
  instance_name?: string;
  qr_code?: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { businessId, business, isLoading: loadingBusinessContext } = useBusinessContext();

  // Business profile state
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    name: '',
    email: '',
    reward_structure: {
      stamps_required: 10,
      reward_description: 'Recompensa por 10 sellos',
    },
  });
  const [saving, setSaving] = useState(false);
  const [loadingBusiness, setLoadingBusiness] = useState(true);

  // WhatsApp state
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus | null>(null);
  const [loadingWhatsApp, setLoadingWhatsApp] = useState(true);
  const [refreshingQR, setRefreshingQR] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testCooldown, setTestCooldown] = useState<number>(0);

  // Fetch business settings
  useEffect(() => {
    async function fetchBusinessSettings() {
      if (!businessId) {
        // CRITICAL FIX: Set loading to false even when businessId is null
        // This prevents infinite loading state when useBusinessContext fails
        setLoadingBusiness(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/businesses/${businessId}`);
        if (response.ok) {
          const data = await response.json();
          setBusinessSettings(data);
        }
      } catch (error) {
        console.error('Error fetching business settings:', error);
      } finally {
        setLoadingBusiness(false);
      }
    }

    fetchBusinessSettings();
  }, [businessId]);

  // Fetch WhatsApp status
  useEffect(() => {
    async function fetchWhatsAppStatus() {
      if (!businessId || !user) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          setLoadingWhatsApp(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/whatsapp/status/${businessId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setWhatsappStatus(data);
        }
      } catch (error) {
        console.error('Error fetching WhatsApp status:', error);
      } finally {
        setLoadingWhatsApp(false);
      }
    }

    fetchWhatsAppStatus();
  }, [businessId, user]);

  // Poll WhatsApp status when QR is visible or connecting
  // TODO: Replace with WebSocket/SSE for production (more efficient than polling)
  // For Beta MVP, 3s polling is acceptable for quick time-to-market
  useEffect(() => {
    if (!businessId || !user) return;

    // Poll if: QR code is visible OR status is connecting OR not connected
    const shouldPoll = whatsappStatus?.qr_code || !whatsappStatus?.connected;

    if (!shouldPoll) return;

    const pollInterval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          // Session expired - stop polling
          clearInterval(pollInterval);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/whatsapp/status/${businessId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setWhatsappStatus(data);

          // Stop polling if connected
          if (data.connected) {
            clearInterval(pollInterval);
          }
        } else if (response.status === 401) {
          // Unauthorized - session expired, stop polling
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Error polling WhatsApp status:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [businessId, user, whatsappStatus?.qr_code, whatsappStatus?.connected]);

  const handleSaveBusinessSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/businesses/${businessId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessSettings),
      });

      if (response.ok) {
        alert('Configuración guardada exitosamente');
      } else {
        throw new Error('Error al guardar configuración');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const validatePhone = (phone: string): { valid: boolean; formatted?: string; error?: string } => {
    if (!phone || phone.trim() === '') {
      return { valid: false, error: 'El número de teléfono es requerido' };
    }

    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');

    // Check if it's 9 digits (Peru format without country code)
    if (digitsOnly.length === 9) {
      // Must start with 9 (Peru mobile prefix)
      if (!digitsOnly.startsWith('9')) {
        return {
          valid: false,
          error: 'El número móvil debe comenzar con 9'
        };
      }
      return { valid: true, formatted: `+51${digitsOnly}` };
    }

    // Check if it already has country code +51
    if (digitsOnly.length === 11 && digitsOnly.startsWith('51')) {
      // Must start with 519 (country code + mobile prefix)
      if (!digitsOnly.startsWith('519')) {
        return {
          valid: false,
          error: 'El número móvil debe comenzar con 9'
        };
      }
      return { valid: true, formatted: `+${digitsOnly}` };
    }

    return {
      valid: false,
      error: 'El número debe tener 9 dígitos (formato Perú)'
    };
  };

  const maskPhone = (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length >= 9) {
      const lastDigits = digitsOnly.slice(-4);
      return `+51 XXX XXX ${lastDigits}`;
    }
    return phone;
  };

  // Cooldown timer effect
  useEffect(() => {
    if (testCooldown > 0) {
      const timer = setInterval(() => {
        setTestCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testCooldown]);

  const handleTestWhatsApp = async () => {
    setTestingConnection(true);
    setTestResult(null);

    try {
      // Validate phone
      const validation = validatePhone(businessSettings.phone || '');
      if (!validation.valid) {
        setTestResult({ success: false, message: validation.error || 'Número inválido' });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setTestResult({ success: false, message: 'Sesión expirada. Inicia sesión nuevamente.' });
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/whatsapp/test-connection`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          phone: validation.formatted,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult({
          success: true,
          message: `¡Mensaje enviado exitosamente a ${maskPhone(validation.formatted!)}!`
        });
        // Set 5-minute cooldown
        setTestCooldown(300);
      } else if (response.status === 429) {
        // Rate limited
        const retryAfter = data.retryAfter || 300;
        setTestCooldown(retryAfter);
        setTestResult({
          success: false,
          message: data.error || 'Por favor espera antes de enviar otro mensaje de prueba.'
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Error al enviar mensaje de prueba'
        });
      }
    } catch (error) {
      console.error('Error testing WhatsApp:', error);
      setTestResult({
        success: false,
        message: 'Error al conectar con el servidor'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleRefreshQR = async () => {
    // Prevent generating QR if already connected
    if (whatsappStatus?.connected) {
      setQrError('WhatsApp ya está conectado. Desconecta primero para volver a conectar.');
      return;
    }

    setRefreshingQR(true);
    setQrError(null); // Clear previous errors

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setQrError('Sesión expirada. Por favor inicia sesión nuevamente.');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/whatsapp/qr/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWhatsappStatus(data);
      } else {
        const errorData = await response.json().catch(() => ({}));

        // Show user-friendly error messages
        if (response.status === 503) {
          setQrError('El servicio de WhatsApp no está disponible temporalmente. Por favor, intenta de nuevo en unos minutos.');
        } else if (response.status === 500) {
          setQrError('Error al generar código QR. Contacta a soporte si el problema persiste.');
        } else {
          setQrError(errorData.error?.message || 'Error al generar código QR de WhatsApp');
        }
      }
    } catch (error) {
      console.error('Error refreshing QR:', error);
      setQrError('Error al conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.');
    } finally {
      setRefreshingQR(false);
    }
  };

  // Loading state
  if (loadingBusiness || loadingBusinessContext) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <p className="text-warm-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  // Error state: No business context available
  if (!businessId && !loadingBusinessContext) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <div className="p-6 bg-error/10 border-2 border-error/20 rounded-lg max-w-md mx-auto">
            <p className="text-error-dark font-semibold mb-2">No se pudo cargar la información del negocio</p>
            <p className="text-sm text-warm-600">
              Por favor, intenta cerrar sesión y volver a iniciar sesión. Si el problema persiste, contacta a soporte.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-warm-900 mb-2">Configuración</h1>
        <p className="text-warm-600">Administra tu perfil de negocio y configuración de WhatsApp</p>
      </div>

      <div className="space-y-6">
        {/* Business Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand" />
              <CardTitle>Perfil del Negocio</CardTitle>
            </div>
            <CardDescription>Información básica de tu negocio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre del Negocio"
                value={businessSettings.name}
                onChange={(e) => setBusinessSettings({ ...businessSettings, name: e.target.value })}
                required
              />
              <Input
                label="Correo Electrónico"
                type="email"
                value={businessSettings.email}
                onChange={(e) => setBusinessSettings({ ...businessSettings, email: e.target.value })}
                required
              />
              <Input
                label="Teléfono"
                placeholder="+51 912 345 678"
                value={businessSettings.phone || ''}
                onChange={(e) => setBusinessSettings({ ...businessSettings, phone: e.target.value })}
              />
              <Input
                label="Categoría"
                placeholder="Ej: Cafetería, Restaurante"
                value={businessSettings.category || ''}
                onChange={(e) => setBusinessSettings({ ...businessSettings, category: e.target.value })}
              />
            </div>

            <div className="border-t pt-4 mt-6">
              <h3 className="text-sm font-semibold text-warm-900 mb-3">Estructura de Recompensas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Sellos Requeridos"
                  type="number"
                  min={1}
                  max={50}
                  value={businessSettings.reward_structure.stamps_required}
                  onChange={(e) =>
                    setBusinessSettings({
                      ...businessSettings,
                      reward_structure: {
                        ...businessSettings.reward_structure,
                        stamps_required: parseInt(e.target.value) || 10,
                      },
                    })
                  }
                  required
                />
                <Input
                  label="Descripción de la Recompensa"
                  placeholder="Ej: 1 café gratis"
                  value={businessSettings.reward_structure.reward_description}
                  onChange={(e) =>
                    setBusinessSettings({
                      ...businessSettings,
                      reward_structure: {
                        ...businessSettings.reward_structure,
                        reward_description: e.target.value,
                      },
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="primary"
                onClick={handleSaveBusinessSettings}
                isLoading={saving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Guardar Cambios
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Setup */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-success" />
              <CardTitle className="flex items-center gap-2">
                Configuración de WhatsApp
                <Badge variant="info" className="text-xs">Beta</Badge>
              </CardTitle>
            </div>
            <CardDescription>Conecta tu cuenta de WhatsApp para enviar mensajes automáticos</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingWhatsApp ? (
              <div className="text-center py-8">
                <p className="text-warm-600">Cargando estado de WhatsApp...</p>
              </div>
            ) : whatsappStatus?.connected ? (
              <div className="space-y-4">
                <div className="p-4 bg-success/10 border-2 border-success/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center text-white">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-success-dark">WhatsApp Conectado</p>
                      <p className="text-sm text-warm-600">
                        Instancia: {whatsappStatus.instance_name || 'Desconocida'}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-warm-600">
                  Tu cuenta de WhatsApp está conectada y lista para enviar mensajes automáticos a tus clientes.
                </p>

                {/* Test Connection Section */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-warm-900 mb-3">Probar Conectividad</h3>
                  <p className="text-sm text-warm-600 mb-4">
                    Envía un mensaje de prueba a tu número para verificar que WhatsApp funciona correctamente.
                  </p>

                  {businessSettings.phone && (
                    <p className="text-sm text-warm-700 mb-3">
                      Se enviará un mensaje a: <strong>{maskPhone(businessSettings.phone)}</strong>
                    </p>
                  )}

                  {testResult && (
                    <div className={`p-3 rounded-lg mb-3 ${
                      testResult.success
                        ? 'bg-success/10 border-2 border-success/20'
                        : 'bg-error/10 border-2 border-error/20'
                    }`}>
                      <p className={`text-sm ${testResult.success ? 'text-success-dark' : 'text-error-dark'}`}>
                        {testResult.message}
                      </p>
                    </div>
                  )}

                  <Button
                    variant="secondary"
                    onClick={handleTestWhatsApp}
                    isLoading={testingConnection}
                    disabled={!businessSettings.phone || testingConnection || testCooldown > 0}
                  >
                    {testingConnection
                      ? 'Enviando...'
                      : testCooldown > 0
                      ? `Espera ${Math.ceil(testCooldown / 60)} min`
                      : 'Enviar Mensaje de Prueba'}
                  </Button>

                  {!businessSettings.phone && (
                    <p className="text-sm text-warning-dark mt-2">
                      Por favor, guarda tu número de teléfono primero para probar la conectividad.
                    </p>
                  )}

                  {testCooldown > 0 && (
                    <p className="text-sm text-info-dark mt-2">
                      Podrás enviar otro mensaje de prueba en {Math.ceil(testCooldown / 60)} minutos.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-warning/10 border-2 border-warning/20 rounded-lg">
                  <p className="font-semibold text-warning-dark">WhatsApp No Conectado</p>
                  <p className="text-sm text-warm-600 mt-1">
                    Haz clic en &quot;Conectar WhatsApp&quot; para generar un código QR y vincula tu cuenta
                  </p>
                </div>

                {/* Error message display */}
                {qrError && (
                  <div className="p-4 bg-error/10 border-2 border-error/20 rounded-lg">
                    <p className="text-error-dark text-sm font-medium">{qrError}</p>
                  </div>
                )}

                {whatsappStatus?.qr_code ? (
                  <div className="flex flex-col items-center gap-4">
                    {/* Scanning indicator */}
                    <div className="p-3 bg-info/10 border-2 border-info/20 rounded-lg w-full">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-info rounded-full animate-pulse"></div>
                        <p className="text-info-dark text-sm font-medium">
                          Esperando escaneo del código QR...
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-lg border-2 border-warm-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`data:image/png;base64,${whatsappStatus.qr_code}`}
                        alt="WhatsApp QR Code"
                        width={300}
                        height={300}
                        className="max-w-full h-auto"
                      />
                    </div>
                    <div className="space-y-3 text-sm">
                      <p className="font-semibold text-warm-900 text-base">Cómo conectar (paso a paso):</p>
                      <ol className="space-y-2">
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold">1</span>
                          <span className="text-warm-700">Abre <strong>WhatsApp</strong> en tu teléfono</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold">2</span>
                          <span className="text-warm-700">Ve a <strong>Configuración</strong> → <strong>Dispositivos vinculados</strong></span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold">3</span>
                          <span className="text-warm-700">Toca <strong>&quot;Vincular un dispositivo&quot;</strong></span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold">4</span>
                          <span className="text-warm-700">Apunta tu cámara al código QR de arriba</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-success text-white flex items-center justify-center text-xs font-bold">✓</span>
                          <span className="text-warm-700"><strong>¡No cierres WhatsApp!</strong> En instantes verás aquí &quot;Conexión Completada&quot;</span>
                        </li>
                      </ol>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={handleRefreshQR}
                      isLoading={refreshingQR}
                      leftIcon={<RefreshCw className="w-4 h-4" />}
                    >
                      Refrescar Código
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-warm-600 mb-4">Haz clic en el botón para comenzar</p>
                    <Button variant="primary" onClick={handleRefreshQR} isLoading={refreshingQR}>
                      Conectar WhatsApp (Beta)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
