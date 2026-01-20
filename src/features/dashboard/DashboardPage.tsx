import { useEffect, useState } from "react";
import { useAuth } from "../../app/AuthContext";
import { useSpace } from "../../app/SpaceContext";
import {
  subscribeToStocks,
  subscribeToPrices,
  subscribeToRuns,
  subscribeToHistory,
} from "../../services/firestore";
import {
  calculateTotalStockValue,
  calculateAveragePrice,
  isTransformationReady,
  calculateTimeRemaining,
  formatDuration,
} from "../../domain/calculations";
import { Card, CardContent } from "../../ui/Card";
import { CRATE_TYPES } from "../../constants/crates";
import type { Stock, Price, Run, Transformation, HistoryEntry } from "../../types";
import { useNavigate } from "react-router-dom";
import { getTransformations } from "../../services/firestore";
import { DashboardMalandrPage } from "../malandrinerie/DashboardMalandrPage";

export const DashboardPage = () => {
  const { user } = useAuth();
  const { currentSpace } = useSpace();

  // If in Malandrinerie space, use dedicated dashboard
  if (currentSpace === 'malandrinerie') {
    return <DashboardMalandrPage />;
  }
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const navigate = useNavigate();

  // Real-time timer update
  const [, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!user) return;

    const unsubStocks = subscribeToStocks(user.uid, setStocks);
    const unsubPrices = subscribeToPrices(user.uid, setPrices);
    const unsubRuns = subscribeToRuns(user.uid, setRuns);
    const unsubHistory = subscribeToHistory(user.uid, setHistory);

    return () => {
      unsubStocks();
      unsubPrices();
      unsubRuns();
      unsubHistory();
    };
  }, [user]);

  useEffect(() => {
    const loadTransformations = async () => {
      const data = await getTransformations();
      setTransformations(data);
    };
    loadTransformations();
  }, []);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const totalValue = calculateTotalStockValue(stocks, prices);

  const activeRuns = runs.filter((r) => r.status === "RUNNING");
  const readyRuns = runs.filter((r) => {
    if (r.status === "DONE") return false;
    return isTransformationReady(r.endsAt.toDate());
  });

  const priceMap = new Map(
    prices.map((p) => [p.crateId, calculateAveragePrice(p.values)]),
  );

  const getStock = (crateId: string) => {
    return stocks.find((s) => s.crateId === crateId);
  };

  const getRunTransformation = (run: Run) => {
    return transformations.find((t) => t.id === run.transformationId);
  };

  const runningRuns = runs.filter((r) => r.status === "RUNNING" && !isTransformationReady(r.endsAt.toDate()));

  // Calculer les gains des ventes récentes (7 derniers jours)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentSales = history.filter((entry) => {
    if (entry.type !== 'SALE') return false;
    const entryDate = entry.createdAt?.toDate();
    return entryDate && entryDate >= sevenDaysAgo;
  });

  const totalRevenue = recentSales.reduce((sum, sale) => {
    if (sale.type !== 'SALE') return sum;
    return sum + sale.actualValue;
  }, 0);

  const totalCratesSold = recentSales.reduce((sum, sale) => {
    if (sale.type !== 'SALE') return sum;
    return sum + sale.quantitySold;
  }, 0);

  // Si on est dans l'espace Malandrinerie, afficher un message
  if (currentSpace === 'malandrinerie') {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-text">Dashboard - Malandrinerie</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">⚔️</div>
            <h2 className="text-xl font-semibold text-text mb-2">
              Espace Malandrinerie
            </h2>
            <p className="text-text-muted mb-4">
              Cet espace est en cours de développement. Les fonctionnalités (Dashboard, Calculettes, Commandes) seront bientôt disponibles !
            </p>
            <div className="inline-block px-4 py-2 bg-peach-light rounded-soft text-peach-dark text-sm">
              À venir prochainement
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header avec stats inline */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Dashboard - Drogue</h1>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Valeur:</span>
            <span className="font-bold text-mint-dark">{totalValue.toLocaleString()} $</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Actives:</span>
            <span className="font-semibold text-mint">{activeRuns.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Prêtes:</span>
            <span className="font-semibold text-mint-dark">{readyRuns.length}</span>
          </div>
        </div>
      </div>

      {/* Alert transformations prêtes */}
      {readyRuns.length > 0 && (
        <div
          className="bg-mint-light border border-mint rounded-soft px-3 py-2 cursor-pointer hover:bg-mint/30 transition-colors"
          onClick={() => navigate("/timers")}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">✓</span>
            <span className="text-sm font-semibold text-mint-dark">
              {readyRuns.length} transformation{readyRuns.length > 1 ? "s" : ""} prête{readyRuns.length > 1 ? "s" : ""} à récolter
            </span>
          </div>
        </div>
      )}

     

      {/* Grid: Stocks + Gains */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Stocks - Table ultra compacte */}
        <Card className="md:col-span-2">
          <CardContent className="p-3">
            <h2 className="text-sm font-semibold text-text mb-2">Stocks</h2>
            <div className="space-y-1.5">
              {CRATE_TYPES.map((type) => {
                const stock = getStock(type.id);
                const quantity = stock?.quantity || 0;
                const avgPrice = priceMap.get(type.id) || 0;
                const value = quantity * avgPrice;

                return (
                  <div
                    key={type.id}
                    className="flex items-center justify-between py-2 px-2 rounded hover:bg-surface transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xl">{type.icon}</span>
                      <div>
                        <div className="text-sm font-semibold text-text">
                          {type.label}
                        </div>
                        <div className="text-xs text-text-muted">
                          {quantity} {quantity > 1 ? 'caisses' : 'caisse'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {avgPrice > 0 ? (
                        <>
                          <div className="text-base font-bold text-peach">
                            {value.toLocaleString()} $
                          </div>
                          <div className="text-xs text-text-muted">
                            {avgPrice.toLocaleString()} $ / u
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-text-muted">
                          Prix non défini
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Gains récents */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-text">7 derniers jours</h2>
              <button
                onClick={() => navigate("/history")}
                className="text-xs text-peach hover:text-peach-dark transition-colors"
              >
                Historique →
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-peach-light rounded-soft border border-peach/30">
                <div className="text-xs text-text-muted mb-1">Revenus</div>
                <div className="text-xl font-bold text-peach">
                  {totalRevenue.toLocaleString()} $
                </div>
              </div>
              <div className="p-3 bg-lavender-light rounded-soft border border-lavender/30">
                <div className="text-xs text-text-muted mb-1">Ventes</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-xl font-bold text-lavender-dark">
                    {recentSales.length}
                  </div>
                  <div className="text-sm text-text-muted">
                    vente{recentSales.length > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-xs text-text-muted mt-1">
                  {totalCratesSold} caisse{totalCratesSold > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

  {/* Transformations en cours */}
      {runningRuns.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-text">En cours</h2>
              <button
                onClick={() => navigate("/timers")}
                className="text-xs text-lavender hover:text-lavender-dark transition-colors"
              >
                Voir tout →
              </button>
            </div>
            <div className="space-y-2">
              {runningRuns.slice(0, 3).map((run) => {
                const transformation = getRunTransformation(run);
                const timeRemaining = calculateTimeRemaining(run.endsAt.toDate());
                const totalDuration = run.durationHours * 60 * 60 * 1000;
                const progress = Math.max(0, Math.min(100, ((totalDuration - timeRemaining) / totalDuration) * 100));

                return (
                  <div key={run.id} className="bg-surface rounded-soft p-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text">
                          {transformation?.name}
                        </span>
                        {run.reducedByAction && <span className="text-xs">⚡</span>}
                      </div>
                      <span className="text-xs font-semibold text-lavender">
                        {formatDuration(timeRemaining)}
                      </span>
                    </div>
                    <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-lavender to-peach transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
