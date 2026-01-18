import { useEffect, useState } from 'react';
import { useAuth } from '../../app/AuthContext';
import {
  getTransformations,
  getConfig,
  subscribeToRuns,
  createRun,
  updateRunStatus,
  waterRun,
  deleteRun,
  addHistoryEntry
} from '../../services/firestore';
import {
  isTransformationReady,
  calculateTimeRemaining,
  formatDuration
} from '../../domain/calculations';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Select';
import type { Transformation, Run, Config } from '../../types';

export const TimersPage = () => {
  const { user } = useAuth();
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [selectedTransformationId, setSelectedTransformationId] = useState('');
  const [inputQuantity, setInputQuantity] = useState<string>('1');

  // Real-time timer update
  const [, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToRuns(user.uid, setRuns);
    return unsubscribe;
  }, [user]);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const [transformationsData, configData] = await Promise.all([
      getTransformations(),
      getConfig()
    ]);

    setTransformations(transformationsData);
    setConfig(configData);

    if (transformationsData.length > 0) {
      setSelectedTransformationId(transformationsData[0].id);
    }
  };

  const handleCreateRun = async () => {
    if (!user || !selectedTransformationId) return;

    const transformation = transformations.find(t => t.id === selectedTransformationId);
    if (!transformation) return;

    await createRun(
      user.uid,
      selectedTransformationId,
      parseInt(inputQuantity) || 1,
      transformation.durationHours
    );

    // Reset form
    setInputQuantity('1');
    setShowAddForm(false);
  };

  const handleWaterRun = async (runId: string) => {
    if (!user || !runId) return;
    await waterRun(user.uid, runId, config?.rules.timeReductionHours);
  };

  const handleCompleteRun = async (run: Run) => {
    if (!user || !run.id) return;

    await updateRunStatus(user.uid, run.id, 'DONE');
    await addHistoryEntry(
      user.uid,
      run.transformationId,
      run.startedAt,
      run.endsAt,
      run.reducedByAction
    );
  };

  const handleDeleteRun = async (runId: string) => {
    if (!user) return;
    await deleteRun(user.uid, runId);
  };

  const getRunTransformation = (run: Run) => {
    return transformations.find(t => t.id === run.transformationId);
  };

  const runningRuns = runs.filter(r => r.status === 'RUNNING' && !isTransformationReady(r.endsAt.toDate()));
  const readyRuns = runs.filter(r => r.status !== 'DONE' && isTransformationReady(r.endsAt.toDate()));
  const completedRuns = runs.filter(r => r.status === 'DONE');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-800 dark:text-dark-100">Transformations</h1>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
          {showAddForm ? '✕' : '+ Nouveau'}
        </Button>
      </div>

      {/* Add Form - Compact */}
      {showAddForm && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <Select
                label="Type"
                value={selectedTransformationId}
                onChange={(e) => setSelectedTransformationId(e.target.value)}
              >
                {transformations.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.durationHours}h)
                  </option>
                ))}
              </Select>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Productions placées
                </label>
                <input
                  type="number"
                  min="1"
                  value={inputQuantity}
                  onChange={(e) => setInputQuantity(e.target.value)}
                  className="w-full px-3 py-2 rounded-input border border-border bg-card text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-peach/30 focus:border-peach transition-all"
                />
              </div>
            </div>

            <Button onClick={handleCreateRun} className="w-full">
              🚀 Démarrer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Ready Runs - Compact */}
      {readyRuns.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-sage-600 dark:text-sage-400">
            ✓ Prêtes ({readyRuns.length})
          </h2>
          {readyRuns.map((run) => {
            const transformation = getRunTransformation(run);
            return (
              <Card key={run.id} className="border-2 border-sage-400 dark:border-sage-600">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-dark-800 dark:text-dark-100">
                        {transformation?.name}
                        {run.reducedByAction && <span className="ml-2 text-xs">⚡</span>}
                      </div>
                      <div className="text-xs text-dark-600 dark:text-dark-400">
                        {run.inputQuantityUsed} production{run.inputQuantityUsed > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleCompleteRun(run)}>
                        Récolter
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => run.id && handleDeleteRun(run.id)}>
                        ✕
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Running Runs - Compact */}
      {runningRuns.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-lavender-600 dark:text-lavender-400">
            En cours ({runningRuns.length})
          </h2>
          {runningRuns.map((run) => {
            const transformation = getRunTransformation(run);
            const timeRemaining = calculateTimeRemaining(run.endsAt.toDate());
            const totalDuration = run.durationHours * 60 * 60 * 1000;
            const progress = Math.max(0, Math.min(100, ((totalDuration - timeRemaining) / totalDuration) * 100));

            return (
              <Card key={run.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-dark-800 dark:text-dark-100">
                        {transformation?.name}
                        {run.reducedByAction && <span className="ml-2 text-xs">⚡</span>}
                      </div>
                      <div className="text-xs text-dark-600 dark:text-dark-400">
                        {run.inputQuantityUsed} production{run.inputQuantityUsed > 1 ? 's' : ''} • Fin prévue: {run.endsAt.toDate().toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-lavender-600 dark:text-lavender-400">
                        {formatDuration(timeRemaining)}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => run.id && handleWaterRun(run.id)}
                        disabled={run.reducedByAction}
                        title={run.reducedByAction ? 'Déjà arrosé' : 'Arroser (-1h)'}
                      >
                        ⚡
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => run.id && handleDeleteRun(run.id)}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border">
                    <div
                      className="h-full bg-linear-to-r from-lavender to-peach transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Completed (recent) - Compact */}
      {completedRuns.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-dark-600 dark:text-dark-400">
            Récentes ({completedRuns.slice(0, 3).length})
          </h2>
          {completedRuns.slice(0, 3).map((run) => {
            const transformation = getRunTransformation(run);
            return (
              <Card key={run.id} className="opacity-60">
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-semibold text-dark-800 dark:text-dark-100">
                        {transformation?.name}
                      </span>
                      <span className="text-xs text-dark-600 dark:text-dark-400 ml-2">
                        • {run.inputQuantityUsed} production{run.inputQuantityUsed > 1 ? 's' : ''}
                      </span>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => run.id && handleDeleteRun(run.id)}
                      className="text-xs"
                    >
                      ✕
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {runs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-3">⏱️</div>
            <p className="text-dark-600 dark:text-dark-400 mb-3">
              Aucune transformation en cours
            </p>
            <Button onClick={() => setShowAddForm(true)} size="sm">
              Démarrer une transformation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
