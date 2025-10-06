'use client';

import { Card, CardContent } from '@/design-system/primitives/Card/Card';
import { Button } from '@/design-system/primitives/Button/Button';
import { X, PartyPopper, TrendingUp } from 'lucide-react';

interface FirstCustomerCelebrationProps {
  onDismiss: () => void;
}

/**
 * Celebration modal shown when business enrolls their first customer
 * Key emotional moment: validates their effort and guides next actions
 */
export function FirstCustomerCelebration({ onDismiss }: FirstCustomerCelebrationProps) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full border-2 border-success shadow-2xl animate-in fade-in zoom-in duration-300">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-success to-success-dark flex items-center justify-center flex-shrink-0">
              <PartyPopper className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-warm-900 mb-1">
                ¡Felicidades! 🎉
              </h2>
              <p className="text-warm-600 text-sm">
                Inscribiste tu primer cliente
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="text-warm-400 hover:text-warm-600 transition-colors flex-shrink-0"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="bg-gradient-to-br from-success/5 to-success/10 rounded-lg p-4 mb-4">
            <p className="text-warm-800 mb-3">
              Este es un gran paso. Ahora tu cliente puede empezar a acumular sellos y ganar premios.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                  ✓
                </div>
                <span className="text-warm-700">
                  Cada compra que hagan suma un sello
                </span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                  ✓
                </div>
                <span className="text-warm-700">
                  Puedes escanear su QR desde el Scanner
                </span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                  ✓
                </div>
                <span className="text-warm-700">
                  Ellos ven su progreso en tiempo real
                </span>
              </div>
            </div>
          </div>

          {/* Growth Message */}
          <div className="flex items-center gap-3 p-3 bg-brand-whisper rounded-lg mb-4">
            <TrendingUp className="w-5 h-5 text-brand flex-shrink-0" />
            <p className="text-sm text-warm-800">
              <span className="font-semibold text-brand">Consejo:</span> Comparte tu QR con más clientes para acelerar el crecimiento
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              className="flex-1"
              onClick={onDismiss}
            >
              Entendido
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
