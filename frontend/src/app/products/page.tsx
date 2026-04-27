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
    <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#131921]">
            {filters.q ? `Résultats pour "${filters.q}"` : 'Catalogue'}
          </h1>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center gap-2 px-3 py-2 border border-[#febd69] rounded-sm text-sm font-semibold bg-white shadow hover:bg-[#f7ca6c]/30 transition">
          <SlidersHorizontal className="w-4 h-4 text-[#febd69]" /> Filtres
        </button>
      </div>

      <div className="flex gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-60 flex-shrink-0`}>
          <div className="bg-white border border-[#ddd] p-5 space-y-5 sticky top-20 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-[#131921] text-base">Filtres</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-[#b12704] flex items-center gap-1 font-semibold hover:underline">
                  <X className="w-3 h-3" /> Réinitialiser
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#232f3e] mb-1">Recherche</label>
              <input type="text" value={filters.q} onChange={(e) => { setFilters({...filters, q: e.target.value}); setPage(0); }}
                placeholder="Mot-clé..." className="w-full px-3 py-2 border border-[#ddd] rounded-sm text-sm bg-white shadow-sm focus:ring-2 focus:ring-[#febd69]" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#232f3e] mb-1">Catégorie</label>
              <select value={filters.categoryId} onChange={(e) => { setFilters({...filters, categoryId: e.target.value}); setPage(0); }}
                className="w-full px-3 py-2 border border-[#ddd] rounded-sm text-sm bg-white shadow-sm">
                <option value="">Toutes</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#232f3e] mb-1">Prix (DT)</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={filters.minPrice}
                  onChange={(e) => { setFilters({...filters, minPrice: e.target.value}); setPage(0); }}
                  className="w-1/2 px-2 py-2 border border-[#ddd] rounded-sm text-sm bg-white shadow-sm" />
                <input type="number" placeholder="Max" value={filters.maxPrice}
                  onChange={(e) => { setFilters({...filters, maxPrice: e.target.value}); setPage(0); }}
                  className="w-1/2 px-2 py-2 border border-[#ddd] rounded-sm text-sm bg-white shadow-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#232f3e] mb-1">Trier par</label>
              <select value={filters.sort} onChange={(e) => { setFilters({...filters, sort: e.target.value}); setPage(0); }}
                className="w-full px-3 py-2 border border-[#ddd] rounded-sm text-sm bg-white shadow-sm">
                <option value="">Nouveautés</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="popular">Popularité</option>
                <option value="rating">Meilleure note</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer font-semibold text-[#232f3e]">
              <input type="checkbox" checked={filters.promo === 'true'}
                onChange={(e) => { setFilters({...filters, promo: e.target.checked ? 'true' : ''}); setPage(0); }}
                className="rounded border-[#febd69] text-[#b12704] focus:ring-[#febd69]" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p: any) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                    className="px-4 py-2 border border-[#febd69] rounded-sm text-sm font-semibold bg-white shadow disabled:opacity-30 hover:bg-[#f7ca6c]/30 transition">Précédent</button>
                  <span className="text-sm text-[#232f3e] px-4">Page {page + 1} / {totalPages}</span>
                  <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
                    className="px-4 py-2 border border-[#febd69] rounded-sm text-sm font-semibold bg-white shadow disabled:opacity-30 hover:bg-[#f7ca6c]/30 transition">Suivant</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
