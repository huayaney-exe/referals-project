'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/register-sw';
import { PWAInstaller } from './PWAInstaller';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return <PWAInstaller />;
}
