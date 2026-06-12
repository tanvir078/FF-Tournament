import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';

type PlatformSettings = {
  brandName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  brandSlogan: string;
};

const defaults: PlatformSettings = {
  brandName: 'Progotix Tournaments',
  brandSlogan: 'Royal Bengal',
  primaryColor: '#590a84',
  secondaryColor: '#7c3aed',
};

const PlatformContext = createContext<PlatformSettings>(defaults);

function applyPlatformCss(settings: PlatformSettings) {
  if (typeof document === 'undefined') return;

  document.documentElement.style.setProperty('--arena-primary', settings.primaryColor);
  document.documentElement.style.setProperty('--arena-secondary', settings.secondaryColor);
}

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState(defaults);

  useEffect(() => {
    applyPlatformCss(defaults);
    
    api.get('/platform/settings').then(({ data }) => {
      const next = { ...defaults, ...data };
      setSettings(next);
      applyPlatformCss(next);
      document.title = next.brandName;
    }).catch(() => undefined);
  }, []);

  const value = useMemo(() => settings, [settings]);

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
}

export const usePlatform = () => {
  return useContext(PlatformContext);
};
