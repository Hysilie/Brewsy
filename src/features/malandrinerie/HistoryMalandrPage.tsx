import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { ClockCounterClockwise, ShoppingCart, Coins, Knife, Pill, Backpack, Briefcase, ShieldCheck, Package, TShirt, Target, Fire, Pizza } from 'phosphor-react';

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

type CompletedOrder = {
  id: string;
  groupId: string;
  groupName: string;
  personName?: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: any;
  completedAt: any;
  status: 'completed';
};

// Icon mapping function (same as RecipesMalandrPage)
const getRecipeIcon = (recipeName: string, category: string) => {
  const name = recipeName?.toLowerCase() || '';
  const cat = category?.toLowerCase() || '';

  // Specific mappings
  if (name.includes('tenue de stagiaire')) return TShirt;
  if (name.includes('tec-9') || name.includes('pistolet')) return Target;
  if (name.includes('bombe') || name.includes('lance-')) return Fire;
  if (name.includes('baume') || name.includes('antistress')) return Pill;
  if (name.includes('mre')) return Pizza;

  // Weapons and tools
  if (name.includes('couteau') || name.includes('lame')) return Knife;
  if (name.includes('bouclier') || name.includes('protection')) return ShieldCheck;

  // Drugs and consumables
  if (name.includes('pilule') || name.includes('médic') || name.includes('drogue')) return Pill;

  // Money and valuables
  if (name.includes('argent') || name.includes('cash') || name.includes('billet')) return Coins;

  // Containers and items
  if (name.includes('sac') || name.includes('pochon')) return Backpack;
  if (name.includes('mallette') || name.includes('valise')) return Briefcase;

  // Default by category
  if (cat.includes('arme')) return Knife;
  if (cat.includes('drogue')) return Pill;
  if (cat.includes('argent')) return Coins;

  // Default fallback
  return Package;
};

export const HistoryMalandrPage = () => {
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingOrder, setViewingOrder] = useState<CompletedOrder | null>(null);

  useEffect(() => {
    loadCompletedOrders();
  }, []);

  const loadCompletedOrders = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      console.log('🔍 [HistoryMalandr] Loading completed orders (no index required)');

      // Load all orders and filter in memory (avoid index requirement)
      const ordersRef = collection(db, 'users', user.uid, 'orders');
      const ordersSnapshot = await getDocs(ordersRef);
      const ordersData: CompletedOrder[] = [];

      ordersSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.space === 'malandrinerie' && data.status === 'completed') {
          ordersData.push({ id: docSnap.id, ...data } as CompletedOrder);
        }
      });

      // Sort in memory by completedAt desc
      ordersData.sort((a, b) => (b.completedAt?.toMillis() || 0) - (a.completedAt?.toMillis() || 0));

      console.log('✅ [HistoryMalandr] Loaded', ordersData.length, 'completed orders');
      setCompletedOrders(ordersData);
    } catch (error) {
      console.error('❌ [HistoryMalandr] Error loading completed orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalGains = () => {
    return completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '—';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-muted">Chargement de l'historique...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ClockCounterClockwise size={32} weight="duotone" style={{ color: '#F4A583' }} />
        <h1 className="text-3xl font-bold" style={{ color: '#5C4A3A' }}>Historique</h1>
      </div>

      {/* Gains summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="p-4 rounded"
          style={{
            backgroundColor: '#D9EDD5',
            border: '1px solid #C8E0C4'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Coins size={20} weight="duotone" style={{ color: '#6B9D66' }} />
            <p className="text-xs font-semibold" style={{ color: '#5C7A58' }}>
              Gains totaux
            </p>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#4A6B47' }}>
            {getTotalGains().toLocaleString()}$
          </p>
        </div>

        <div
          className="p-4 rounded"
          style={{
            backgroundColor: '#FFF0E6',
            border: '1px solid #EADFD8'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart size={20} weight="duotone" style={{ color: '#D4846A' }} />
            <p className="text-xs font-semibold" style={{ color: '#A08876' }}>
              Commandes validées
            </p>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#5C4A3A' }}>
            {completedOrders.length}
          </p>
        </div>

        <div
          className="p-4 rounded"
          style={{
            backgroundColor: '#FFF6F1',
            border: '1px solid #EADFD8'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Package size={20} weight="duotone" style={{ color: '#F4A583' }} />
            <p className="text-xs font-semibold" style={{ color: '#A08876' }}>
              Articles produits
            </p>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#5C4A3A' }}>
            {completedOrders.reduce((sum, order) => sum + order.items.length, 0)}
          </p>
        </div>
      </div>

      {/* Orders list */}
      {completedOrders.length > 0 ? (
        <div className="space-y-2">
          {completedOrders.map(order => (
            <div
              key={order.id}
              className="p-4 rounded transition-all"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #EADFD8',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#F4A583'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#EADFD8'}
              onClick={() => setViewingOrder(order)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart size={18} weight="fill" style={{ color: '#F4A583' }} />
                    <span className="font-semibold" style={{ color: '#5C4A3A' }}>
                      {order.personName || order.groupName}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ backgroundColor: '#D9EDD5', color: '#6B9D66' }}
                    >
                      Validée
                    </span>
                  </div>
                  <p className="text-xs mb-1" style={{ color: '#A08876' }}>
                    {order.items.length} article{order.items.length > 1 ? 's' : ''} • Validée le {formatDate(order.completedAt)}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {order.items.slice(0, 5).map((item, idx) => {
                      const Icon = getRecipeIcon(item.recipeName, item.recipeCategory);
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                          style={{ backgroundColor: '#FFF6F1', color: '#8B7355' }}
                        >
                          <Icon size={12} weight="duotone" style={{ color: '#F4A583' }} />
                          <span>{item.recipeName}</span>
                          <span style={{ color: '#D4846A' }}>×{item.requestedQty}</span>
                        </div>
                      );
                    })}
                    {order.items.length > 5 && (
                      <span className="px-2 py-1 text-xs" style={{ color: '#A08876' }}>
                        +{order.items.length - 5} autre{order.items.length - 5 > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs mb-1" style={{ color: '#A08876' }}>Gain</p>
                  <p className="text-xl font-bold" style={{ color: '#6B9D66' }}>
                    {order.totalAmount.toLocaleString()}$
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="text-center py-12 rounded"
          style={{
            backgroundColor: '#FFFBF8',
            border: '1px solid #EADFD8'
          }}
        >
          <ClockCounterClockwise size={48} weight="duotone" style={{ color: '#D4A88F', margin: '0 auto 16px' }} />
          <p className="font-semibold mb-2" style={{ color: '#5C4A3A' }}>
            Aucune commande validée
          </p>
          <p className="text-sm" style={{ color: '#A08876' }}>
            Les commandes validées apparaîtront ici
          </p>
        </div>
      )}

      {/* Order details modal */}
      {viewingOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setViewingOrder(null)}
        >
          <div
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="sticky top-0 p-4 flex items-center justify-between"
              style={{
                backgroundColor: '#FFF6F1',
                borderBottom: '1px solid #EADFD8'
              }}
            >
              <div className="flex items-center gap-3">
                <ShoppingCart size={24} weight="duotone" style={{ color: '#F4A583' }} />
                <div>
                  <h3 className="font-bold" style={{ color: '#5C4A3A' }}>
                    {viewingOrder.personName || viewingOrder.groupName}
                  </h3>
                  <p className="text-xs" style={{ color: '#A08876' }}>
                    Validée le {formatDate(viewingOrder.completedAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-2 rounded-full transition-all"
                style={{ color: '#A08876' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFE8E0';
                  e.currentTarget.style.color = '#D4846A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#A08876';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                </svg>
              </button>
            </div>

            {/* Items list */}
            <div className="p-4 space-y-3">
              {viewingOrder.items.map((item, index) => {
                const Icon = getRecipeIcon(item.recipeName, item.recipeCategory);

                return (
                  <div
                    key={index}
                    className="p-3 rounded"
                    style={{
                      backgroundColor: '#FFFBF8',
                      border: '1px solid #EADFD8'
                    }}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <Icon size={24} weight="duotone" style={{ color: '#F4A583', flexShrink: 0, marginTop: '2px' }} />
                      <div className="flex-1">
                        <p className="font-semibold" style={{ color: '#5C4A3A' }}>
                          {item.recipeName}
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#A08876' }}>
                          {item.requestedQty} demandés • {item.craftsNeeded} craft{item.craftsNeeded > 1 ? 's' : ''} • {item.actualProduction} produits
                          {item.surplus > 0 && (
                            <span style={{ color: '#D4846A' }}> (+{item.surplus} surplus)</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center justify-between pt-2"
                      style={{ borderTop: '1px solid #EADFD8' }}
                    >
                      <div className="text-xs" style={{ color: '#A08876' }}>
                        <span>Prix unitaire: </span>
                        <span className="font-semibold" style={{ color: '#5C4A3A' }}>
                          {item.unitPrice}$
                        </span>
                      </div>
                      <div className="text-sm font-bold" style={{ color: '#6B9D66' }}>
                        {item.totalPrice.toLocaleString()}$
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer with total */}
            <div
              className="sticky bottom-0 p-4"
              style={{
                backgroundColor: '#D9EDD5',
                borderTop: '1px solid #C8E0C4'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs mb-1" style={{ color: '#5C7A58' }}>
                    Gain total
                  </p>
                  <p className="text-2xl font-bold" style={{ color: '#4A6B47' }}>
                    {viewingOrder.totalAmount.toLocaleString()}$
                  </p>
                </div>
                <div
                  className="px-3 py-1.5 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: '#C8E0C4', color: '#4A6B47' }}
                >
                  Validée
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
