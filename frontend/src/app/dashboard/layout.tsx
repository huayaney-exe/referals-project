'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/design-system/primitives/Button/Button';
import {
  Users,
  MessageCircle,
  BarChart3,
  Settings,
  LogOut,
  QrCode,
  Scan,
  UserCog,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-warm-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-warm-200">
          <img
            src="/navbaricon.svg"
            alt="Seya Logo"
            className="h-10"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <NavLink href="/dashboard" icon={<BarChart3 className="w-5 h-5" />}>
            Dashboard
          </NavLink>
          <NavLink href="/dashboard/settings" icon={<CreditCard className="w-5 h-5" />}>
            Mi Tarjeta
          </NavLink>
          <NavLink href="/dashboard/scan" icon={<Scan className="w-5 h-5" />}>
            Scanner
          </NavLink>
          <NavLink href="/dashboard/scanner-access" icon={<UserCog className="w-5 h-5" />}>
            Acceso Empleados
          </NavLink>
          <NavLink href="/dashboard/customers" icon={<Users className="w-5 h-5" />}>
            Clientes
          </NavLink>
          <NavLink href="/dashboard/campaigns" icon={<MessageCircle className="w-5 h-5" />}>
            Campañas
          </NavLink>
          <NavLink href="/dashboard/qr" icon={<QrCode className="w-5 h-5" />}>
            Código QR
          </NavLink>
          <NavLink href="/dashboard/settings" icon={<Settings className="w-5 h-5" />}>
            Configuración
          </NavLink>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-warm-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-brand-mist flex items-center justify-center text-brand-deep font-semibold">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-warm-900 truncate">{user.email}</p>
              <p className="text-xs text-warm-500">Cuenta activa</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={handleSignOut}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-warm-700 hover:bg-brand-whisper hover:text-brand transition-colors"
    >
      {icon}
      <span className="font-medium">{children}</span>
    </Link>
  );
}
