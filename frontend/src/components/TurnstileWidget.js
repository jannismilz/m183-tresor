import React, { useEffect, useRef } from 'react';
import { TURNSTILE_SITE_KEY } from '../config/turnstile';

/**
 * Cloudflare Turnstile Widget Component
 * This component renders the Cloudflare Turnstile widget and handles token generation
 */
function TurnstileWidget({ onVerify }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    // Load the Turnstile script if it's not already loaded
    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = renderWidget;
    } else {
      renderWidget();
    }

    return () => {
      // Clean up the widget when component unmounts
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, []);

  const renderWidget = () => {
    // Wait for turnstile to be available
    if (!window.turnstile) {
      setTimeout(renderWidget, 100);
      return;
    }

    // Reset any existing widget
    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current);
    }

    // Render the widget
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token) => {
        if (onVerify) {
          onVerify(token);
        }
      },
      'expired-callback': () => {
        // Token expired, set to empty
        if (onVerify) {
          onVerify('');
        }
      },
      'error-callback': () => {
        // Error occurred, set to empty
        if (onVerify) {
          onVerify('');
        }
      }
    });
  };

  return <div ref={containerRef} className="cf-turnstile mt-3 mb-3"></div>;
}

export default TurnstileWidget;
