'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { ProductCard, Spinner, EmptyState } from '@/components';
import { Package, SlidersHorizontal, X } from 'lucide-react';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    categoryId: searchParams.get('categoryId') || '',
    minPrice: '', maxPrice: '',
    sort: searchParams.get('sort') || '',
    promo: searchParams.get('promo') || '',
    q: searchParams.get('q') || '',
  });

  useEffect(() => {
    categoriesAPI.getTree().then(res => {
      const flatten = (cats: any[]): any[] => cats.reduce((acc: any[], c: any) => [...acc, c, ...flatten(c.children || [])], []);
      setCategories(flatten(res.data));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: any = { page, size: 12 };
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.sort) params.sort = filters.sort;
    if (filters.promo) params.promo = true;

    const fetchFn = filters.q
      ? productsAPI.search(filters.q, { page, size: 12 })
      : productsAPI.getAll(params);

    fetchFn.then(res => {
      setProducts(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    }).catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [page, filters]);

  const clearFilters = () => {
    setFilters({ categoryId: '', minPrice: '', maxPrice: '', sort: '', promo: '', q: '' });
    setPage(0);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-serif font-extrabold text-primary-900 tracking-tight drop-shadow-lg">
            {filters.q ? `Résultats pour "${filters.q}"` : 'Catalogue'}
          </h1>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center gap-2 px-4 py-2 border-2 border-accent-400 rounded-xl text-base font-semibold bg-white/80 shadow hover:bg-accent-50 transition">
          <SlidersHorizontal className="w-5 h-5 text-accent-400" /> Filtres
        </button>
      </div>

      <div className="flex gap-12 items-start">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-72 flex-shrink-0`}>
          <div className="bg-gradient-to-br from-white via-primary-50 to-accent-50 rounded-2xl border-2 border-accent-100 p-7 space-y-7 sticky top-24 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif font-bold text-primary-900 text-lg">Filtres</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-red-500 flex items-center gap-1 font-semibold hover:underline">
                  <X className="w-3 h-3" /> Réinitialiser
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-accent-700 mb-2">Recherche</label>
              <input type="text" value={filters.q} onChange={(e) => { setFilters({...filters, q: e.target.value}); setPage(0); }}
                placeholder="Mot-clé..." className="w-full px-4 py-2 border-2 border-accent-100 rounded-lg text-base bg-white/80 shadow focus:ring-2 focus:ring-accent-200" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-accent-700 mb-2">Catégorie</label>
              <select value={filters.categoryId} onChange={(e) => { setFilters({...filters, categoryId: e.target.value}); setPage(0); }}
                className="w-full px-4 py-2 border-2 border-accent-100 rounded-lg text-base bg-white/80 shadow">
                <option value="">Toutes</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-accent-700 mb-2">Prix (DT)</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={filters.minPrice}
                  onChange={(e) => { setFilters({...filters, minPrice: e.target.value}); setPage(0); }}
                  className="w-1/2 px-3 py-2 border-2 border-accent-100 rounded-lg text-base bg-white/80 shadow" />
                <input type="number" placeholder="Max" value={filters.maxPrice}
                  onChange={(e) => { setFilters({...filters, maxPrice: e.target.value}); setPage(0); }}
                  className="w-1/2 px-3 py-2 border-2 border-accent-100 rounded-lg text-base bg-white/80 shadow" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-accent-700 mb-2">Trier par</label>
              <select value={filters.sort} onChange={(e) => { setFilters({...filters, sort: e.target.value}); setPage(0); }}
                className="w-full px-4 py-2 border-2 border-accent-100 rounded-lg text-base bg-white/80 shadow">
                <option value="">Nouveautés</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="popular">Popularité</option>
                <option value="rating">Meilleure note</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-base cursor-pointer font-semibold text-accent-700">
              <input type="checkbox" checked={filters.promo === 'true'}
                onChange={(e) => { setFilters({...filters, promo: e.target.checked ? 'true' : ''}); setPage(0); }}
                className="rounded border-accent-300 text-accent-600 focus:ring-accent-500" />
              Promotions uniquement
            </label>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <Spinner />
          ) : products.length === 0 ? (
            <EmptyState icon={Package} title="Aucun produit trouvé" subtitle="Essayez de modifier vos filtres" />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
                {products.map((p: any, i: number) => (
                  <div key={p.id} className={i % 2 === 0 ? 'translate-y-2' : '-translate-y-2'}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                    className="px-6 py-2 border-2 border-accent-200 rounded-xl text-base font-semibold bg-white/80 shadow disabled:opacity-30 hover:bg-accent-50 transition">Précédent</button>
                  <span className="text-base text-accent-700 px-6 font-mono">Page {page + 1} / {totalPages}</span>
                  <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
                    className="px-6 py-2 border-2 border-accent-200 rounded-xl text-base font-semibold bg-white/80 shadow disabled:opacity-30 hover:bg-accent-50 transition">Suivant</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
