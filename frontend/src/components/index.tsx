'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { ShoppingCart, User, LogOut, Package, LayoutDashboard, Store, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="w-full bg-[#131921] text-white shadow z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 mr-4 group">
            <Store className="w-8 h-8 text-[#febd69] group-hover:scale-110 transition-transform" />
            <span className="text-xl font-black tracking-tight text-[#febd69] font-sans drop-shadow">ShopFlow</span>
          </Link>

          {/* Search bar center */}
          <form onSubmit={handleSearch} className="flex-1 flex justify-center">
            <div className="relative w-full max-w-xl">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher sur ShopFlow..." className="w-full pl-12 pr-4 py-2 rounded-sm border-2 border-[#febd69] bg-white text-gray-900 placeholder:text-gray-500 text-base focus:ring-2 focus:ring-[#febd69] focus:border-[#febd69] transition" />
              <button type="submit" className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-[#131921] hover:text-[#febd69]">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Account/Cart right */}
          <div className="flex items-center gap-4 ml-4">
            <Link href="/products" className="text-sm font-semibold text-white hover:text-[#febd69] px-2 py-1 rounded transition">Catalogue</Link>
            {isAuthenticated ? (
              <>
                {user?.role === 'CUSTOMER' && (
                  <Link href="/cart" className="relative flex items-center text-white hover:text-[#febd69] transition">
                    <ShoppingCart className="w-6 h-6" />
                  </Link>
                )}
                {user?.role === 'CUSTOMER' && (
                  <Link href="/account" className="text-sm text-white hover:text-[#febd69] font-semibold transition">Mon Compte</Link>
                )}
                {user?.role === 'SELLER' && (
                  <Link href="/seller" className="text-sm text-white hover:text-[#febd69] font-semibold flex items-center gap-1 transition">
                    <LayoutDashboard className="w-5 h-5" /> Vendeur
                  </Link>
                )}
                {user?.role === 'ADMIN' && (
                  <Link href="/seller" className="text-sm text-white hover:text-[#febd69] font-semibold flex items-center gap-1 transition">
                    <LayoutDashboard className="w-5 h-5" /> Admin
                  </Link>
                )}
                <div className="flex items-center gap-2 pl-3 border-l border-[#232f3e]">
                  <span className="text-sm text-white font-sans">{user?.firstName}</span>
                  <button onClick={logout} className="p-1.5 text-[#febd69] hover:text-red-400 transition" title="Déconnexion">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <Link href="/auth" className="px-4 py-1 bg-[#febd69] text-[#131921] text-sm font-bold rounded-sm shadow hover:bg-[#f7ca6c] transition border border-[#febd69]">Connexion</Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden ml-2 p-2 rounded bg-[#232f3e] hover:bg-[#febd69]/20 transition" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-[#232f3e] space-y-3 bg-[#232f3e] rounded-b shadow-xl">
            <form onSubmit={handleSearch} className="px-2">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..." className="w-full px-4 py-2 border rounded text-base bg-white text-gray-900" />
            </form>
            <Link href="/products" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm font-semibold text-white hover:text-[#febd69]">Catalogue</Link>
            {isAuthenticated ? (
              <>
                {user?.role === 'CUSTOMER' && <Link href="/cart" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-white hover:text-[#febd69]">Panier</Link>}
                {user?.role === 'CUSTOMER' && <Link href="/account" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-white hover:text-[#febd69]">Mon Compte</Link>}
                {(user?.role === 'SELLER' || user?.role === 'ADMIN') && <Link href="/seller" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-white hover:text-[#febd69]">Dashboard</Link>}
                <button onClick={() => { logout(); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-300 hover:text-[#febd69]">Déconnexion</button>
              </>
            ) : (
              <Link href="/auth" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-[#febd69] font-bold">Connexion</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

// Product Card
interface ProductCardProps {
  product: any;
}
export function ProductCard({ product }: ProductCardProps) {
  const hasPromo = product.promoPrice != null;
  const discount = hasPromo ? Math.round((1 - product.promoPrice / product.price) * 100) : 0;

  return (
    <Link href={`/products/${product.id}`} className="group bg-white border border-[#ddd] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full">
      <div className="relative aspect-square bg-[#f7f7f7] flex items-center justify-center">
        {product.image || product.images?.[0] ? (
          <img src={product.image || product.images[0]} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#bbb]"><Package className="w-16 h-16" /></div>
        )}
        {hasPromo && (
          <span className="absolute top-2 left-2 bg-[#febd69] text-[#232f3e] text-xs font-bold px-2 py-0.5 rounded-sm shadow border border-[#f7ca6c]">-{discount}%</span>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-1.5 px-3 py-3">
        <h3 className="font-sans font-bold text-[#131921] text-sm line-clamp-2 mb-1 group-hover:text-[#febd69] transition">{product.name}</h3>
        <div className="flex items-center gap-1.5 mb-1">
          <RatingStars rating={product.averageRating || 0} size="sm" />
          <span className="text-xs text-[#555]">({product.totalSold} vendus)</span>
        </div>
        <div className="flex items-baseline gap-2 mt-auto">
          {hasPromo ? (
            <>
              <span className="text-lg font-bold text-[#b12704]">{product.promoPrice?.toFixed(2)} DT</span>
              <span className="text-sm text-[#888] line-through">{product.price?.toFixed(2)} DT</span>
            </>
          ) : (
            <span className="text-lg font-bold text-[#b12704]">{product.price?.toFixed(2)} DT</span>
          )}
        </div>
        <p className="text-xs text-[#007185] mt-1">{product.sellerShopName}</p>
      </div>
      {product.totalSold > 100 && (
        <div className="absolute top-2 right-2 bg-[#232f3e] text-[#febd69] text-[10px] font-bold px-2 py-0.5 rounded-sm shadow border border-[#444]">TOP VENTE</div>
      )}
    </Link>
  );
}

// Rating Stars
export function RatingStars({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`${s} ${star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// Order Status Badge
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  PAID: { label: 'Payée', color: 'bg-blue-100 text-blue-700' },
  PROCESSING: { label: 'En traitement', color: 'bg-indigo-100 text-indigo-700' },
  SHIPPED: { label: 'Expédiée', color: 'bg-purple-100 text-purple-700' },
  DELIVERED: { label: 'Livrée', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-700' },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>;
}

// Spinner
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
  );
}

// Empty State
export function EmptyState({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="w-16 h-16 text-gray-200 mb-4" />
      <h3 className="text-lg font-medium text-gray-500 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
    </div>
  );
}
