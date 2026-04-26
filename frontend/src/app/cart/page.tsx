'use client';
import { useEffect, useState } from 'react';
import { cartAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Spinner, EmptyState } from '@/components';
import { ShoppingCart, Minus, Plus, Trash2, Tag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { router.push('/auth'); return; }
    fetchCart();
  }, [user]);

  const fetchCart = () => {
    cartAPI.get().then(res => setCart(res.data)).catch(() => {}).finally(() => setLoading(false));
  };

  const updateQty = async (itemId: number, qty: number) => {
    setUpdating(itemId);
    try {
      const res = await cartAPI.updateItem(itemId, { quantity: qty });
      setCart(res.data);
    } catch (err: any) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setUpdating(null); }
  };

  const removeItem = async (itemId: number) => {
    setUpdating(itemId);
    try {
      const res = await cartAPI.removeItem(itemId);
      setCart(res.data);
    } catch {} finally { setUpdating(null); }
  };

  const applyCoupon = async () => {
    setCouponError('');
    try {
      const res = await cartAPI.applyCoupon(couponCode);
      setCart(res.data);
      setCouponCode('');
    } catch (err: any) { setCouponError(err.response?.data?.message || 'Code invalide'); }
  };

  const removeCoupon = async () => {
    try {
      const res = await cartAPI.removeCoupon();
      setCart(res.data);
    } catch {}
  };

  if (loading) return <Spinner />;
  if (!cart || cart.items?.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <EmptyState icon={ShoppingCart} title="Votre panier est vide" subtitle="Parcourez notre catalogue pour trouver vos produits" />
        <div className="text-center mt-6">
          <Link href="/products" className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
            Explorer le catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mon Panier ({cart.items.length} article{cart.items.length > 1 ? 's' : ''})</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item: any) => (
            <div key={item.id} className={`bg-white rounded-xl border p-4 flex gap-4 ${updating === item.id ? 'opacity-50' : ''}`}>
              <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                {item.productImage ? (
                  <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingCart className="w-8 h-8" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.productId}`} className="font-medium text-gray-900 hover:text-primary-600 text-sm">{item.productName}</Link>
                {item.variant && <p className="text-xs text-gray-400 mt-0.5">{item.variant.attribute}: {item.variant.value}</p>}
                <p className="text-sm font-semibold text-gray-900 mt-1">{item.unitPrice?.toFixed(2)} DT</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))} className="p-1.5 hover:bg-gray-50"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} className="p-1.5 hover:bg-gray-50"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm">{item.lineTotal?.toFixed(2)} DT</span>
                    <button onClick={() => removeItem(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border p-6 h-fit sticky top-20">
          <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif</h3>

          {/* Coupon */}
          {!cart.coupon ? (
            <div className="mb-4">
              <div className="flex gap-2">
                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Code promo" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                <button onClick={applyCoupon} disabled={!couponCode}
                  className="px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-30">
                  Appliquer
                </button>
              </div>
              {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
            </div>
          ) : (
            <div className="mb-4 flex items-center justify-between bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">{cart.coupon.code}</span>
              </div>
              <button onClick={removeCoupon} className="text-xs text-red-500">Retirer</button>
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Sous-total</span><span>{cart.subtotal?.toFixed(2)} DT</span></div>
            {cart.discount > 0 && <div className="flex justify-between text-green-600"><span>Remise</span><span>-{cart.discount?.toFixed(2)} DT</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Livraison</span><span>{cart.shippingFee > 0 ? cart.shippingFee?.toFixed(2) + ' DT' : 'Gratuite'}</span></div>
            <hr className="my-3" />
            <div className="flex justify-between text-lg font-bold"><span>Total TTC</span><span>{cart.totalTTC?.toFixed(2)} DT</span></div>
          </div>

          <Link href="/checkout"
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition">
            Commander <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
