/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useAuth } from '../../app/AuthContext';
import { subscribeToHistory, getTransformations } from '../../services/firestore';
import { Card, CardContent } from '../../ui/Card';
import type { HistoryEntry, Transformation, TransformationHistoryEntry, SaleHistoryEntry } from '../../types';

export const HistoryPage = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [transformations, setTransformations] = useState<Transformation[]>([]);

  useEffect(() => {
    loadTransformations();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToHistory(user.uid, setHistory);
    return unsubscribe;
  }, [user]);

  const loadTransformations = async () => {
    const data = await getTransformations();
    setTransformations(data);
  };

  const getTransformation = (id: string) => {
    return transformations.find(t => t.id === id);
  };

  // Group history by day
  const groupedHistory = history.reduce((groups, entry) => {
    const date = entry.createdAt.toDate().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, HistoryEntry[]>);

  const formatTime = (timestamp: any) => {
    return timestamp.toDate().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (entry: TransformationHistoryEntry) => {
    const start = entry.startedAt.toDate();
    const end = entry.endsAt.toDate();
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    return hours;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-800 dark:text-dark-100">Historique</h1>
        <div className="text-sm text-dark-600 dark:text-dark-400">
          {history.length} entrée{history.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-xs text-dark-600 dark:text-dark-400 mb-1">Total</div>
              <div className="text-2xl font-bold text-peach-600 dark:text-peach-400">
                {history.length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-xs text-dark-600 dark:text-dark-400 mb-1">Transformations</div>
              <div className="text-2xl font-bold text-lavender-600 dark:text-lavender-400">
                {history.filter(h => h.type === 'TRANSFORMATION').length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-xs text-dark-600 dark:text-dark-400 mb-1">Ventes</div>
              <div className="text-2xl font-bold text-sage-600 dark:text-sage-400">
                {history.filter(h => h.type === 'SALE').length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-xs text-dark-600 dark:text-dark-400 mb-1">Cette semaine</div>
              <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                {history.filter(h => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return h.createdAt.toDate() > weekAgo;
                }).length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History by day */}
      <div className="space-y-6">
        {Object.keys(groupedHistory).length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📜</div>
                <p className="text-dark-600 dark:text-dark-400 mb-2">
                  Aucun historique pour le moment
                </p>
                <p className="text-sm text-dark-500 dark:text-dark-500">
                  Les transformations et ventes apparaîtront ici
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedHistory).map(([date, entries]) => (
            <div key={date}>
              <h2 className="text-xl font-bold text-dark-700 dark:text-dark-300 mb-3 capitalize">
                {date}
              </h2>
              <div className="space-y-3">
                {entries.map((entry) => {
                  if (entry.type === 'TRANSFORMATION') {
                    const transformationEntry = entry as TransformationHistoryEntry;
                    const transformation = getTransformation(transformationEntry.transformationId);
                    const duration = calculateDuration(transformationEntry);

                    return (
                      <Card key={entry.id}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-linear-to-br from-lavender-400 to-peach-400 flex items-center justify-center text-white text-sm">
                                  ⚗️
                                </div>
                                <h3 className="text-base font-semibold text-dark-800 dark:text-dark-100">
                                  {transformation?.name || 'Transformation inconnue'}
                                </h3>
                                {transformationEntry.reducedByAction && (
                                  <span className="px-2 py-0.5 bg-sage-100 dark:bg-sage-900/30 text-sage-700 dark:text-sage-300 text-xs rounded-cozy font-semibold">
                                    ⚡
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                <div>
                                  <div className="text-dark-500 dark:text-dark-500 text-xs">Début</div>
                                  <div className="font-semibold text-dark-700 dark:text-dark-300">
                                    {formatTime(transformationEntry.startedAt)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-dark-500 dark:text-dark-500 text-xs">Fin</div>
                                  <div className="font-semibold text-dark-700 dark:text-dark-300">
                                    {formatTime(transformationEntry.endsAt)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-dark-500 dark:text-dark-500 text-xs">Durée</div>
                                  <div className="font-semibold text-dark-700 dark:text-dark-300">
                                    {duration}h
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  } else {
                    // SALE entry
                    const saleEntry = entry as SaleHistoryEntry;
                    const difference = saleEntry.actualValue - saleEntry.estimatedValue;
                    const isDifferent = Math.abs(difference) > 0;

                    return (
                      <Card key={entry.id} className={isDifferent ? "border-l-4 border-l-peach-400" : ""}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-linear-to-br from-sage-400 to-peach-400 flex items-center justify-center text-white text-sm">
                                  💰
                                </div>
                                <h3 className="text-base font-semibold text-dark-800 dark:text-dark-100">
                                  Vente de {saleEntry.crateLabel}
                                </h3>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-2">
                                <div>
                                  <div className="text-dark-500 dark:text-dark-500 text-xs">Quantité</div>
                                  <div className="font-semibold text-dark-700 dark:text-dark-300">
                                    {saleEntry.quantitySold} caisse{saleEntry.quantitySold > 1 ? 's' : ''}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-dark-500 dark:text-dark-500 text-xs">Valeur estimée</div>
                                  <div className="font-semibold text-dark-700 dark:text-dark-300">
                                    {saleEntry.estimatedValue.toLocaleString()} $
                                  </div>
                                </div>
                                <div>
                                  <div className="text-dark-500 dark:text-dark-500 text-xs">Valeur récoltée</div>
                                  <div className={`font-semibold ${
                                    difference > 0
                                      ? 'text-sage-600 dark:text-sage-400'
                                      : difference < 0
                                      ? 'text-peach-600 dark:text-peach-400'
                                      : 'text-dark-700 dark:text-dark-300'
                                  }`}>
                                    {saleEntry.actualValue.toLocaleString()} $
                                  </div>
                                </div>
                                {isDifferent && (
                                  <div>
                                    <div className="text-dark-500 dark:text-dark-500 text-xs">Différence</div>
                                    <div className={`font-semibold ${
                                      difference > 0
                                        ? 'text-sage-600 dark:text-sage-400'
                                        : 'text-peach-600 dark:text-peach-400'
                                    }`}>
                                      {difference > 0 ? '+' : ''}{difference.toLocaleString()} $
                                    </div>
                                  </div>
                                )}
                              </div>

                              {saleEntry.notes && (
                                <div className="text-xs text-dark-600 dark:text-dark-400 italic bg-dark-50 dark:bg-dark-800 rounded p-2">
                                  📝 {saleEntry.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
