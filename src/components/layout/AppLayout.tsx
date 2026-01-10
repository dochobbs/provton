'use client';

import { Sparkles } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Elation-style logo mark */}
            <div className="w-10 h-10 rounded-full bg-[var(--mid-blue)] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-light text-[var(--mid-blue)]">
                Provider<span className="font-normal">Tone</span>
              </span>
              <p className="text-xs text-[var(--gray)]">by Elation Health</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-[var(--gray)]">
          <p>ProviderTone helps capture your unique communication style for AI-generated content.</p>
        </div>
      </footer>
    </div>
  );
}
