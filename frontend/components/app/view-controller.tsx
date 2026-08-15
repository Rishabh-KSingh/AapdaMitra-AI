'use client';

import type { AppConfig } from '@/app-config';
import { AapdaMitraDashboard } from '@/components/app/aapda-mitra-dashboard';

interface ViewControllerProps {
  appConfig: AppConfig;
}

export function ViewController({ appConfig }: ViewControllerProps) {
  return <AapdaMitraDashboard appConfig={appConfig} />;
}
