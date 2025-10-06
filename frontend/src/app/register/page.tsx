'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/design-system/primitives/Button/Button';
import { Input } from '@/design-system/primitives/Input/Input';
import { Store, Mail, Lock, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password, businessName);
      // Redirect to onboarding for first-time setup
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-brand-subtle">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/navbaricon.svg"
            alt="Seya Logo"
            className="h-16 mx-auto mb-4"
          />
          <h3 className="text-xl font-bold text-warm-900 mb-2">Crear cuenta</h3>
          <p className="text-warm-600">Empieza tu programa de lealtad hoy</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              label="Nombre del negocio"
              placeholder="Café Lima"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              leftIcon={<Store className="w-5 h-5" />}
              required
            />

            <Input
              type="email"
              label="Correo electrónico"
              placeholder="tu@negocio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-5 h-5" />}
              required
            />

            <Input
              type="password"
              label="Contraseña"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-5 h-5" />}
              helperText="Usa al menos 8 caracteres"
              required
            />

            {error && (
              <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="cta"
              className="w-full !text-white"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
                color: '#ffffff'
              }}
            >
              Crear cuenta gratis
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-warm-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-brand font-semibold hover:text-brand-hover">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-warm-500 mt-8">
          Al registrarte, aceptas nuestros{' '}
          <Link href="/terms" className="underline hover:text-warm-700">
            Términos de Servicio
          </Link>{' '}
          y{' '}
          <Link href="/privacy" className="underline hover:text-warm-700">
            Política de Privacidad
          </Link>
        </p>
      </div>
    </div>
  );
}
