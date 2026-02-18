'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

export function TawkToWidget() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    // Replace with your actual tawk.to property ID and widget ID
    const TAWK_PROPERTY_ID = 'REPLACE_WITH_PROPERTY_ID';
    const TAWK_WIDGET_ID = 'default';

    if (TAWK_PROPERTY_ID === 'REPLACE_WITH_PROPERTY_ID') return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (isLoaded && user && window.Tawk_API?.setAttributes) {
      window.Tawk_API.setAttributes({
        name: user.fullName || user.firstName || 'User',
        email: user.primaryEmailAddress?.emailAddress,
        role: (user.publicMetadata as Record<string, unknown>)?.role,
      });
    }
  }, [user, isLoaded]);

  return null;
}
