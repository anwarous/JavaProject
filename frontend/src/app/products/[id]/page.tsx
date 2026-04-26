'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productsAPI, cartAPI, reviewsAPI } from '@/lib/api';
import { RatingStars, OrderStatusBadge, Spinner } from '@/components';
import { useAuth } from '@/lib/auth';
import { ShoppingCart, Check, Minus, Plus, Package } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    productsAPI.getById(Number(id)).then(res => {
      setProduct(res.data);
      if (res.data.variants?.length > 0) setSelectedVariant(res.data.variants[0]);
    }).finally(() => setLoading(false));

    reviewsAPI.getByProduct(Number(id), { size: 20 }).then(res => {
      setReviews(res.data.content || []);
    }).catch(() => {});
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { router.push('/auth'); return; }
    setAdding(true);
    try {
      await cartAPI.addItem({ productId: product.id, variantId: selectedVariant?.id, quantity });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur');
    } finally { setAdding(false); }
  };

  if (loading) return <Spinner />;
  if (!product) return <div className="text-center py-20">Produit introuvable</div>;

  const currentPrice = product.promoPrice || product.price;
  const variantPrice = selectedVariant?.priceDelta ? currentPrice + selectedVariant.priceDelta : currentPrice;
  const availableStock = product.stock + (selectedVariant?.additionalStock || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4">
            {product.images?.length > 0 ? (
              <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Package className="w-24 h-24 text-gray-200" /></div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img: string, i: number) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition ${i === selectedImage ? 'border-primary-500' : 'border-transparent hover:border-gray-300'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.seller && (
            <p className="text-sm text-gray-400 mb-2">Vendu par <span className="text-primary-600 font-medium">{product.seller.shopName}</span></p>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <RatingStars rating={product.averageRating || 0} size="md" />
            <span className="text-sm text-gray-500">({product.averageRating?.toFixed(1)}) · {product.totalSold} vendus</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            {product.promoPrice ? (
              <>
                <span className="text-3xl font-bold text-red-600">{variantPrice.toFixed(2)} DT</span>
                <span className="text-xl text-gray-400 line-through">{(product.price + (selectedVariant?.priceDelta || 0)).toFixed(2)} DT</span>
                <span className="bg-red-100 text-red-700 text-sm font-bold px-2 py-0.5 rounded-full">
                  -{Math.round((1 - product.promoPrice / product.price) * 100)}%
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-900">{variantPrice.toFixed(2)} DT</span>
            )}
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {product.variants[0].attribute}
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => (
                  <button key={v.id} onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                      selectedVariant?.id === v.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                    {v.value}
                    {v.priceDelta > 0 && <span className="ml-1 text-xs text-gray-400">+{v.priceDelta} DT</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {product.categories?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {product.categories.map((c: any) => (
                <span key={c.id} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{c.name}</span>
              ))}
            </div>
          )}

          {/* Stock */}
          <p className={`text-sm mb-6 ${availableStock > 5 ? 'text-green-600' : availableStock > 0 ? 'text-amber-600' : 'text-red-600'}`}>
            {availableStock > 5 ? `✓ En stock (${availableStock})` : availableStock > 0 ? `⚠ Plus que ${availableStock} en stock` : '✕ Rupture de stock'}
          </p>

          {/* Quantity + Add to Cart */}
          {user?.role === 'CUSTOMER' && availableStock > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 hover:bg-gray-50"><Minus className="w-4 h-4" /></button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(availableStock, quantity + 1))} className="p-2.5 hover:bg-gray-50"><Plus className="w-4 h-4" /></button>
              </div>
              <button onClick={handleAddToCart} disabled={adding || added}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition ${
                  added ? 'bg-green-600 text-white' : 'bg-primary-600 text-white hover:bg-primary-700'
                } disabled:opacity-60`}>
                {added ? <><Check className="w-5 h-5" /> Ajouté !</> : <><ShoppingCart className="w-5 h-5" /> Ajouter au panier</>}
              </button>
            </div>
          )}
          {!user && (
            <button onClick={() => router.push('/auth')} className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition">
              Connectez-vous pour acheter
            </button>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Avis clients ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun avis pour le moment.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r: any) => (
              <div key={r.id} className="bg-white rounded-xl border p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold">
                      {r.customerName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.customerName}</p>
                      <RatingStars rating={r.rating} size="sm" />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
