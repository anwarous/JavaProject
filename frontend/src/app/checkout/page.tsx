'use client';
import { useEffect, useState } from 'react';
import { cartAPI, ordersAPI, addressesAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Spinner } from '@/components';
import { MapPin, Plus, Check, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<any>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({ street: '', city: '', zipCode: '', country: 'Tunisie', primary: false });

  useEffect(() => {
    if (!user) { router.push('/auth'); return; }
    Promise.all([
      cartAPI.get(),
      addressesAPI.getAll(),
    ]).then(([cartRes, addrRes]) => {
      setCart(cartRes.data);
      setAddresses(addrRes.data);
      const primary = addrRes.data.find((a: any) => a.primary);
      if (primary) setSelectedAddress(primary.id);
      else if (addrRes.data.length > 0) setSelectedAddress(addrRes.data[0].id);
    }).finally(() => setLoading(false));
  }, [user]);

  const addAddress = async () => {
    try {
      const res = await addressesAPI.create(newAddr);
      setAddresses([...addresses, res.data]);
      setSelectedAddress(res.data.id);
      setShowNewAddress(false);
      setNewAddr({ street: '', city: '', zipCode: '', country: 'Tunisie', primary: false });
    } catch (err: any) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const placeOrder = async () => {
    if (!selectedAddress) { alert('Sélectionnez une adresse de livraison'); return; }
    setPlacing(true);
    try {
      const res = await ordersAPI.place({ addressId: selectedAddress });
      setOrderPlaced(res.data);
    } catch (err: any) { alert(err.response?.data?.message || 'Erreur lors de la commande'); }
    finally { setPlacing(false); }
  };

  if (loading) return <Spinner />;

  // Order confirmation
  if (orderPlaced) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Commande confirmée !</h1>
        <p className="text-gray-500 mb-2">Numéro : <span className="font-mono font-bold text-gray-900">{orderPlaced.orderNumber}</span></p>
        <p className="text-gray-500 mb-8">Total : <span className="font-bold text-gray-900">{orderPlaced.totalTTC?.toFixed(2)} DT</span></p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => router.push('/account')} className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
            Suivre ma commande
          </button>
          <button onClick={() => router.push('/products')} className="px-6 py-3 border rounded-lg font-medium hover:bg-gray-50 transition">
            Continuer mes achats
          </button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items?.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Finaliser la commande</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Address Selection */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-primary-600" /> Adresse de livraison</h2>
            {addresses.length === 0 && !showNewAddress ? (
              <p className="text-sm text-gray-400 mb-4">Aucune adresse enregistrée</p>
            ) : (
              <div className="space-y-3 mb-4">
                {addresses.map((addr: any) => (
                  <label key={addr.id} className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition ${selectedAddress === addr.id ? 'border-primary-500 bg-primary-50' : 'hover:border-gray-300'}`}>
                    <input type="radio" name="address" checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)} className="mt-1 text-primary-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{addr.street}</p>
                      <p className="text-sm text-gray-500">{addr.city}, {addr.zipCode} — {addr.country}</p>
                      {addr.primary && <span className="text-xs text-primary-600 font-medium">Adresse principale</span>}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {showNewAddress ? (
              <div className="border rounded-xl p-4 space-y-3">
                <input type="text" placeholder="Rue" value={newAddr.street} onChange={e => setNewAddr({...newAddr, street: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Ville" value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm" />
                  <input type="text" placeholder="Code postal" value={newAddr.zipCode} onChange={e => setNewAddr({...newAddr, zipCode: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div className="flex gap-2">
                  <button onClick={addAddress} className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg">Ajouter</button>
                  <button onClick={() => setShowNewAddress(false)} className="px-4 py-2 border text-sm rounded-lg">Annuler</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowNewAddress(true)} className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium">
                <Plus className="w-4 h-4" /> Nouvelle adresse
              </button>
            )}
          </div>

          {/* Order Items Preview */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-primary-600" /> Articles ({cart.items.length})</h2>
            <div className="space-y-3">
              {cart.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                    {item.productImage && <img src={item.productImage} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.productName}</p>
                    <p className="text-gray-400">x{item.quantity}</p>
                  </div>
                  <span className="font-medium">{item.lineTotal?.toFixed(2)} DT</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border p-6 h-fit sticky top-20">
          <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Sous-total</span><span>{cart.subtotal?.toFixed(2)} DT</span></div>
            {cart.discount > 0 && <div className="flex justify-between text-green-600"><span>Remise</span><span>-{cart.discount?.toFixed(2)} DT</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Livraison</span><span>{cart.shippingFee > 0 ? cart.shippingFee?.toFixed(2) + ' DT' : 'Gratuite'}</span></div>
            <hr className="my-3" />
            <div className="flex justify-between text-lg font-bold"><span>Total TTC</span><span>{cart.totalTTC?.toFixed(2)} DT</span></div>
          </div>

          <button onClick={placeOrder} disabled={placing || !selectedAddress}
            className="mt-6 w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition disabled:opacity-50">
            {placing ? 'Traitement...' : 'Confirmer la commande'}
          </button>
        </div>
      </div>
    </div>
  );
}
