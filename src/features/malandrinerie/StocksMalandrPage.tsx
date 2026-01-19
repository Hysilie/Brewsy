import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { Package, Plus, Minus, MagnifyingGlass } from 'phosphor-react';

type MaterialStock = {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  speciality?: string;
};

export const StocksMalandrPage = () => {
  const [stocks, setStocks] = useState<MaterialStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [editingValues, setEditingValues] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const stocksRef = collection(db, 'users', user.uid, 'materialStocks');
      const q = query(stocksRef);
      const snapshot = await getDocs(q);

      const stocksData: MaterialStock[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.space === 'malandrinerie') {
          stocksData.push({
            id: doc.id,
            materialId: data.materialId,
            materialName: data.materialName,
            quantity: data.quantity || 0,
            unit: data.unit || 'unité',
            speciality: data.speciality,
          });
        }
      });

      // Sort by name
      stocksData.sort((a, b) => a.materialName.localeCompare(b.materialName));
      setStocks(stocksData);
    } catch (error) {
      console.error('Error loading stocks:', error);
    } finally {
      setLoading(false);
    }
  };
  console.log(stocks);

  const updateQuantity = async (stockId: string, delta: number) => {
    try {
      setUpdating(stockId);
      const user = auth.currentUser;
      if (!user) return;

      const stock = stocks.find(s => s.id === stockId);
      if (!stock) return;

      const newQuantity = Math.max(0, stock.quantity + delta);

      const stockRef = doc(db, 'users', user.uid, 'materialStocks', stockId);
      await updateDoc(stockRef, {
        quantity: newQuantity,
        updatedAt: serverTimestamp(),
      });

      setStocks(stocks.map(s =>
        s.id === stockId ? { ...s, quantity: newQuantity } : s
      ));
    } catch (error) {
      console.error('Error updating stock:', error);
    } finally {
      setUpdating(null);
    }
  };

  const setQuantity = async (stockId: string, newQuantity: number) => {
    try {
      setUpdating(stockId);
      const user = auth.currentUser;
      if (!user) return;

      const quantity = Math.max(0, newQuantity);

      const stockRef = doc(db, 'users', user.uid, 'materialStocks', stockId);
      await updateDoc(stockRef, {
        quantity,
        updatedAt: serverTimestamp(),
      });

      setStocks(stocks.map(s =>
        s.id === stockId ? { ...s, quantity } : s
      ));
    } catch (error) {
      console.error('Error updating stock:', error);
    } finally {
      setUpdating(null);
    }
  };

  // Get unique specialties
  const specialties = Array.from(new Set(stocks.map(s => s.speciality).filter(Boolean))) as string[];

  // Filter stocks
  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.materialName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || stock.speciality === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-muted">Chargement des stocks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Package size={32} weight="duotone" className="text-peach" />
        <h1 className="text-3xl font-bold text-text">Stocks</h1>
      </div>

      {/* Search bar */}
      <div className="relative">
        <MagnifyingGlass
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: '#A08876' }}
        />
        <input
          type="text"
          placeholder="Rechercher une matière..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-soft text-sm transition-all"
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
      </div>

      {/* Specialty filter chips */}
      {specialties.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSpecialty('all')}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              backgroundColor: selectedSpecialty === 'all' ? '#F4A583' : '#FFF6F1',
              color: selectedSpecialty === 'all' ? '#FFFFFF' : '#8B7355',
              border: selectedSpecialty === 'all' ? '1px solid #F4A583' : '1px solid #EADFD8'
            }}
            onMouseEnter={(e) => {
              if (selectedSpecialty !== 'all') {
                e.currentTarget.style.backgroundColor = '#FFE8D6';
                e.currentTarget.style.borderColor = '#F4A583';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedSpecialty !== 'all') {
                e.currentTarget.style.backgroundColor = '#FFF6F1';
                e.currentTarget.style.borderColor = '#EADFD8';
              }
            }}
          >
            Toutes
          </button>
          {specialties.map(speciality => (
            <button
              key={speciality}
              onClick={() => setSelectedSpecialty(speciality)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                backgroundColor: selectedSpecialty === speciality ? '#F4A583' : '#FFF6F1',
                color: selectedSpecialty === speciality ? '#FFFFFF' : '#8B7355',
                border: selectedSpecialty === speciality ? '1px solid #F4A583' : '1px solid #EADFD8'
              }}
              onMouseEnter={(e) => {
                if (selectedSpecialty !== speciality) {
                  e.currentTarget.style.backgroundColor = '#FFE8D6';
                  e.currentTarget.style.borderColor = '#F4A583';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedSpecialty !== speciality) {
                  e.currentTarget.style.backgroundColor = '#FFF6F1';
                  e.currentTarget.style.borderColor = '#EADFD8';
                }
              }}
            >
              {speciality}
            </button>
          ))}
        </div>
      )}

      {/* Grid of compact stock cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '12px'
        }}
      >
        {filteredStocks.map((stock) => {
          const isUpdating = updating === stock.id;
          const isEmpty = stock.quantity === 0;

          return (
            <div
              key={stock.id}
              className="transition-all"
              style={{
                backgroundColor: isEmpty ? '#FFFBF8' : '#FFFFFF',
                border: '1px solid #EADFD8',
                borderRadius: '8px',
                padding: '12px',
                opacity: isEmpty ? 0.7 : 1,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#F4A583';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(244,165,131,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#EADFD8';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
              }}
            >
              {/* Material name */}
              <div className="text-center mb-2">
                <p
                  className="font-semibold text-sm leading-tight"
                  style={{ color: '#5C4A3A' }}
                >
                  {stock.materialName}
                </p>
              
              </div>

              {/* Quantity controls */}
              <div className="flex items-center justify-center gap-1.5">
                <button
                  onClick={() => updateQuantity(stock.id, -1)}
                  disabled={isUpdating || stock.quantity === 0}
                  className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  style={{ backgroundColor: '#FFE8E0', color: '#D4846A' }}
                  onMouseEnter={(e) => !isUpdating && stock.quantity > 0 && (e.currentTarget.style.backgroundColor = '#FFD4C4')}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFE8E0'}
                  title="Retirer 1"
                >
                  <Minus size={14} weight="bold" />
                </button>

                <input
                  type="number"
                  min="0"
                  value={editingValues.get(stock.id) ?? stock.quantity}
                  onChange={(e) => {
                    const newEditingValues = new Map(editingValues);
                    newEditingValues.set(stock.id, e.target.value);
                    setEditingValues(newEditingValues);
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid #EADFD8';
                    const value = parseInt(e.target.value) || 0;
                    setQuantity(stock.id, value);
                    const newEditingValues = new Map(editingValues);
                    newEditingValues.delete(stock.id);
                    setEditingValues(newEditingValues);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  disabled={isUpdating}
                  className="font-bold text-base text-center rounded transition-all"
                  style={{
                    border: '1px solid #EADFD8',
                    backgroundColor: '#FFFFFF',
                    color: isEmpty ? '#A08876' : '#5C4A3A',
                    width: '100px',
                    padding: '4px'
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '1px solid #F4A583';
                    e.target.style.outline = 'none';
                  }}
                />

                <button
                  onClick={() => updateQuantity(stock.id, 1)}
                  disabled={isUpdating}
                  className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  style={{ backgroundColor: '#D9EDD5', color: '#6B9D66' }}
                  onMouseEnter={(e) => !isUpdating && (e.currentTarget.style.backgroundColor = '#C8E0C4')}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D9EDD5'}
                  title="Ajouter 1"
                >
                  <Plus size={14} weight="bold" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty states */}
      {filteredStocks.length === 0 && stocks.length > 0 && (
        <div className="text-center py-12" style={{ color: '#A08876' }}>
          <p className="mb-2">Aucun résultat</p>
          <p className="text-sm">
            Essayez une autre recherche ou spécialité
          </p>
        </div>
      )}

      {stocks.length === 0 && (
        <div className="text-center py-12" style={{ color: '#A08876' }}>
          <p className="mb-2">Aucun stock trouvé</p>
          <p className="text-sm">
            Initialisez les données depuis la page /setup
          </p>
        </div>
      )}
    </div>
  );
};
