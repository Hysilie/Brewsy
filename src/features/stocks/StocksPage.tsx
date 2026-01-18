import { useEffect, useState } from 'react';
import { useAuth } from '../../app/AuthContext';
import { subscribeToStocks, subscribeToPrices, updateStock, addSaleHistoryEntry } from '../../services/firestore';
import { calculateAveragePrice, calculateStockValue } from '../../domain/calculations';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { CRATE_TYPES } from '../../constants/crates';
import type { Stock, Price } from '../../types';

export const StocksPage = () => {
  const { user } = useAuth();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);

  // Sale form state
  const [showSaleForm, setShowSaleForm] = useState<string | null>(null);
  const [saleQuantity, setSaleQuantity] = useState<string>('1');
  const [saleTotalPrice, setSaleTotalPrice] = useState<string>('0');

  // Local state for editing quantities
  const [editingQuantity, setEditingQuantity] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (!user) return;

    const unsubStocks = subscribeToStocks(user.uid, setStocks);
    const unsubPrices = subscribeToPrices(user.uid, setPrices);

    return () => {
      unsubStocks();
      unsubPrices();
    };
  }, [user]);

  const getStock = (crateId: string) => {
    return stocks.find(s => s.crateId === crateId);
  };

  const handleUpdateQuantity = async (crateId: string, label: string, delta: number) => {
    if (!user) return;
    const currentStock = getStock(crateId);
    const newQuantity = Math.max(0, (currentStock?.quantity || 0) + delta);
    await updateStock(user.uid, crateId, newQuantity, label);
  };

  const handleSetQuantity = async (crateId: string, label: string, quantity: number) => {
    if (!user) return;
    await updateStock(user.uid, crateId, Math.max(0, quantity), label);
  };

  const handleOpenSaleForm = (crateId: string) => {
    const stock = getStock(crateId);
    const maxQty = stock?.quantity || 0;
    setShowSaleForm(crateId);
    setSaleQuantity(String(maxQty)); // Par défaut: tout vendre

    // Pré-remplir avec le prix estimé
    const avgPrice = priceMap.get(crateId) || 0;
    setSaleTotalPrice(String(avgPrice * maxQty));
  };

  const handleRecordSale = async (crateId: string, label: string) => {
    const qty = parseInt(saleQuantity) || 0;
    const price = parseInt(saleTotalPrice) || 0;

    if (!user || qty <= 0 || price < 0) return;

    const stock = getStock(crateId);
    if (!stock || stock.quantity < qty) {
      alert('Stock insuffisant');
      return;
    }

    const avgPrice = priceMap.get(crateId) || 0;
    const estimatedValue = avgPrice * qty;

    try {
      // Enregistrer la vente dans l'historique
      await addSaleHistoryEntry(
        user.uid,
        crateId,
        label,
        qty,
        estimatedValue,
        price,
        undefined
      );

      // Déduire du stock
      await updateStock(user.uid, crateId, stock.quantity - qty, label);

      // Réinitialiser le formulaire
      setShowSaleForm(null);
      setSaleQuantity('1');
      setSaleTotalPrice('0');
    } catch (error) {
      console.error('Erreur lors de la vente:', error);
      alert('Erreur lors de l\'enregistrement de la vente');
    }
  };

  const priceMap = new Map(prices.map(p => [p.crateId, calculateAveragePrice(p.values)]));
  const totalValue = CRATE_TYPES.reduce((total, type) => {
    const stock = getStock(type.id);
    const avgPrice = priceMap.get(type.id) || 0;
    return total + calculateStockValue(stock?.quantity || 0, avgPrice);
  }, 0);

  return (
    <div className="space-y-4">
      {/* Header compact */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-800 dark:text-dark-100">Stocks</h1>
        <div className="text-right">
          <div className="text-sm text-dark-600 dark:text-dark-400">Valeur totale</div>
          <div className="text-2xl font-bold text-peach-600 dark:text-peach-400">
            {totalValue.toLocaleString()} $
          </div>
        </div>
      </div>

      {/* Liste compacte */}
      <div className="grid grid-cols-1 gap-3">
        {CRATE_TYPES.map((type) => {
          const stock = getStock(type.id);
          const quantity = stock?.quantity || 0;
          const avgPrice = priceMap.get(type.id) || 0;
          const value = calculateStockValue(quantity, avgPrice);

          return (
            <Card key={type.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Icône + Nom */}
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-3xl">{type.icon}</span>
                    <div>
                      <h3 className="font-semibold text-dark-800 dark:text-dark-100">
                        {type.label}
                      </h3>
                      {avgPrice > 0 && (
                        <div className="text-xs text-dark-500 dark:text-dark-500">
                          {avgPrice.toLocaleString()} $ / caisse
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contrôles quantité */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleUpdateQuantity(type.id, type.label, -10)}
                      className="w-9 h-9 rounded-soft bg-peach-light hover:bg-peach transition-all text-text font-semibold shadow-sm hover:shadow-soft"
                      title="-10"
                    >
                      --
                    </button>
                    <button
                      onClick={() => handleUpdateQuantity(type.id, type.label, -1)}
                      className="w-9 h-9 rounded-soft bg-lavender-light hover:bg-lavender transition-all text-text font-semibold shadow-sm hover:shadow-soft"
                      title="-1"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={editingQuantity[type.id] !== undefined ? editingQuantity[type.id] : quantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditingQuantity(prev => ({ ...prev, [type.id]: value }));
                      }}
                      onBlur={() => {
                        const value = editingQuantity[type.id];
                        if (value !== undefined) {
                          handleSetQuantity(type.id, type.label, parseInt(value) || 0);
                          setEditingQuantity(prev => {
                            const newState = { ...prev };
                            delete newState[type.id];
                            return newState;
                          });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                      className="w-20 text-center px-3 py-2 rounded-soft border border-border bg-card text-text font-semibold shadow-sm focus:ring-2 focus:ring-peach/30 focus:border-peach outline-none transition-all"
                    />
                    <button
                      onClick={() => handleUpdateQuantity(type.id, type.label, 1)}
                      className="w-9 h-9 rounded-soft bg-sage-light hover:bg-sage transition-all text-text font-semibold shadow-sm hover:shadow-soft"
                      title="+1"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleUpdateQuantity(type.id, type.label, 10)}
                      className="w-9 h-9 rounded-soft bg-butter-light hover:bg-butter transition-all text-text font-semibold shadow-sm hover:shadow-soft"
                      title="+10"
                    >
                      ++
                    </button>
                  </div>

                  {/* Valeur */}
                  <div className="text-right min-w-[100px]">
                    <div className="text-lg font-bold text-peach-600 dark:text-peach-400">
                      {value.toLocaleString()} $
                    </div>
                  </div>

                  {/* Bouton Vendre */}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleOpenSaleForm(type.id)}
                    disabled={quantity === 0}
                  >
                    💰 Vendre
                  </Button>
                </div>

                {/* Formulaire de vente (si ouvert) */}
                {showSaleForm === type.id && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-text-muted mb-1">
                          Quantité
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={quantity}
                          value={saleQuantity}
                          onChange={(e) => {
                            const newQty = e.target.value;
                            setSaleQuantity(newQty);
                            // Recalculer le prix estimé automatiquement
                            const qty = parseInt(newQty) || 0;
                            if (qty > 0) {
                              setSaleTotalPrice(String(avgPrice * qty));
                            }
                          }}
                          className="w-full px-3 py-2 rounded-input border border-border bg-card text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-peach/30 focus:border-peach transition-all"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-text-muted mb-1">
                          Prix total récolté
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={saleTotalPrice}
                          onChange={(e) => setSaleTotalPrice(e.target.value)}
                          className="w-full px-3 py-2 rounded-input border border-border bg-card text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-peach/30 focus:border-peach transition-all"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setShowSaleForm(null)}
                      >
                        ✕
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRecordSale(type.id, type.label)}
                      >
                        ✓ Vendre
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
