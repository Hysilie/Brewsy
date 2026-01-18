import { useEffect, useState } from 'react';
import { useAuth } from '../../app/AuthContext';
import { subscribeToPrices, addPrice, deletePrice } from '../../services/firestore';
import { calculateAveragePrice } from '../../domain/calculations';
import { Card, CardContent } from '../../ui/Card';
import { CRATE_TYPES } from '../../constants/crates';
import type { Price } from '../../types';

export const PricesPage = () => {
  const { user } = useAuth();
  const [prices, setPrices] = useState<Price[]>([]);
  const [newPrices, setNewPrices] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToPrices(user.uid, setPrices);
    return unsubscribe;
  }, [user]);

  const getPriceData = (crateId: string) => {
    return prices.find(p => p.crateId === crateId);
  };

  const handleAddPrice = async (crateId: string) => {
    if (!user) return;
    const priceStr = newPrices[crateId];
    const price = parseInt(priceStr);
    if (!price || price <= 0) return;

    await addPrice(user.uid, crateId, price);
    setNewPrices({ ...newPrices, [crateId]: '' });
  };

  const handleDeletePrice = async (crateId: string, index: number) => {
    if (!user) return;
    await deletePrice(user.uid, crateId, index);
  };

  const handleKeyPress = (e: React.KeyboardEvent, crateId: string) => {
    if (e.key === 'Enter') {
      handleAddPrice(crateId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header compact */}
      <h1 className="text-2xl font-bold text-dark-800 dark:text-dark-100">Prix moyens</h1>

      {/* Liste compacte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CRATE_TYPES.map((type) => {
          const priceData = getPriceData(type.id);
          const avgPrice = priceData ? calculateAveragePrice(priceData.values) : 0;
          const minPrice = priceData ? Math.min(...priceData.values) : 0;
          const maxPrice = priceData ? Math.max(...priceData.values) : 0;
          const count = priceData?.values.length || 0;

          return (
            <Card key={type.id}>
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{type.icon}</span>
                    <h3 className="font-semibold text-dark-800 dark:text-dark-100">
                      {type.label}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-peach-600 dark:text-peach-400">
                      {avgPrice > 0 ? `${avgPrice.toLocaleString()} $` : '—'}
                    </div>
                    <div className="text-xs text-dark-500 dark:text-dark-500">
                      {count} prix
                    </div>
                  </div>
                </div>

                {/* Stats inline */}
                {count > 0 && (
                  <div className="flex gap-4 text-xs mb-3 py-2 px-3 bg-butter-50 dark:bg-dark-700 rounded">
                    <div>
                      <span className="text-dark-500 dark:text-dark-500">Min:</span>
                      <span className="ml-1 font-semibold text-sage-600 dark:text-sage-400">
                        {minPrice.toLocaleString()} $
                      </span>
                    </div>
                    <div>
                      <span className="text-dark-500 dark:text-dark-500">Max:</span>
                      <span className="ml-1 font-semibold text-lavender-600 dark:text-lavender-400">
                        {maxPrice.toLocaleString()} $
                      </span>
                    </div>
                  </div>
                )}

                {/* Ajouter un prix */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="number"
                    placeholder="Nouveau prix"
                    value={newPrices[type.id] || ''}
                    onChange={(e) => setNewPrices({ ...newPrices, [type.id]: e.target.value })}
                    onKeyPress={(e) => handleKeyPress(e, type.id)}
                    className="flex-1 px-3 py-1.5 text-sm rounded-input border border-border bg-card text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-peach/30 focus:border-peach transition-all"
                  />
                  <button
                    onClick={() => handleAddPrice(type.id)}
                    className="px-4 py-1.5 text-sm font-semibold rounded-soft bg-linear-to-r from-peach to-lavender hover:from-peach-dark hover:to-lavender-dark text-white transition-all shadow-sm hover:shadow-soft"
                  >
                    +
                  </button>
                </div>

                {/* Liste des prix (compacte, max 3 visibles) */}
                {priceData && priceData.values.length > 0 && (
                  <div className="space-y-1">
                    {priceData.values.slice(0, 3).map((price, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-1 px-2 text-sm   rounded border border-peach/20 bg-peach/20 dark:border-dark-600"
                      >
                        <span className="font-semibold text-dark-800 dark:text-dark-100">
                          {price.toLocaleString()} $
                        </span>
                        <button
                          onClick={() => handleDeletePrice(type.id, index)}
                          className="text-xs px-2 py-0.5 rounded 0 text-dark  dark:hover:bg-red-900/50 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {priceData.values.length > 3 && (
                      <div className="text-xs text-center text-dark-500 dark:text-dark-500 py-1">
                        +{priceData.values.length - 3} autre(s)
                      </div>
                    )}
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
