'use client';

import { useState } from 'react';
import { TrendingUp, Users, DollarSign } from 'lucide-react';

/**
 * Mobile-first responsive ROI Calculator component
 * - Enlarged touch targets for mobile
 * - Stacked layout on mobile, side-by-side on desktop
 * - Responsive typography and spacing
 * - Custom slider styling for better touch interaction
 */
export function ROICalculator() {
  const [monthlySales, setMonthlySales] = useState(597);
  const [averageTicket, setAverageTicket] = useState(187);

  // Conservative estimates based on loyalty program research
  const RETENTION_MULTIPLIER = 2; // 2x retention rate
  const PROFIT_MULTIPLIER = 2; // 2x more profits from repeat customers
  const AOV_INCREASE = 0.3; // +30% average order value

  // Calculations
  const monthlyRevenue = monthlySales * averageTicket;
  const currentAnnualRevenue = monthlyRevenue * 12;

  // With loyalty program (conservative estimates)
  const retainedCustomers = monthlySales * 0.4; // 40% become repeat customers
  const additionalVisitsPerYear = retainedCustomers * 6; // 6 additional visits/year
  const newAverageTicket = averageTicket * (1 + AOV_INCREASE);
  const additionalAnnualRevenue = additionalVisitsPerYear * newAverageTicket;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-PE').format(Math.round(value));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border-2 border-purple-100">
      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          ¿Cuánto podrías ganar con Seya?
        </h2>
        <p className="text-sm sm:text-base text-gray-600">Calcula el impacto en tu negocio</p>
      </div>

      {/* Input Section - Stack on mobile, side-by-side on desktop */}
      <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6 mb-6 md:mb-8">
        {/* Monthly Sales Slider */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            ¿Cuántas ventas haces cada mes?
          </label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="1000"
              value={monthlySales}
              onChange={(e) => setMonthlySales(Number(e.target.value))}
              className="
                w-full h-6 bg-purple-200 rounded-lg
                appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-6
                [&::-webkit-slider-thumb]:h-6
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-gradient-to-br
                [&::-webkit-slider-thumb]:from-purple-600
                [&::-webkit-slider-thumb]:to-orange-500
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:active:scale-110
                [&::-webkit-slider-thumb]:transition-transform
                [&::-moz-range-thumb]:w-6
                [&::-moz-range-thumb]:h-6
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-gradient-to-br
                [&::-moz-range-thumb]:from-purple-600
                [&::-moz-range-thumb]:to-orange-500
                [&::-moz-range-thumb]:cursor-pointer
                [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:shadow-md
                [&::-moz-range-thumb]:active:scale-110
                [&::-moz-range-thumb]:transition-transform
              "
            />
            <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500 mt-3">
              <span>0</span>
              <span className="text-xl sm:text-2xl font-bold text-purple-600">
                {formatNumber(monthlySales)}
              </span>
              <span>1,000</span>
            </div>
          </div>
        </div>

        {/* Average Ticket Slider */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            ¿Cuál es tu ticket promedio?
          </label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="500"
              value={averageTicket}
              onChange={(e) => setAverageTicket(Number(e.target.value))}
              className="
                w-full h-6 bg-purple-200 rounded-lg
                appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-6
                [&::-webkit-slider-thumb]:h-6
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-gradient-to-br
                [&::-webkit-slider-thumb]:from-purple-600
                [&::-webkit-slider-thumb]:to-orange-500
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:active:scale-110
                [&::-webkit-slider-thumb]:transition-transform
                [&::-moz-range-thumb]:w-6
                [&::-moz-range-thumb]:h-6
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-gradient-to-br
                [&::-moz-range-thumb]:from-purple-600
                [&::-moz-range-thumb]:to-orange-500
                [&::-moz-range-thumb]:cursor-pointer
                [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:shadow-md
                [&::-moz-range-thumb]:active:scale-110
                [&::-moz-range-thumb]:transition-transform
              "
            />
            <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500 mt-3">
              <span>S/0</span>
              <span className="text-xl sm:text-2xl font-bold text-purple-600">
                {formatCurrency(averageTicket)}
              </span>
              <span>S/500</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="text-center mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm font-medium text-purple-900 mb-2">
            Ingresos adicionales anuales con Seya
          </p>
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
            +{formatCurrency(additionalAnnualRevenue)}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1 sm:mb-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <div className="text-xs sm:text-sm text-purple-900 font-semibold mb-1">
              Duplica retención
            </div>
            <div className="text-[10px] sm:text-xs text-purple-700">Clientes regresan 2x</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1 sm:mb-2">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <div className="text-xs sm:text-sm text-purple-900 font-semibold mb-1">
              +30% ticket
            </div>
            <div className="text-[10px] sm:text-xs text-purple-700">Más valor por visita</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1 sm:mb-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <div className="text-xs sm:text-sm text-purple-900 font-semibold mb-1">
              Más reseñas
            </div>
            <div className="text-[10px] sm:text-xs text-purple-700">Clientes comparten</div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] sm:text-xs text-center text-gray-500 italic leading-relaxed">
        Datos basados en estudios de programas de lealtad. Los resultados pueden variar según tu
        negocio y no están garantizados.
      </p>
    </div>
  );
}
