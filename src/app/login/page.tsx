"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { auth } from '@/services/auth';
import { useToast } from '@/components/toast-context';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  useAuth(false) // false means don't require auth for this page

  const handleAADLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await auth.login();
    } catch (error) {
      console.error('Login failed:', error);
      showToast(
        error instanceof Error ? error.message : 'Login failed. Please try again.',
        'error',
        5000
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1b] flex flex-col items-center justify-center p-4">
      {/* Logo and Title - Moved to top-left */}
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <Image 
          src="/logo.png"
          alt="Logo"
          width={32}
          height={32}
          priority
        />
        <span className="text-white text-xl font-medium">EnterpriseGPT</span>
      </div>

      {/* Login Container */}
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-2">Log In</h2>
          <p className="text-gray-400">Please login to your account</p>
        </div>

        {/* Login Button */}
        <button
          onClick={handleAADLogin}
          disabled={isLoading}
          className={`w-full bg-[#2d2e3a] hover:bg-[#3d3e4a] text-white rounded-lg px-4 py-3 
                     flex items-center justify-center space-x-3 transition-colors 
                     ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="w-6 h-6 rounded-md bg-[#0078d4] flex items-center justify-center">
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-white"
              >
                <path d="M21.5 3h-19A2.5 2.5 0 0 0 0 5.5v13A2.5 2.5 0 0 0 2.5 21h19a2.5 2.5 0 0 0 2.5-2.5v-13A2.5 2.5 0 0 0 21.5 3zm-19 1h19a1.5 1.5 0 0 1 1.5 1.5V7H1V4.5A1.5 1.5 0 0 1 2.5 4zm19 16h-19A1.5 1.5 0 0 1 1 18.5V8h22v10.5a1.5 1.5 0 0 1-1.5 1.5z" />
              </svg>
            )}
          </div>
          <span className="text-sm font-medium">
            {isLoading ? 'Logging in...' : 'Continue With AAD'}
          </span>
        </button>
      </div>
    </div>
  );
} 