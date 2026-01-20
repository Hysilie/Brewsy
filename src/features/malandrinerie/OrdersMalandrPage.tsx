import { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, deleteDoc, doc, serverTimestamp, where, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { Button } from '../../ui/Button';
import { ShoppingCart, Plus, Trash, Check, Knife, Pill, Backpack, Coins, Briefcase, ShieldCheck, Package, TShirt, Target, Fire, Pizza, X } from 'phosphor-react';

type Recipe = {
  id: string;
  name: string;
  emoji: string;
  category: string;
  batchSize: number;
  unitPrice: number;
};

type Group = {
  id: string;
  name: string;
};

type OrderItem = {
  recipeId: string;
  recipeName: string;
  recipeCategory: string;
  requestedQty: number;
  batchSize: number;
  craftsNeeded: number;
  actualProduction: number;
  surplus: number;
  unitPrice: number;
  totalPrice: number;
};

type SavedOrder = {
  id: string;
  groupId: string;
  groupName: string;
  personName?: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: any;
  status: 'pending' | 'completed';
};

// Icon mapping function (same as RecipesMalandrPage)
const getRecipeIcon = (recipeName: string, category: string) => {
  const name = recipeName.toLowerCase();

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
  if (category.toLowerCase().includes('arme')) return Knife;
  if (category.toLowerCase().includes('drogue')) return Pill;
  if (category.toLowerCase().includes('argent')) return Coins;

  // Default fallback
  return Package;
};

export const OrdersMalandrPage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [savedOrders, setSavedOrders] = useState<SavedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Current order being created
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [personName, setPersonName] = useState<string>('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<string>('');
  const [requestedQty, setRequestedQty] = useState<string>('');

  // Order details modal
  const [viewingOrder, setViewingOrder] = useState<SavedOrder | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Load recipes
      const recipesRef = collection(db, 'configs', 'default', 'spaces', 'malandrinerie', 'recipes');
      const recipesSnapshot = await getDocs(query(recipesRef));
      const recipesData: Recipe[] = [];
      recipesSnapshot.forEach((doc) => {
        recipesData.push({ id: doc.id, ...doc.data() } as Recipe);
      });
      recipesData.sort((a, b) => a.name.localeCompare(b.name));
      setRecipes(recipesData);

      // Load groups
      const groupsRef = collection(db, 'configs', 'default', 'spaces', 'malandrinerie', 'groups');
      const groupsSnapshot = await getDocs(query(groupsRef));
      const groupsData: Group[] = [];
      groupsSnapshot.forEach((doc) => {
        groupsData.push({ id: doc.id, ...doc.data() } as Group);
      });
      setGroups(groupsData);

      // Load saved orders
      const ordersRef = collection(db, 'users', user.uid, 'orders');
      const ordersQuery = query(ordersRef, where('space', '==', 'malandrinerie'), where('status', '==', 'pending'));
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData: SavedOrder[] = [];
      ordersSnapshot.forEach((docSnap) => {
        ordersData.push({ id: docSnap.id, ...docSnap.data() } as SavedOrder);
      });
      ordersData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      setSavedOrders(ordersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItemToOrder = () => {
    if (!selectedRecipe || !requestedQty || parseInt(requestedQty) <= 0) return;

    const recipe = recipes.find(r => r.id === selectedRecipe);
    if (!recipe) return;

    const qty = parseInt(requestedQty);
    const craftsNeeded = Math.ceil(qty / recipe.batchSize);
    const actualProduction = craftsNeeded * recipe.batchSize;
    const surplus = actualProduction - qty;
    const totalPrice = actualProduction * recipe.unitPrice;

    const newItem: OrderItem = {
      recipeId: recipe.id,
      recipeName: recipe.name,
      recipeCategory: recipe.category,
      requestedQty: qty,
      batchSize: recipe.batchSize,
      craftsNeeded,
      actualProduction,
      surplus,
      unitPrice: recipe.unitPrice,
      totalPrice,
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedRecipe('');
    setRequestedQty('');
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateItemPrice = (index: number, newPrice: number) => {
    const updatedItems = [...orderItems];
    updatedItems[index].unitPrice = newPrice;
    updatedItems[index].totalPrice = newPrice * updatedItems[index].actualProduction;
    setOrderItems(updatedItems);
  };

  const getTotalOrder = () => {
    return orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const saveOrder = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !selectedGroup || orderItems.length === 0) return;

      const isPersonal = selectedGroup === 'person';
      if (isPersonal && !personName.trim()) return;

      const groupData = isPersonal
        ? { id: 'person', name: personName.trim() }
        : groups.find(g => g.id === selectedGroup);

      if (!groupData) return;

      const orderData = {
        userId: user.uid,
        space: 'malandrinerie',
        groupId: groupData.id,
        groupName: groupData.name,
        ...(isPersonal && { personName: personName.trim() }),
        items: orderItems,
        totalAmount: getTotalOrder(),
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'users', user.uid, 'orders'), orderData);

      // Reset form
      setOrderItems([]);
      setSelectedGroup('');
      setPersonName('');

      // Reload orders
      loadData();
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await deleteDoc(doc(db, 'users', user.uid, 'orders', orderId));
      loadData();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const validateOrder = async (orderId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, 'users', user.uid, 'orders', orderId), {
        status: 'completed',
        completedAt: serverTimestamp(),
      });

      setViewingOrder(null);
      loadData();
    } catch (error) {
      console.error('Error validating order:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-muted">Chargement...</p>
      </div>
    );
  }

  const isPersonalOrder = selectedGroup === 'person';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ShoppingCart size={32} weight="duotone" style={{ color: '#F4A583' }} />
        <h1 className="text-3xl font-bold" style={{ color: '#5C4A3A' }}>Commandes</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Order creation (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          {/* New order form - compact */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #EADFD8',
              borderRadius: '8px',
              padding: '16px'
            }}
          >
            <h2 className="font-bold mb-3" style={{ color: '#5C4A3A', fontSize: '16px' }}>
              Nouvelle commande
            </h2>

            {/* Group/Person selector + name inline */}
            <div className="flex gap-2 mb-3">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="flex-1 px-3 py-2 rounded-soft text-sm transition-all"
                style={{
                  border: '1px solid #EADFD8',
                  backgroundColor: '#FFFFFF',
                  color: '#5C4A3A'
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #F4A583';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => e.target.style.border = '1px solid #EADFD8'}
              >
                <option value="">-- Sélectionner --</option>
                <option value="person">Personne (individuel)</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>

              {isPersonalOrder && (
                <input
                  type="text"
                  placeholder="Prénom"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-soft text-sm transition-all"
                  style={{
                    border: '1px solid #EADFD8',
                    backgroundColor: '#FFFFFF',
                    color: '#5C4A3A'
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '1px solid #F4A583';
                    e.target.style.outline = 'none';
                  }}
                  onBlur={(e) => e.target.style.border = '1px solid #EADFD8'}
                />
              )}
            </div>

            {/* Add article - inline */}
            <div className="flex gap-2 mb-3">
              <select
                value={selectedRecipe}
                onChange={(e) => setSelectedRecipe(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-soft text-sm transition-all"
                style={{
                  border: '1px solid #EADFD8',
                  backgroundColor: '#FFFFFF',
                  color: '#5C4A3A'
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #F4A583';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => e.target.style.border = '1px solid #EADFD8'}
              >
                <option value="">Recette...</option>
                {recipes.map(recipe => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name} {recipe.batchSize > 1 ? `(x${recipe.batchSize})` : ''}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="0"
                placeholder="Qté"
                value={requestedQty}
                onChange={(e) => setRequestedQty(e.target.value)}
                className="w-20 px-3 py-1.5 rounded-soft text-sm transition-all"
                style={{
                  border: '1px solid #EADFD8',
                  backgroundColor: '#FFFFFF',
                  color: '#5C4A3A'
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #F4A583';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => e.target.style.border = '1px solid #EADFD8'}
              />

              <button
                onClick={addItemToOrder}
                disabled={!selectedRecipe || !requestedQty}
                className="px-3 py-1.5 rounded-soft text-sm font-medium transition-all disabled:opacity-30"
                style={{
                  backgroundColor: '#D9EDD5',
                  color: '#6B9D66',
                  border: '1px solid #C8E0C4'
                }}
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#C8E0C4')}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D9EDD5'}
              >
                <Plus size={16} weight="bold" />
              </button>
            </div>

            {/* Order items - compact list */}
            {orderItems.length > 0 && (
              <div className="space-y-2">
                {orderItems.map((item, index) => {
                  const Icon = getRecipeIcon(item.recipeName, item.recipeCategory);

                  return (
                    <div
                      key={index}
                      className="p-3 rounded transition-all"
                      style={{
                        backgroundColor: '#FFFBF8',
                        border: '1px solid #EADFD8'
                      }}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <Icon size={20} weight="duotone" style={{ color: '#F4A583', flexShrink: 0, marginTop: '2px' }} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm leading-tight" style={{ color: '#5C4A3A' }}>
                            {item.recipeName}
                          </p>
                          <p className="text-xs leading-tight mt-0.5" style={{ color: '#A08876' }}>
                            {item.requestedQty} demandés • {item.craftsNeeded} craft{item.craftsNeeded > 1 ? 's' : ''} • {item.actualProduction} produits
                            {item.surplus > 0 && (
                              <span style={{ color: '#D4846A' }}> (+{item.surplus} surplus)</span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(index)}
                          className="p-1 rounded transition-all"
                          style={{ color: '#D4846A' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFE8E0'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Trash size={16} weight="bold" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span style={{ color: '#A08876' }}>Prix/u</span>
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-0.5 rounded text-center"
                          style={{
                            border: '1px solid #EADFD8',
                            backgroundColor: '#FFFFFF',
                            color: '#5C4A3A'
                          }}
                        />
                        <span style={{ color: '#A08876' }}>Total</span>
                        <span className="font-bold" style={{ color: '#5C4A3A' }}>
                          {item.totalPrice.toLocaleString()}$
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active orders */}
          {savedOrders.length > 0 && (
            <div>
              <h2 className="font-bold mb-2 text-sm" style={{ color: '#8B7355' }}>
                Commandes en cours ({savedOrders.length})
              </h2>
              <div className="space-y-2">
                {savedOrders.map(order => (
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
                    onClick={() => setViewingOrder(order)}
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
                      <p className="text-xs" style={{ color: '#A08876' }}>
                        {order.items.length} article{order.items.length > 1 ? 's' : ''} • {order.totalAmount.toLocaleString()}$
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteOrder(order.id);
                      }}
                      className="p-1.5 rounded transition-all"
                      style={{ color: '#D4846A' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFE8E0'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Trash size={16} weight="bold" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Summary (1 column) */}
        <div>
          <div
            className="sticky top-4"
            style={{
              backgroundColor: '#FDEAE6',
              border: '1px solid #F4A583',
              borderRadius: '8px',
              padding: '16px'
            }}
          >
            <h2 className="font-bold mb-3 text-sm" style={{ color: '#8B7355' }}>
              Résumé
            </h2>

            {selectedGroup ? (
              <>
                <div className="mb-3 pb-3" style={{ borderBottom: '1px solid #F4C8B8' }}>
                  <p className="text-xs mb-1" style={{ color: '#A08876' }}>
                    {isPersonalOrder ? 'Personne' : 'Groupe'}
                  </p>
                  <p className="font-semibold" style={{ color: '#5C4A3A' }}>
                    {isPersonalOrder ? (personName || '—') : groups.find(g => g.id === selectedGroup)?.name}
                  </p>
                </div>

                <div className="mb-3 pb-3" style={{ borderBottom: '1px solid #F4C8B8' }}>
                  <p className="text-xs mb-1" style={{ color: '#A08876' }}>Articles</p>
                  <p className="font-bold text-xl" style={{ color: '#5C4A3A' }}>
                    {orderItems.length}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-xs mb-1" style={{ color: '#A08876' }}>Total</p>
                  <p className="font-bold text-2xl" style={{ color: '#5C4A3A' }}>
                    {getTotalOrder().toLocaleString()}$
                  </p>
                </div>

                <Button
                  onClick={saveOrder}
                  disabled={orderItems.length === 0 || (isPersonalOrder && !personName.trim())}
                  className="w-full text-sm py-2"
                >
                  <Check size={16} weight="bold" />
                  <span className="ml-1">Enregistrer</span>
                </Button>
              </>
            ) : (
              <p className="text-xs text-center py-6" style={{ color: '#A08876' }}>
                Sélectionnez un groupe ou une personne pour commencer
              </p>
            )}
          </div>
        </div>
      </div>

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
                    {viewingOrder.items.length} article{viewingOrder.items.length > 1 ? 's' : ''}
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
                      <div className="text-sm font-bold" style={{ color: '#5C4A3A' }}>
                        Total: {item.totalPrice.toLocaleString()}$
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer with total and actions */}
            <div
              className="sticky bottom-0 p-4"
              style={{
                backgroundColor: '#FDEAE6',
                borderTop: '1px solid #F4A583'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs mb-1" style={{ color: '#A08876' }}>
                    Total de la commande
                  </p>
                  <p className="text-2xl font-bold" style={{ color: '#5C4A3A' }}>
                    {viewingOrder.totalAmount.toLocaleString()}$
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteOrder(viewingOrder.id);
                    setViewingOrder(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-soft text-sm font-medium transition-all flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: '#FFE8E0',
                    color: '#5C4A3A',
                    border: '1px solid #FFD4C4'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFD4C4'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFE8E0'}
                >
                  <X size={16} weight="bold" />
                  Annuler
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    validateOrder(viewingOrder.id);
                  }}
                  className="flex-1 px-4 py-2 rounded-soft text-sm font-medium transition-all flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: '#D9EDD5',
                    color: '#6B9D66',
                    border: '1px solid #C8E0C4'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C8E0C4'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D9EDD5'}
                >
                  <Check size={16} weight="bold" />
                  Valider
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
