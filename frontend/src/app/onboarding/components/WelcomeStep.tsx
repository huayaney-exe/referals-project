'use client';

import { Button } from '@/design-system/primitives/Button/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/design-system/primitives/Card/Card';

interface WelcomeStepProps {
  businessName: string;
  onNext: () => void;
}

export function WelcomeStep({ businessName, onNext }: WelcomeStepProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">👋</div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
          ¡Bienvenido a Seya, {businessName}!
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          En solo 2 minutos, configura tu programa de fidelidad y empieza a recompensar a tus clientes.
        </p>
      </div>

      {/* Value Props */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-purple-100 hover:border-purple-300 transition-colors">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-3">🎁</div>
            <h3 className="font-semibold text-lg mb-2">Define tu Recompensa</h3>
            <p className="text-sm text-gray-600">
              Elige cuántos sellos necesitan tus clientes y qué recibirán
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-100 hover:border-purple-300 transition-colors">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="font-semibold text-lg mb-2">Diseña tu Tarjeta</h3>
            <p className="text-sm text-gray-600">
              Personaliza colores, logo y plantilla para reflejar tu marca
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-100 hover:border-purple-300 transition-colors">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-3">📱</div>
            <h3 className="font-semibold text-lg mb-2">Descarga tu QR</h3>
            <p className="text-sm text-gray-600">
              Obtén tu código QR listo para imprimir y compartir
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-br from-purple-50 to-orange-50 border-none">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-600">2 min</div>
              <div className="text-sm text-gray-600 mt-1">Tiempo de configuración</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">3 pasos</div>
              <div className="text-sm text-gray-600 mt-1">Proceso simple</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">0 código</div>
              <div className="text-sm text-gray-600 mt-1">Sin complicaciones</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center pt-4">
        <Button
          onClick={onNext}
          className="bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          Comenzar Configuración →
        </Button>
        <p className="text-sm text-gray-500 mt-4">
          No se requiere tarjeta de crédito • Cancela cuando quieras
        </p>
      </div>
    </div>
  );
}
