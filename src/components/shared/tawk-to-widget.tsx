'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

export function TawkToWidget() {
  const { data: session } = useSession();

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
    if (session?.user && window.Tawk_API?.setAttributes) {
      window.Tawk_API.setAttributes({
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      });
    }
  }, [session]);

  return null;
}
