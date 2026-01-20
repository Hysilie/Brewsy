/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';
import {
  ChartBar,
  Coins,
  ShoppingCart,
  Package,
  Knife,
  Pill,
  Backpack,
  Briefcase,
  ShieldCheck,
  TShirt,
  Target,
  Fire,
  Pizza,
  ArrowRight,
  Swap,
} from 'phosphor-react';

type OrderItem = {
  recipeId: string;
  recipeName: string;
  recipeCategory: string;
  requestedQty: number;
  craftsNeeded: number;
  actualProduction: number;
  surplus: number;
  unitPrice: number;
  totalPrice: number;
};

type Order = {
  id: string;
  groupId: string;
  groupName: string;
  personName?: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: any;
  completedAt?: any;
  status: 'pending' | 'completed';
};

// type MaterialStock = {
//   id: string;
//   materialId: string;
//   materialName: string;
//   quantity: number;
//   unit: string;
//   speciality?: string;
// };

type LaundryEntry = {
  id: string;
  dirtyAmount: number;
  percentage: number;
  cleanAmount: number;
  forPatron: boolean;
  createdAt: any;
};

// Icon mapping function
const getRecipeIcon = (recipeName: string, category: string) => {
  const name = recipeName.toLowerCase();
  if (name.includes('tenue de stagiaire')) return TShirt;
  if (name.includes('tec-9') || name.includes('pistolet')) return Target;
  if (name.includes('bombe') || name.includes('lance-')) return Fire;
  if (name.includes('baume') || name.includes('antistress')) return Pill;
  if (name.includes('mre')) return Pizza;
  if (name.includes('couteau') || name.includes('lame')) return Knife;
  if (name.includes('bouclier') || name.includes('protection')) return ShieldCheck;
  if (name.includes('pilule') || name.includes('médic') || name.includes('drogue')) return Pill;
  if (name.includes('argent') || name.includes('cash') || name.includes('billet')) return Coins;
  if (name.includes('sac') || name.includes('pochon')) return Backpack;
  if (name.includes('mallette') || name.includes('valise')) return Briefcase;
  if (category.toLowerCase().includes('arme')) return Knife;
  if (category.toLowerCase().includes('drogue')) return Pill;
  if (category.toLowerCase().includes('argent')) return Coins;
  return Package;
};

export const DashboardMalandrPage = () => {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  // const [stocks, setStocks] = useState<MaterialStock[]>([]);
  const [laundryHistory, setLaundryHistory] = useState<LaundryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Load all orders and filter in memory (avoid index requirement)
      const ordersRef = collection(db, 'users', user.uid, 'orders');
      const ordersSnapshot = await getDocs(ordersRef);
      const pendingData: Order[] = [];
      const completedData: Order[] = [];

      ordersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.space === 'malandrinerie') {
          const order = { id: doc.id, ...data } as Order;
          if (data.status === 'pending') {
            pendingData.push(order);
          } else if (data.status === 'completed') {
            completedData.push(order);
          }
        }
      });

      // Sort in memory
      pendingData.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      completedData.sort((a, b) => (b.completedAt?.toMillis() || 0) - (a.completedAt?.toMillis() || 0));

      setPendingOrders(pendingData);
      setCompletedOrders(completedData);

      // Load stocks
      // const stocksRef = collection(db, 'users', user.uid, 'materialStocks');
      // const stocksQuery = query(stocksRef);
      // const stocksSnapshot = await getDocs(stocksQuery);
      // const stocksData: MaterialStock[] = [];
      // stocksSnapshot.forEach((doc) => {
      //   const data = doc.data();
      //   if (data.space === 'malandrinerie') {
      //     stocksData.push({
      //       id: doc.id,
      //       materialId: data.materialId,
      //       materialName: data.materialName,
      //       quantity: data.quantity || 0,
      //       unit: data.unit || 'unité',
      //       speciality: data.speciality,
      //     });
      //   }
      // });

      // Load laundry history
      const laundryRef = collection(db, 'users', user.uid, 'laundryHistory');
      const laundryQuery = query(laundryRef, orderBy('createdAt', 'desc'));
      const laundrySnapshot = await getDocs(laundryQuery);
      const laundryData: LaundryEntry[] = [];
      laundrySnapshot.forEach((doc) => {
        laundryData.push({ id: doc.id, ...doc.data() } as LaundryEntry);
      });
      setLaundryHistory(laundryData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalGains = () => {
    return completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  };

  const getLaundryBalance = () => {
    const totalDirty = laundryHistory.reduce((sum, entry) => sum + entry.dirtyAmount, 0);
    const totalClean = laundryHistory.reduce((sum, entry) => sum + entry.cleanAmount, 0);
    const owedToPatron = totalDirty * 0.5;
    return totalClean - owedToPatron;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-muted">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ChartBar size={32} weight="duotone" style={{ color: '#F4A583' }} />
        <h1 className="text-3xl font-bold" style={{ color: '#5C4A3A' }}>Dashboard - Malandrinerie</h1>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total gains */}
        <div
          className="p-4 rounded transition-all"
          style={{
            backgroundColor: '#D9EDD5',
            border: '1px solid #C8E0C4',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6B9D66'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#C8E0C4'}
          onClick={() => navigate('/malandrinerie/history')}
        >
          <div className="flex items-center gap-2 mb-2">
            <Coins size={24} weight="duotone" style={{ color: '#6B9D66' }} />
            <p className="text-xs font-semibold" style={{ color: '#5C7A58' }}>
              Gains des ventes
            </p>
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: '#4A6B47' }}>
            {getTotalGains().toLocaleString()}$
          </p>
          <p className="text-xs" style={{ color: '#6B9D66' }}>
            {completedOrders.length} commande{completedOrders.length > 1 ? 's' : ''} validée{completedOrders.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Pending orders */}
        <div
          className="p-4 rounded transition-all"
          style={{
            backgroundColor: '#FFF0E6',
            border: '1px solid #EADFD8',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#F4A583'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#EADFD8'}
          onClick={() => navigate('/malandrinerie/orders')}
        >
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart size={24} weight="duotone" style={{ color: '#D4846A' }} />
            <p className="text-xs font-semibold" style={{ color: '#A08876' }}>
              Commandes en cours
            </p>
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: '#5C4A3A' }}>
            {pendingOrders.length}
          </p>
          <p className="text-xs" style={{ color: '#D4846A' }}>
            {pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}$ en attente
          </p>
        </div>

        {/* Laundry balance */}
        <div
          className="p-4 rounded transition-all"
          style={{
            backgroundColor: laundryHistory.length === 0 ? '#FFFBF8' : '#FFFBF8',
            border: laundryHistory.length === 0 ? '1px solid #EADFD8' : (getLaundryBalance() >= 0 ? '1px solid #C8E0C4' : '1px solid #FFD4C4'),
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            if (laundryHistory.length === 0) {
              e.currentTarget.style.borderColor = '#F4A583';
            } else {
              e.currentTarget.style.borderColor = getLaundryBalance() >= 0 ? '#6B9D66' : '#D4846A';
            }
          }}
          onMouseLeave={(e) => {
            if (laundryHistory.length === 0) {
              e.currentTarget.style.borderColor = '#EADFD8';
            } else {
              e.currentTarget.style.borderColor = getLaundryBalance() >= 0 ? '#C8E0C4' : '#FFD4C4';
            }
          }}
          onClick={() => navigate('/malandrinerie/laundry')}
        >
          <div className="flex items-center gap-2 mb-2">
            <Swap size={24} weight="duotone" style={{ color: laundryHistory.length === 0 ? '#D4A88F' : (getLaundryBalance() >= 0 ? '#6B9D66' : '#D4846A') }} />
            <p className="text-xs font-semibold" style={{ color: '#A08876' }}>
              Balance blanchiment
            </p>
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: laundryHistory.length === 0 ? '#A08876' : (getLaundryBalance() >= 0 ? '#4A6B47' : '#D4846A') }}>
            {laundryHistory.length === 0 ? '0$' : `${getLaundryBalance() >= 0 ? '+' : ''}${getLaundryBalance().toLocaleString()}$`}
          </p>
          <p className="text-xs" style={{ color: laundryHistory.length === 0 ? '#A08876' : (getLaundryBalance() >= 0 ? '#6B9D66' : '#D4846A') }}>
            {laundryHistory.length === 0 ? 'Aucune opération' : (getLaundryBalance() >= 0 ? 'Positif' : 'Dette patron')}
          </p>
        </div>
      </div>

      {/* Pending orders list */}
      {pendingOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold" style={{ color: '#5C4A3A' }}>
              Commandes en cours
            </h2>
            <button
              onClick={() => navigate('/malandrinerie/orders')}
              className="text-xs font-semibold flex items-center gap-1 transition-all"
              style={{ color: '#F4A583' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#D4846A'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#F4A583'}
            >
              Voir tout
              <ArrowRight size={14} weight="bold" />
            </button>
          </div>

          <div className="space-y-2">
            {pendingOrders.slice(0, 5).map(order => (
              <div
                key={order.id}
                className="p-3 rounded flex items-center justify-between transition-all"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EADFD8',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#F4A583'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#EADFD8'}
                onClick={() => navigate('/malandrinerie/orders')}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingCart size={16} weight="fill" style={{ color: '#F4A583' }} />
                    <span className="font-semibold text-sm" style={{ color: '#5C4A3A' }}>
                      {order.personName || order.groupName}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ backgroundColor: '#FFF0E6', color: '#5C4A3A' }}
                    >
                      En cours
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs" style={{ color: '#A08876' }}>
                      {order.items.length} article{order.items.length > 1 ? 's' : ''}
                    </p>
                    <div className="flex gap-1">
                      {order.items.slice(0, 3).map((item, idx) => {
                        const Icon = getRecipeIcon(item.recipeName, item.recipeCategory);
                        return <Icon key={idx} size={12} weight="duotone" style={{ color: '#F4A583' }} />;
                      })}
                      {order.items.length > 3 && (
                        <span className="text-xs" style={{ color: '#A08876' }}>+{order.items.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ color: '#5C4A3A' }}>
                    {order.totalAmount.toLocaleString()}$
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent completed orders */}
      {completedOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold" style={{ color: '#5C4A3A' }}>
              Dernières commandes validées
            </h2>
            <button
              onClick={() => navigate('/malandrinerie/history')}
              className="text-xs font-semibold flex items-center gap-1 transition-all"
              style={{ color: '#6B9D66' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#4A6B47'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6B9D66'}
            >
              Voir l'historique
              <ArrowRight size={14} weight="bold" />
            </button>
          </div>

          <div className="space-y-2">
            {completedOrders.slice(0, 3).map(order => (
              <div
                key={order.id}
                className="p-3 rounded flex items-center justify-between transition-all"
                style={{
                  backgroundColor: '#F9FCF8',
                  border: '1px solid #D9EDD5',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#C8E0C4'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D9EDD5'}
                onClick={() => navigate('/malandrinerie/history')}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingCart size={16} weight="fill" style={{ color: '#6B9D66' }} />
                    <span className="font-semibold text-sm" style={{ color: '#5C4A3A' }}>
                      {order.personName || order.groupName}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ backgroundColor: '#D9EDD5', color: '#4A6B47' }}
                    >
                      Validée
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: '#A08876' }}>
                    {order.items.length} article{order.items.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ color: '#6B9D66' }}>
                    +{order.totalAmount.toLocaleString()}$
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {pendingOrders.length === 0 && completedOrders.length === 0 && (
        <div
          className="text-center py-12 rounded"
          style={{
            backgroundColor: '#FFFBF8',
            border: '1px solid #EADFD8'
          }}
        >
          <ShoppingCart size={48} weight="duotone" style={{ color: '#D4A88F', margin: '0 auto 16px' }} />
          <p className="font-semibold mb-2" style={{ color: '#5C4A3A' }}>
            Aucune commande
          </p>
          <p className="text-sm mb-4" style={{ color: '#A08876' }}>
            Créez votre première commande pour commencer
          </p>
          <button
            onClick={() => navigate('/malandrinerie/orders')}
            className="px-4 py-2 rounded-soft text-sm font-medium transition-all"
            style={{
              backgroundColor: '#F4A583',
              color: '#FFFFFF'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D4846A'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F4A583'}
          >
            Créer une commande
          </button>
        </div>
      )}
    </div>
  );
};
