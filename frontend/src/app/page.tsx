'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ROICalculator } from '@/components/ROICalculator';
import { PricingCard } from '@/components/PricingCard';
import { PromotionalBanner } from '@/components/PromotionalBanner';
import { Navbar } from '@/components/Navbar';
import {
  QrCode,
  MessageCircle,
  BarChart3,
  Smartphone,
  Zap,
  CheckCircle,
  ArrowRight,
  Wallet,
  Users,
  TrendingUp,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [bannerVisible, setBannerVisible] = useState(true);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Check if banner should be visible on mount
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('dismissed_launch_banner');
      setBannerVisible(!dismissed);
    } catch (error) {
      setBannerVisible(true);
    }
  }, []);

  const handleBannerDismiss = () => {
    setBannerVisible(false);
  };

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Show loading state for authenticated users
  if (!loading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Promotional Banner */}
      <PromotionalBanner
        message="🎉 Precios promocionales · Plan Gratis por tiempo limitado"
        onClick={scrollToPricing}
        dismissible={true}
      />

      {/* Navigation */}
      <Navbar bannerVisible={bannerVisible} />

      {/* Spacer for fixed navbar and banner */}
      <div className={bannerVisible ? 'h-[104px] md:h-[104px]' : 'h-14 md:h-16'} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-orange-50 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Lealtad digital que{' '}
              <span className="bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                funciona
              </span>
              <br />
              para negocios peruanos
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
              Crea tu programa de lealtad digital en 10 minutos.
              <br />
              Sin código, sin apps, sin complicaciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link
                href="/register"
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:from-orange-600 hover:to-orange-700 transition-all hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 min-h-[48px]"
              >
                Empieza Gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#calculator"
                className="bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg border-2 border-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 min-h-[48px]"
              >
                Calcula tu ROI
              </Link>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 bg-white rounded-lg p-3 sm:p-4 shadow-sm">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm sm:text-base text-gray-700 font-medium">Setup en 10 minutos</span>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-lg p-3 sm:p-4 shadow-sm">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm sm:text-base text-gray-700 font-medium">Sin app para clientes</span>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-lg p-3 sm:p-4 shadow-sm sm:col-span-2 md:col-span-1">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm sm:text-base text-gray-700 font-medium">Automatización WhatsApp</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              ¿Cuántos de tus clientes te visitan solo una vez?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">
              Conseguir un nuevo cliente cuesta{' '}
              <span className="font-bold text-purple-600">5 veces más</span> que retener uno
              existente. Las tarjetas de cartón se pierden, los clientes se olvidan.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl">📄</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Tarjetas perdidas</h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">
                El 70% de tarjetas de cartón se pierden antes de completarse
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl">💰</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Ingresos perdidos</h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">
                Sin sistema, pierdes oportunidades de venta cruzada y upselling
              </p>
            </div>

            <div className="text-center sm:col-span-2 md:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl">❌</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Clientes olvidados</h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">
                Sin recordatorios, tus clientes prueban a la competencia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section id="calculator" className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ROICalculator />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-purple-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              Planes que crecen con tu negocio
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">
              Sin sorpresas. Sin compromisos. Cambia de plan cuando quieras.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            <PricingCard
              tier="GRATIS"
              price={0}
              period="siempre gratis"
              description="Perfecto para empezar"
              features={[
                'Hasta 100 clientes',
                'Tarjetas digitales ilimitadas',
                'Escaneo QR básico',
                'Dashboard simple',
                'Soporte por email',
              ]}
              ctaText="Empieza Gratis"
              ctaHref="/register"
            />

            <PricingCard
              tier="BÁSICO"
              price={99}
              period="por mes"
              description="Para negocios en crecimiento"
              features={[
                'Hasta 500 clientes',
                'Automatización WhatsApp',
                'Campañas personalizadas',
                'Analytics avanzado',
                'Soporte prioritario',
              ]}
              ctaText="Empieza Gratis"
              ctaHref="/register"
            />

            <PricingCard
              tier="PROFESIONAL"
              price={249}
              period="por mes"
              description="Para negocios establecidos"
              features={[
                'Hasta 2,000 clientes',
                'Multi-ubicación',
                'API access',
                'Segmentación avanzada',
                'Soporte dedicado',
                'Onboarding personalizado',
              ]}
              ctaText="Empieza Gratis"
              ctaHref="/register"
              isPopular={true}
              isPremium={true}
            />

            <PricingCard
              tier="EMPRESARIAL"
              price={null}
              customPrice="Desde S/ 999"
              period="por mes"
              description="Para cadenas y franquicias"
              features={[
                'Clientes ilimitados',
                'Multi-marca',
                'SLA garantizado',
                'Gerente de cuenta',
                'Integraciones custom',
                'White-label disponible',
              ]}
              ctaText="Contactar Ventas"
              ctaHref="/register"
            />
          </div>

          <div className="text-center px-4">
            <p className="text-warm-600 text-xs sm:text-sm">
              Sin tarjeta de crédito • Cambio de plan gratis en cualquier momento
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              Cómo funciona
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">
              Lanza tu programa de lealtad en 3 pasos simples
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-purple-600">1</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 px-4">Diseña tu tarjeta</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 px-4">
                Elige un template, personaliza con tu logo y colores. Define cuántos sellos =
                premio.
              </p>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mx-4">
                <QrCode className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 mx-auto" />
              </div>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 px-4">Define reglas</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 px-4">
                Crea automatizaciones: &ldquo;Si cliente inactivo 14 días → enviar WhatsApp con
                descuento&rdquo;
              </p>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mx-4">
                <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 mx-auto" />
              </div>
            </div>

            <div className="text-center sm:col-span-2 md:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 px-4">Lanza y crece</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 px-4">
                Comparte tu QR, clientes se inscriben en segundos. Escaneas, agregan sellos,
                regresan más.
              </p>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mx-4">
                <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-purple-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              Todo lo que necesitas para retener clientes
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <Wallet className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Tarjetas en billetera digital
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Clientes agregan a Apple Wallet o Google Wallet. No descargan apps, no pierden
                tarjetas.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <QrCode className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Validación con QR</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Cliente muestra QR, tú escaneas desde tu celular, sello se marca automáticamente.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">WhatsApp automático</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Envía campañas y recordatorios por WhatsApp con reglas que tú configuras.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Dashboard claro</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Ve sellos emitidos, premios canjeados, clientes activos vs. inactivos en tiempo
                real.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Automatización simple</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Reglas if/then que tú controlas: cumpleaños, inactividad, sellos completados.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Compatible con todo</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Funciona con cualquier método de pago. No depende de POS específico.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-purple-600 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            Convierte visitas únicas en clientes fieles
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-purple-100 mb-6 sm:mb-8">
            Únete a negocios peruanos que ya están reteniendo más con Seya
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-100 transition-all hover:shadow-2xl hover:-translate-y-1 min-h-[48px]"
          >
            Empieza gratis hoy
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-purple-100 mt-3 sm:mt-4 text-xs sm:text-sm">
            Sin tarjeta de crédito • Setup en 10 minutos
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 md:col-span-1">
              <img
                src="/navbaricon.svg"
                alt="Seya"
                className="h-7 sm:h-8 mb-3 sm:mb-4"
              />
              <p className="text-xs sm:text-sm">
                Plataforma de lealtad digital diseñada para negocios peruanos
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Producto</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link href="#calculator" className="hover:text-white transition-colors">
                    Calculadora ROI
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Empezar gratis
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white transition-colors">
                    Precios
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Soporte</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <span className="text-gray-500">Ayuda (Próximamente)</span>
                </li>
                <li>
                  <span className="text-gray-500">Documentación (Próximamente)</span>
                </li>
                <li>
                  <span className="text-gray-500">Contacto (Próximamente)</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <span className="text-gray-500">Términos (Próximamente)</span>
                </li>
                <li>
                  <span className="text-gray-500">Privacidad (Próximamente)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
            <p>&copy; 2025 Seya. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
