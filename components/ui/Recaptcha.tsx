'use client';

import { useEffect, useRef, useState } from 'react';

interface RecaptchaProps {
  onChange: (token: string | null) => void;
}

export default function Recaptcha({ onChange }: RecaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scriptId = 'recaptcha-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const onScriptLoad = () => {
      setLoaded(true);
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    if (window.grecaptcha) {
      setLoaded(true);
    } else {
      script.addEventListener('load', onScriptLoad);
    }

    return () => {
      if (script) {
        script.removeEventListener('load', onScriptLoad);
      }
    };
  }, []);

  useEffect(() => {
    if (!loaded || !containerRef.current || widgetIdRef.current !== null) return;

    const renderWidget = () => {
      if (window.grecaptcha && containerRef.current) {
        try {
          const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';
          const widgetId = window.grecaptcha.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => onChange(token),
            'expired-callback': () => onChange(null),
            'error-callback': () => onChange(null),
          });
          widgetIdRef.current = widgetId;
        } catch (e) {
          console.error('Error rendering reCAPTCHA:', e);
        }
      }
    };

    if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
      renderWidget();
    } else {
      const interval = setInterval(() => {
        if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
          renderWidget();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [loaded, onChange]);

  return (
    <div className="flex justify-center my-3">
      <div ref={containerRef} />
    </div>
  );
}
