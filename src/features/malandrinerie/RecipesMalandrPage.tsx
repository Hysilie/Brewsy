import { useState, useEffect } from 'react';
import { collection, query, getDocs, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Scroll, CheckCircle, WarningCircle, MagnifyingGlass, Check, Knife, Pill, Backpack, Coins, Briefcase, ShieldCheck, Package, TShirt, Target, Fire, Pizza } from 'phosphor-react';

type Recipe = {
  id: string;
  name: string;
  emoji: string;
  category: string;
  batchSize: number;
  unitPrice: number;
  materials: Record<string, number>;
};

type ProductionCalc = {
  recipeId: string;
  desiredQty: number;
  craftsNeeded: number;
  actualProduction: number;
  surplus: number;
};

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

export const RecipesMalandrPage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [stocks, setStocks] = useState<Map<string, number>>(new Map());
  const [materialNames, setMaterialNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [calculations, setCalculations] = useState<Map<string, ProductionCalc>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [validating, setValidating] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
      recipesData.sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return a.name.localeCompare(b.name);
      });
      setRecipes(recipesData);

      // Load materials names
      const materialsRef = collection(db, 'configs', 'default', 'spaces', 'malandrinerie', 'materials');
      const materialsSnapshot = await getDocs(query(materialsRef));
      const namesMap = new Map<string, string>();
      materialsSnapshot.forEach((doc) => {
        namesMap.set(doc.id, doc.data().name);
      });
      setMaterialNames(namesMap);

      // Load user stocks
      const stocksRef = collection(db, 'users', user.uid, 'materialStocks');
      const stocksSnapshot = await getDocs(query(stocksRef));
      const stocksMap = new Map<string, number>();
      stocksSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.space === 'malandrinerie') {
          stocksMap.set(data.materialId, data.quantity || 0);
        }
      });
      setStocks(stocksMap);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDesiredQtyChange = (recipeId: string, value: string) => {
    const desiredQty = parseInt(value) || 0;
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const craftsNeeded = Math.ceil(desiredQty / recipe.batchSize);
    const actualProduction = craftsNeeded * recipe.batchSize;
    const surplus = actualProduction - desiredQty;

    setCalculations(new Map(calculations.set(recipeId, {
      recipeId,
      desiredQty,
      craftsNeeded,
      actualProduction,
      surplus,
    })));
  };

  const getMaterialStatus = (recipeId: string, materialId: string, qtyNeeded: number) => {
    const calc = calculations.get(recipeId);
    if (!calc || calc.craftsNeeded === 0) return { sufficient: true, missing: 0 };

    const totalNeeded = qtyNeeded * calc.craftsNeeded;
    const available = stocks.get(materialId) || 0;
    const sufficient = available >= totalNeeded;
    const missing = sufficient ? 0 : totalNeeded - available;

    return { sufficient, missing, totalNeeded, available };
  };

  const isRecipeProducible = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    const calc = calculations.get(recipeId);
    if (!recipe || !calc || calc.craftsNeeded === 0) return true;

    return Object.entries(recipe.materials).every(([matId, qty]) => {
      const status = getMaterialStatus(recipeId, matId, qty);
      return status.sufficient;
    });
  };

  const validateProduction = async (recipeId: string) => {
    try {
      setValidating(recipeId);
      const user = auth.currentUser;
      if (!user) {
        showToast('Vous devez être connecté', 'error');
        return;
      }

      const recipe = recipes.find(r => r.id === recipeId);
      const calc = calculations.get(recipeId);
      if (!recipe || !calc || calc.craftsNeeded === 0) return;

      // Vérifier que la production est possible
      if (!isRecipeProducible(recipeId)) {
        showToast('Stocks insuffisants pour cette production', 'error');
        return;
      }

      // Créer un batch pour transaction atomique
      const batch = writeBatch(db);

      // Calculer les matériaux consommés
      const materialsConsumed: Record<string, number> = {};

      // Décrémenter les stocks
      for (const [matId, qtyPerCraft] of Object.entries(recipe.materials)) {
        const totalNeeded = qtyPerCraft * calc.craftsNeeded;
        materialsConsumed[matId] = totalNeeded;

        const stockRef = doc(db, 'users', user.uid, 'materialStocks', matId);
        const currentStock = stocks.get(matId) || 0;
        const newStock = currentStock - totalNeeded;

        batch.update(stockRef, {
          quantity: newStock,
          updatedAt: serverTimestamp(),
        });
      }

      // Ajouter une entrée dans l'historique
      const historyRef = doc(collection(db, 'users', user.uid, 'productionHistory'));
      batch.set(historyRef, {
        recipeId: recipe.id,
        recipeName: recipe.name,
        recipeEmoji: recipe.emoji,
        space: 'malandrinerie',
        craftsCount: calc.craftsNeeded,
        desiredQty: calc.desiredQty,
        actualProduction: calc.actualProduction,
        materialsConsumed,
        createdAt: serverTimestamp(),
      });

      // Exécuter la transaction
      await batch.commit();

      // Mettre à jour les stocks locaux
      const newStocks = new Map(stocks);
      for (const [matId, consumed] of Object.entries(materialsConsumed)) {
        const current = newStocks.get(matId) || 0;
        newStocks.set(matId, current - consumed);
      }
      setStocks(newStocks);

      // Reset le calcul pour cette recette
      const newCalculations = new Map(calculations);
      newCalculations.delete(recipeId);
      setCalculations(newCalculations);

      showToast(`Production validée : ${calc.actualProduction} ${recipe.name}`, 'success');
    } catch (error) {
      console.error('Error validating production:', error);
      showToast('Erreur lors de la validation', 'error');
    } finally {
      setValidating(null);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Filter recipes by search query (name, emoji, category, or materials)
  const filteredRecipes = recipes.filter(recipe => {
    const query = searchQuery.toLowerCase().trim();

    // Empty search = show all
    if (!query) return true;

    // Search in recipe name (case insensitive)
    if (recipe.name.toLowerCase().includes(query)) return true;

    // Search in emoji (case insensitive)
    if (recipe.emoji.toLowerCase().includes(query)) return true;

    // Search in category (case insensitive)
    if (recipe.category && recipe.category.toLowerCase().includes(query)) return true;

    // Search in materials (case insensitive)
    const materialIds = Object.keys(recipe.materials || {});
    for (const matId of materialIds) {
      const matName = materialNames.get(matId) || '';
      // Search by material name
      if (matName && matName.toLowerCase().includes(query)) {
        console.log('✅ Found match:', recipe.name, 'contains material:', matName);
        return true;
      }
      // Search by material ID
      if (matId && matId.toLowerCase().includes(query)) {
        console.log('✅ Found match:', recipe.name, 'contains material ID:', matId);
        return true;
      }
    }

    return false;
  });

  // Debug: log search results
  if (searchQuery) {
    console.log('🔍 Search query:', searchQuery);
    console.log('📦 Material names loaded:', materialNames.size);
    console.log('📋 Filtered recipes:', filteredRecipes.length, '/', recipes.length);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-muted">Chargement des recettes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-soft shadow-lg border ${
            toast.type === 'success'
              ? 'bg-sage-light border-sage text-sage-dark'
              : 'bg-peach-light border-peach text-peach-dark'
          }`}
        >
          <p className="font-semibold">{toast.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scroll size={32} weight="duotone" className="text-peach" />
          <h1 className="text-3xl font-bold text-text">Recettes</h1>
        </div>
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
          placeholder="Rechercher par nom, catégorie ou matériau..."
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

      {/* Compact list */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto" style={{ backgroundColor: '#FFF6F1' }}>
            <table className="w-full">
              <thead style={{ backgroundColor: '#FFF0E6', borderBottom: '1px solid #EADFD8' }}>
                <tr className="text-xs uppercase" style={{ color: '#A08876' }}>
                  <th className="text-left p-2 font-semibold">Recette</th>
                  <th className="text-center p-2 font-semibold w-20">Qté</th>
                  <th className="text-left p-2 font-semibold">Matériaux nécessaires</th>
                  <th className="text-center p-2 font-semibold w-20">Prix/u</th>
                  <th className="text-center p-2 font-semibold w-24">Prix total</th>
                  <th className="text-center p-2 font-semibold w-16">État</th>
                  <th className="text-center p-2 font-semibold w-24">Action</th>
                </tr>
              </thead>
              <tbody style={{ borderTop: '1px solid #EADFD8' }}>
                {filteredRecipes.map((recipe, index) => {
                  const calc = calculations.get(recipe.id);
                  const producible = isRecipeProducible(recipe.id);

                  return (
                    <tr
                      key={recipe.id}
                      className="transition-colors"
                      style={{
                        backgroundColor: index % 2 === 0 ? '#FFFBF8' : '#FFF6F1',
                        borderBottom: '1px solid #EADFD8'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFE8D6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#FFFBF8' : '#FFF6F1'}
                    >
                      {/* Recipe name */}
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = getRecipeIcon(recipe.name, recipe.category);
                            return <Icon size={24} weight="duotone" style={{ color: '#F4A583' }} />;
                          })()}
                          <div>
                            <p className="font-semibold text-sm" style={{ color: '#5C4A3A' }}>{recipe.name}</p>
                            <p className="text-xs" style={{ color: '#A08876' }}>
                              {recipe.batchSize > 1 ? `x${recipe.batchSize}` : 'Unité'}
                              {recipe.unitPrice > 0 && ` • ${recipe.unitPrice}$`}
                              {recipe.category && ` • ${recipe.category}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Desired quantity */}
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={calc?.desiredQty || ''}
                          onChange={(e) => handleDesiredQtyChange(recipe.id, e.target.value)}
                          className="w-full px-2 py-1 text-sm text-center rounded transition-all"
                          style={{
                            border: '1px solid #EADFD8',
                            backgroundColor: '#FFFFFF'
                          }}
                          onFocus={(e) => {
                            e.target.style.border = '1px solid #F4A583';
                            e.target.style.outline = 'none';
                          }}
                          onBlur={(e) => e.target.style.border = '1px solid #EADFD8'}
                        />
                      </td>

                      {/* Materials */}
                      <td className="p-2">
                        <div className="flex flex-wrap gap-2 text-xs">
                          {Object.entries(recipe.materials).map(([matId, qty]) => {
                            const status = getMaterialStatus(recipe.id, matId, qty);
                            const showStatus = calc && calc.desiredQty > 0;

                            return (
                              <span
                                key={matId}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                                style={{
                                  backgroundColor: showStatus && !status.sufficient ? '#FFE8E0' : '#F5EFE7',
                                  color: showStatus && !status.sufficient ? '#5C7A58' : '#8B7355'
                                }}
                              >
                                {materialNames.get(matId) || matId}: {showStatus ? status.totalNeeded : qty}
                                {showStatus && !status.sufficient && (
                                  <span className="font-semibold ml-1" style={{ color: '#D4846A' }}>
                                    -{status.missing}
                                  </span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Unit price */}
                      <td className="p-2 text-center">
                        {recipe.unitPrice > 0 ? (
                          <span className="text-sm text-text">{recipe.unitPrice}$</span>
                        ) : (
                          <span className="text-xs text-text-muted">-</span>
                        )}
                      </td>

                      {/* Total price */}
                      <td className="p-2 text-center">
                        {calc && calc.desiredQty > 0 && recipe.unitPrice > 0 ? (
                          <span className="text-sm font-semibold text-text">
                            {(calc.desiredQty * recipe.unitPrice).toLocaleString()}$
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-2 text-center">
                        {calc && calc.desiredQty > 0 && (
                          producible ? (
                            <CheckCircle size={20} weight="fill" className="text-sage inline-block" />
                          ) : (
                            <WarningCircle size={20} weight="fill" className="text-peach inline-block" />
                          )
                        )}
                      </td>

                      {/* Action */}
                      <td className="p-2 text-center">
                        {calc && calc.desiredQty > 0 && (
                          <Button
                            onClick={() => validateProduction(recipe.id)}
                            disabled={!producible || validating === recipe.id}
                            className="px-3 py-1 text-xs"
                          >
                            {validating === recipe.id ? (
                              'Validation...'
                            ) : (
                              <>
                                <Check size={14} weight="bold" />
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRecipes.length === 0 && (
            <div className="p-12 text-center text-text-muted">
              <p className="mb-2">
                {searchQuery ? 'Aucune recette ne correspond à votre recherche' : 'Aucune recette trouvée'}
              </p>
              {!searchQuery && (
                <p className="text-sm">
                  Initialisez les données depuis la page /setup
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
