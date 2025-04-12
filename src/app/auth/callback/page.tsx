'use client';

import { useEffect } from 'react';
import { auth } from '@/services/auth';

export default function CallbackPage() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      auth.handleCallback(code).catch(console.error);
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Completing login...</p>
    </div>
  );
} 