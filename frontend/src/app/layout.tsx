import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Navbar } from '@/components';

export const metadata: Metadata = {
  title: 'ShopFlow — Boutique en Ligne',
  description: 'Plateforme e-commerce ShopFlow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="bg-[#e3e6e6] min-h-full">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          {/* Amazon-like sticky dark navbar */}
          <div className="sticky top-0 z-50 w-full bg-[#131921] shadow-lg border-b border-[#232f3e]">
            <Navbar />
          </div>
          {/* Main content area with light background and subtle shadow */}
          <main className="flex-1 min-h-[70vh] pb-12 bg-[#e3e6e6]">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 pt-6">
              {children}
            </div>
          </main>
          {/* Amazon-like footer: strong brand bar, neutral background */}
          <footer className="bg-[#232f3e] border-t-4 border-[#febd69] py-10 mt-24 shadow-inner">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 text-[#ddd]">
              <div className="flex items-center gap-3">
                <span className="font-bold text-2xl tracking-tight text-[#febd69] drop-shadow">ShopFlow</span>
                <span className="hidden md:inline-block text-xs bg-[#febd69]/20 text-[#febd69] px-3 py-1 rounded-full ml-4">Depuis 2025</span>
              </div>
              <div className="text-center md:text-right text-xs">
                &copy; 2025–2026 ShopFlow<br className="md:hidden" /> <span className="italic">Projet Académique</span>
              </div>
            </div>
            <div className="w-full mt-8 border-t border-[#444] pt-6 text-center text-xs text-[#aaa]">Inspiré par Amazon &mdash; {new Date().getFullYear()}</div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
