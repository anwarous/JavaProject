'use client';
import { useEffect, useState } from 'react';
import { dashboardAPI, ordersAPI, productsAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Spinner, OrderStatusBadge, ProductCard } from '@/components';
import { DollarSign, ShoppingBag, Package, Users, AlertTriangle, TrendingUp, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SellerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'dashboard' | 'orders' | 'products'>('dashboard');
  const [products, setProducts] = useState<any[]>([]);
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null);

  useEffect(() => {
    if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) { router.push('/auth'); return; }

    const dashFn = user.role === 'ADMIN' ? dashboardAPI.admin() : dashboardAPI.seller();
    dashFn.then(res => setDashboard(res.data)).catch(() => {});

    const ordersFn = user.role === 'ADMIN' ? ordersAPI.allOrders({ size: 50 }) : ordersAPI.sellerOrders({ size: 50 });
    ordersFn.then(res => setOrders(res.data.content || [])).catch(() => {});

    if (user.role === 'SELLER') {
      productsAPI.getAll({ sellerId: user.id, size: 50 }).then(res => setProducts(res.data.content || [])).catch(() => {});
    } else {
      productsAPI.getAll({ size: 50 }).then(res => setProducts(res.data.content || [])).catch(() => {});
    }

    setLoading(false);
  }, [user]);

  const updateOrderStatus = async (orderId: number, status: string) => {
    setUpdatingOrder(orderId);
    try {
      const res = await ordersAPI.updateStatus(orderId, status);
      setOrders(orders.map(o => o.id === orderId ? res.data : o));
    } catch (err: any) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setUpdatingOrder(null); }
  };

  if (loading) return <Spinner />;

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Dashboard Admin' : `Dashboard — ${user?.sellerProfile?.shopName || 'Vendeur'}`}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Vue d&apos;ensemble de votre activité</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-8 w-fit">
        {['dashboard', 'orders', 'products'].map(t => (
          <button key={t} onClick={() => setTab(t as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'dashboard' ? 'Vue globale' : t === 'orders' ? 'Commandes' : 'Produits'}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {tab === 'dashboard' && dashboard && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={DollarSign} label="Chiffre d'affaires" value={`${(dashboard.totalRevenue || dashboard.revenue || 0).toFixed(2)} DT`} color="text-green-600 bg-green-50" />
            <StatCard icon={ShoppingBag} label={isAdmin ? "Total commandes" : "Commandes en attente"} value={isAdmin ? dashboard.totalOrders : dashboard.pendingOrders} color="text-blue-600 bg-blue-50" />
            <StatCard icon={Package} label="Produits" value={isAdmin ? dashboard.totalProducts : dashboard.totalProducts} color="text-purple-600 bg-purple-50" />
            {isAdmin ? (
              <StatCard icon={Users} label="Utilisateurs" value={dashboard.totalUsers} color="text-amber-600 bg-amber-50" />
            ) : (
              <StatCard icon={AlertTriangle} label="Stock faible" value={dashboard.lowStockProducts?.length || 0} color="text-red-600 bg-red-50" />
            )}
          </div>

          {/* Top Products */}
          {(dashboard.topProducts || []).length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary-600" /> {isAdmin ? 'Top produits' : 'Stock faible'}</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {(isAdmin ? dashboard.topProducts : dashboard.lowStockProducts || []).slice(0, 5).map((p: any) => (
                  <div key={p.id} className="bg-white rounded-xl border p-4">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{p.totalSold} vendus · Stock: {p.stock}</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">{p.price?.toFixed(2)} DT</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div className="bg-white rounded-xl border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left p-4 font-medium">Commande</th>
                  <th className="text-left p-4 font-medium">Client</th>
                  <th className="text-left p-4 font-medium">Total</th>
                  <th className="text-left p-4 font-medium">Statut</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono font-bold">{order.orderNumber}</td>
                    <td className="p-4">{order.customerName}</td>
                    <td className="p-4 font-medium">{order.totalTTC?.toFixed(2)} DT</td>
                    <td className="p-4"><OrderStatusBadge status={order.status} /></td>
                    <td className="p-4 text-gray-400">{new Date(order.orderDate).toLocaleDateString('fr-FR')}</td>
                    <td className="p-4">
                      {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                        <select value="" onChange={(e) => { if (e.target.value) updateOrderStatus(order.id, e.target.value); }}
                          disabled={updatingOrder === order.id}
                          className="px-2 py-1 border rounded text-xs">
                          <option value="">Changer...</option>
                          {order.status === 'PENDING' && <option value="PAID">Marquer payée</option>}
                          {order.status === 'PAID' && <option value="PROCESSING">En traitement</option>}
                          {order.status === 'PROCESSING' && <option value="SHIPPED">Expédiée</option>}
                          {order.status === 'SHIPPED' && <option value="DELIVERED">Livrée</option>}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && <p className="text-center text-gray-400 py-10">Aucune commande</p>}
        </div>
      )}

      {/* Products Tab */}
      {tab === 'products' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((p: any) => (
              <div key={p.id} className="bg-white rounded-xl border p-4">
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3">
                  {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                <p className="text-xs text-gray-400 mt-1">Stock: {p.stock} · Vendus: {p.totalSold}</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{p.price?.toFixed(2)} DT</p>
                <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${p.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {p.active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            ))}
          </div>
          {products.length === 0 && <p className="text-center text-gray-400 py-10">Aucun produit</p>}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
