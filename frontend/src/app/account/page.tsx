'use client';
import { useEffect, useState } from 'react';
import { ordersAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Spinner, EmptyState, OrderStatusBadge } from '@/components';
import { Package, ShoppingBag, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { router.push('/auth'); return; }
    ordersAPI.myOrders({ size: 50 }).then(res => setOrders(res.data.content || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const cancelOrder = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;
    setCancelling(id);
    try {
      const res = await ordersAPI.cancel(id);
      setOrders(orders.map(o => o.id === id ? res.data : o));
    } catch (err: any) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setCancelling(null); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mon Compte</h1>
        <p className="text-sm text-gray-500 mt-1">Bienvenue, {user?.firstName} {user?.lastName}</p>
      </div>

      <div className="bg-white rounded-xl border">
        <div className="p-5 border-b">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-600" /> Mes Commandes ({orders.length})
          </h2>
        </div>

        {orders.length === 0 ? (
          <EmptyState icon={Package} title="Aucune commande" subtitle="Votre historique de commandes apparaîtra ici" />
        ) : (
          <div className="divide-y">
            {orders.map((order: any) => (
              <div key={order.id} className="p-5 hover:bg-gray-50 transition">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-bold text-gray-900">{order.orderNumber}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">{new Date(order.orderDate).toLocaleDateString('fr-FR')}</span>
                    <span className="font-bold text-gray-900">{order.totalTTC?.toFixed(2)} DT</span>
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-600">
                      <span>{item.productName} {item.variantInfo ? `(${item.variantInfo})` : ''} × {item.quantity}</span>
                      <span>{item.lineTotal?.toFixed(2)} DT</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-400 mb-2">Livraison : {order.shippingAddress}</p>

                {(order.status === 'PENDING' || order.status === 'PAID') && (
                  <button onClick={() => cancelOrder(order.id)} disabled={cancelling === order.id}
                    className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {cancelling === order.id ? 'Annulation...' : 'Annuler cette commande'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
