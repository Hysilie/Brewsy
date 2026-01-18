import type { Transformation, Price, Stock } from '../types';

/**
 * Calcule les matériaux nécessaires pour un nombre de transformations
 */
export const calculateMaterialsNeeded = (
  transformation: Transformation,
  numberOfRuns: number
): number => {
  return transformation.input.quantity * numberOfRuns;
};

/**
 * Calcule le nombre d'outils requis (identique au nombre de runs)
 */
export const calculateToolsRequired = (numberOfRuns: number): number => {
  return numberOfRuns;
};

/**
 * Calcule le coût total des outils
 */
export const calculateTotalToolCost = (
  transformation: Transformation,
  numberOfRuns: number
): number => {
  return transformation.tool.price * numberOfRuns;
};

/**
 * Estime le nombre de caisses produites (estimation discrète)
 * Note: Le rendement est variable, donc c'est une estimation
 */
export const calculateEstimatedCrates = (
  _transformation: Transformation,
  numberOfRuns: number
): number => {
  // Estimation: chaque run produit en moyenne assez pour remplir des caisses
  // Le calcul exact dépendrait du rendement réel, mais on estime ici
  return numberOfRuns;
};

/**
 * Calcule la durée effective d'une transformation
 */
export const calculateEffectiveDuration = (
  baseDurationHours: number,
  reducedByAction: boolean,
  timeReductionHours: number = 1
): number => {
  return reducedByAction
    ? baseDurationHours - timeReductionHours
    : baseDurationHours;
};

/**
 * Calcule le prix moyen à partir d'un tableau de prix
 */
export const calculateAveragePrice = (prices: number[]): number => {
  if (prices.length === 0) return 0;
  const sum = prices.reduce((acc, price) => acc + price, 0);
  return Math.round(sum / prices.length);
};

/**
 * Calcule la valeur estimée d'un stock
 */
export const calculateStockValue = (
  quantity: number,
  averagePrice: number
): number => {
  return quantity * averagePrice;
};

/**
 * Calcule la valeur totale de tous les stocks
 */
export const calculateTotalStockValue = (
  stocks: Stock[],
  prices: Price[]
): number => {
  const priceMap = new Map(prices.map(p => [p.crateId, calculateAveragePrice(p.values)]));

  return stocks.reduce((total, stock) => {
    const avgPrice = priceMap.get(stock.crateId) || 0;
    return total + calculateStockValue(stock.quantity, avgPrice);
  }, 0);
};

/**
 * Vérifie si une transformation est terminée
 */
export const isTransformationReady = (endsAt: Date): boolean => {
  return new Date() >= endsAt;
};

/**
 * Calcule le temps restant en millisecondes
 */
export const calculateTimeRemaining = (endsAt: Date): number => {
  return Math.max(0, endsAt.getTime() - Date.now());
};

/**
 * Formate une durée en heures/minutes
 */
export const formatDuration = (milliseconds: number): string => {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
