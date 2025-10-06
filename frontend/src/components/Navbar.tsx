'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useScrollDirection } from '@/hooks/useScrollDirection';

interface NavbarProps {
  bannerVisible?: boolean;
}

/**
 * Auto-hiding navigation bar component
 * - Hides on scroll down to maximize content space
 * - Shows on scroll up for easy access
 * - Always visible at top of page
 * - Mobile hamburger menu with full-screen overlay
 */
export function Navbar({ bannerVisible = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollDirection = useScrollDirection();

  const isHidden = scrollDirection === 'down';
  const isFloating = scrollDirection === 'up';
  const bannerHeight = bannerVisible ? 40 : 0;

  // Close mobile menu on route change
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: '#pricing', label: 'Precios' },
    { href: '/login', label: 'Iniciar Sesión' },
  ];

  return (
    <>
      <nav
        className={`
          fixed left-0 right-0 z-50
          bg-white border-b border-gray-200
          transition-all duration-300 ease-in-out
          ${isHidden ? '-translate-y-full' : 'translate-y-0'}
          ${isFloating ? 'shadow-lg bg-white/95 backdrop-blur-sm' : ''}
        `}
        style={{ top: `${bannerHeight}px` }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0" aria-label="Seya - Home">
              <img src="/navbaricon.svg" alt="Seya" className="h-7 md:h-8" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/register"
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all hover:shadow-lg"
              >
                Empieza Gratis
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Content */}
          <div
            className="fixed left-0 right-0 z-40 bg-white md:hidden shadow-xl"
            style={{ top: `${bannerHeight + 56}px`, bottom: 0 }}
            role="dialog"
            aria-label="Mobile menu"
          >
            <div className="flex flex-col p-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-900 text-lg font-medium py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/register"
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-lg font-semibold text-center text-lg mt-4 hover:from-purple-700 hover:to-purple-800 transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Empieza Gratis
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
