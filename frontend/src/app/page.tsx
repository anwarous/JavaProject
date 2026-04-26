'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { ProductCard, Spinner } from '@/components';
import { ArrowRight, Zap, Truck, Shield, Tag } from 'lucide-react';

export default function HomePage() {
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [promoProducts, setPromoProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productsAPI.topSelling().catch(() => ({ data: [] })),
      productsAPI.getAll({ promo: true, size: 4 }).catch(() => ({ data: { content: [] } })),
      categoriesAPI.getTree().catch(() => ({ data: [] })),
    ]).then(([topRes, promoRes, catRes]) => {
      setTopProducts(topRes.data.slice(0, 8));
      setPromoProducts(promoRes.data.content || []);
      setCategories(catRes.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-sm px-3 py-1 rounded-full mb-6">
              <Zap className="w-4 h-4 text-amber-300" /> Soldes d&apos;été — Jusqu&apos;à -25%
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Découvrez le shopping<br />de <span className="text-amber-300">demain</span>
            </h1>
            <p className="text-lg text-primary-100 mb-8 max-w-lg">
              ShopFlow réunit les meilleurs vendeurs et produits. Tech, mode, maison — tout ce dont vous avez besoin.
            </p>
            <div className="flex gap-4">
              <Link href="/products" className="px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition">
                Explorer le catalogue
              </Link>
              <Link href="/auth" className="px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition">
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Truck, text: 'Livraison gratuite dès 100 DT' },
            { icon: Shield, text: 'Paiement 100% sécurisé' },
            { icon: Tag, text: 'Codes promo exclusifs' },
            { icon: Zap, text: 'Support client 24/7' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
              <item.icon className="w-5 h-5 text-primary-500 flex-shrink-0" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Catégories</h2>
          <Link href="/products" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat: any) => (
            <Link key={cat.id} href={`/products?categoryId=${cat.id}`}
              className="flex flex-col items-center p-6 bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary-100 transition">
                <Tag className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">{cat.name}</span>
              {cat.children?.length > 0 && (
                <span className="text-xs text-gray-400 mt-1">{cat.children.length} sous-cat.</span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Promotions */}
      {promoProducts.length > 0 && (
        <section className="bg-gradient-to-r from-red-50 to-amber-50 py-14">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">🔥 Promotions</h2>
                <p className="text-sm text-gray-500 mt-1">Offres limitées — profitez-en vite !</p>
              </div>
              <Link href="/products?promo=true" className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
                Tout voir <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {promoProducts.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Top Selling */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Meilleures Ventes</h2>
          <Link href="/products?sort=popular" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {topProducts.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
