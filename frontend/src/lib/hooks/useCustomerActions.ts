import { useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function useSendCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: string) => {
      const token = localStorage.getItem('authToken');

      const response = await fetch(
        `${API_URL}/api/v1/customers/${customerId}/send-card`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Error al enviar tarjeta');
      }

      return response.json();
    },
    onSuccess: () => {
      // No need to invalidate queries - just show success message
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
