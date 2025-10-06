'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/design-system/primitives/Card/Card';
import { Button } from '@/design-system/primitives/Button/Button';
import { Plus, Copy, BarChart3, Power, Trash2, ExternalLink, Check } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface ScannerToken {
  id: string;
  name: string;
  token_preview: string;
  is_active: boolean;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
  expires_at: string | null;
  business_locations?: {
    id: string;
    name: string;
  } | null;
}

async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('No authenticated session');
  }
  return session.access_token;
}

export default function ScannerAccessPage() {
  const [tokens, setTokens] = useState<ScannerToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchTokens();
  }, []);

  async function fetchTokens() {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/scanner-tokens`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setTokens(data.data);
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleTokenStatus(id: string, currentStatus: boolean) {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/scanner-tokens/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (res.ok) {
        fetchTokens();
      }
    } catch (error) {
      console.error('Error toggling token:', error);
    }
  }

  async function deleteToken(id: string) {
    if (!confirm('¿Estás seguro de eliminar este acceso? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const token = await getAuthToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/scanner-tokens/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchTokens();
      }
    } catch (error) {
      console.error('Error deleting token:', error);
    }
  }

  async function copyAccessLink(id: string) {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/scanner-tokens/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        await navigator.clipboard.writeText(data.data.access_url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (error) {
      console.error('Error copying link:', error);
    }
  }

  function getRelativeTime(dateString: string | null) {
    if (!dateString) return 'Nunca';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Acceso para Empleados</h1>
          <p className="text-gray-600 mt-2">Comparte el scanner con tu equipo sin dar acceso completo</p>
        </div>
        <Link href="/dashboard/scanner-access/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Crear Nuevo Acceso
          </Button>
        </Link>
      </div>

      {/* Empty State */}
      {tokens.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No hay accesos creados</h2>
            <p className="text-gray-600 mb-6">
              Crea enlaces de acceso para que tu equipo pueda usar el scanner sin necesidad de acceder al dashboard completo.
            </p>
            <Link href="/dashboard/scanner-access/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Acceso
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* Token List */
        <div className="grid gap-4">
          {tokens.map((token) => (
            <Card key={token.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{token.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        token.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {token.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  {token.business_locations && (
                    <p className="text-sm text-gray-600 mb-2">
                      📍 {token.business_locations.name}
                    </p>
                  )}

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span>{token.usage_count} escaneos</span>
                    <span>Última vez: {getRelativeTime(token.last_used_at)}</span>
                    <span className="text-xs text-gray-400">{token.token_preview}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => copyAccessLink(token.id)}
                    variant="secondary"
                    size="sm"
                  >
                    {copiedId === token.id ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copiar Link
                      </>
                    )}
                  </Button>

                  <Link href={`/dashboard/scanner-access/${token.id}`}>
                    <Button variant="secondary" size="sm">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Estadísticas
                    </Button>
                  </Link>

                  <Button
                    onClick={() => toggleTokenStatus(token.id, token.is_active)}
                    variant="secondary"
                    size="sm"
                  >
                    <Power className="w-4 h-4" />
                  </Button>

                  <Button
                    onClick={() => deleteToken(token.id)}
                    variant="secondary"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
