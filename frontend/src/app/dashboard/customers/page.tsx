'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useBusinessContext } from '@/hooks/useBusinessContext';
import { useCustomers } from '@/lib/hooks/useCustomers';
import { useSendCard } from '@/lib/hooks/useCustomerActions';
import { Card, CardHeader, CardTitle, CardContent } from '@/design-system/primitives/Card/Card';
import { Input } from '@/design-system/primitives/Input/Input';
import { Badge } from '@/design-system/primitives/Badge/Badge';
import { Progress } from '@/design-system/primitives/Progress/Progress';
import { Button } from '@/design-system/primitives/Button/Button';
import { Search, User, Calendar, TrendingUp, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export default function CustomersPage() {
  const { user } = useAuth();
  const { businessId } = useBusinessContext();
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: customers, isLoading, error } = useCustomers(businessId || '', search);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!businessId) return;

    // Subscribe to customer changes
    const channel = supabase
      .channel('customer-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // All events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'customers',
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => {
          console.log('Customer change received:', payload);

          // Invalidate customers query to refetch
          queryClient.invalidateQueries({ queryKey: ['customers', businessId] });

          // Show toast notification (optional)
          if (payload.eventType === 'INSERT') {
            console.log('New customer enrolled:', payload.new);
          } else if (payload.eventType === 'UPDATE') {
            console.log('Customer updated:', payload.new);
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId, queryClient]);

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-error">Error al cargar clientes</p>
              <p className="text-sm text-warm-500 mt-2">{(error as Error).message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeCustomers = customers?.filter((c) => (c.stamps_count || 0) > 0) || [];
  const totalStamps = customers?.reduce((sum, c) => sum + (c.stamps_count || 0), 0) || 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-warm-900 mb-2">Clientes</h1>
        <p className="text-warm-600">Gestiona tu base de clientes y su progreso</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent>
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-brand-whisper text-brand">
                <User className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-warm-900 mb-1">{customers?.length || 0}</h3>
            <p className="text-sm text-warm-600">Total Clientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-success/10 text-success">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-warm-900 mb-1">{activeCustomers.length}</h3>
            <p className="text-sm text-warm-600">Clientes Activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-warm-900 mb-1">{totalStamps}</h3>
            <p className="text-sm text-warm-600">Sellos Totales</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent>
          <Input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </CardContent>
      </Card>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {search ? `Resultados para "${search}"` : 'Todos los Clientes'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customers && customers.length > 0 ? (
            <div className="space-y-4">
              {customers.map((customer) => (
                <CustomerRow key={customer.id} customer={customer} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-warm-100 mx-auto mb-4 flex items-center justify-center">
                <User className="w-8 h-8 text-warm-400" />
              </div>
              <p className="text-warm-600 mb-2">
                {search ? 'No se encontraron clientes' : 'Aún no tienes clientes'}
              </p>
              <p className="text-sm text-warm-500">
                {search
                  ? 'Intenta con otro término de búsqueda'
                  : 'Los clientes aparecerán aquí cuando se inscriban'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CustomerRow({ customer }: { customer: any }) {
  const stampsCount = customer.stamps_count || 0;
  const requiredStamps = 10; // Should come from business config
  const isComplete = stampsCount >= requiredStamps;
  const sendCard = useSendCard();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState('');

  const handleSendCard = async () => {
    setShowError('');
    setShowSuccess(false);

    try {
      await sendCard.mutateAsync(customer.id);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      setShowError(error.message || 'Error al enviar tarjeta');
      setTimeout(() => setShowError(''), 5000);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-warm-200 hover:border-brand-light hover:bg-brand-whisper/50 transition-all">
      <div className="w-12 h-12 rounded-full bg-brand-mist flex items-center justify-center text-brand-deep font-semibold text-lg">
        {customer.name[0]?.toUpperCase() || 'C'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-warm-900">{customer.name}</h4>
          {isComplete && (
            <Badge variant="success" className="text-xs">
              Premio disponible
            </Badge>
          )}
          {showSuccess && (
            <Badge variant="success" className="text-xs">
              ✓ Tarjeta enviada
            </Badge>
          )}
          {showError && (
            <Badge variant="error" className="text-xs">
              {showError}
            </Badge>
          )}
        </div>
        <p className="text-sm text-warm-600 mb-2">{customer.phone}</p>
        <Progress value={stampsCount} max={requiredStamps} size="sm" showLabel />
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm text-warm-500">
            {customer.enrolled_at &&
              format(new Date(customer.enrolled_at), "d 'de' MMMM, yyyy", { locale: es })}
          </p>
          <p className="text-xs text-warm-400 mt-1">
            {customer.last_stamp_at
              ? `Última visita: ${format(new Date(customer.last_stamp_at), 'd/MM/yyyy')}`
              : 'Sin actividad reciente'}
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={handleSendCard}
          disabled={sendCard.isPending}
          className="shrink-0"
        >
          {sendCard.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Enviar Tarjeta
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
