import { useState } from 'react';
import { initializeFirestoreData } from '../../services/initFirestore';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';

export const SetupPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleInitialize = async () => {
    setLoading(true);
    setResult(null);

    const res = await initializeFirestoreData();
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-8">
          <h1 className="text-3xl font-bold text-peach-600 dark:text-peach-400 mb-4">
            🚀 Initialisation Firestore
          </h1>

          <div className="space-y-4 mb-6">
            <p className="text-dark-700 dark:text-dark-300">
              Cette page va créer automatiquement toutes les données nécessaires dans Firestore:
            </p>

            <ul className="list-disc list-inside space-y-2 text-dark-600 dark:text-dark-400 ml-4">
              <li>Collection <code className="bg-dark-200 dark:bg-dark-700 px-2 py-0.5 rounded">configs/default</code></li>
              <li>Règle de réduction de temps (1h)</li>
              <li>4 transformations:
                <ul className="list-circle list-inside ml-6 mt-1 space-y-1">
                  <li>🌿 Zeed (Feuille → 48h)</li>
                  <li>🥩 Pandoxine (Viande → 96h)</li>
                  <li>🛢️ Krakenine (Huile → 24h)</li>
                  <li>🍄 Psylocybine (Champignon → 72h)</li>
                </ul>
              </li>
            </ul>

            <div className="bg-butter-50 dark:bg-butter-900/20 border-2 border-butter-400 dark:border-butter-600 rounded-cozy p-4">
              <p className="text-sm text-dark-700 dark:text-dark-300">
                ⚠️ <strong>Important:</strong> N'exécutez cette initialisation qu'une seule fois!
                Si les données existent déjà, elles seront écrasées.
              </p>
            </div>
          </div>

          <Button
            onClick={handleInitialize}
            disabled={loading}
            className="w-full mb-4"
          >
            {loading ? 'Initialisation en cours...' : '🚀 Initialiser Firestore'}
          </Button>

          {result && (
            <div
              className={`p-4 rounded-cozy ${
                result.success
                  ? 'bg-sage-100 dark:bg-sage-900/30 border-2 border-sage-400 dark:border-sage-600'
                  : 'bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600'
              }`}
            >
              <p className={`font-semibold mb-2 ${
                result.success
                  ? 'text-sage-800 dark:text-sage-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {result.success ? '✅ Succès!' : '❌ Erreur'}
              </p>
              <p className={`text-sm ${
                result.success
                  ? 'text-sage-700 dark:text-sage-300'
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {result.message}
              </p>

              {result.success && (
                <div className="mt-4 pt-4 border-t border-sage-300 dark:border-sage-700">
                  <p className="text-sm text-sage-700 dark:text-sage-300 mb-3">
                    🎉 Vous pouvez maintenant:
                  </p>
                  <ul className="text-sm text-sage-600 dark:text-sage-400 space-y-1 ml-4">
                    <li>→ Aller sur la page <strong>Stocks</strong> et modifier les quantités</li>
                    <li>→ Aller sur la page <strong>Prix</strong> et ajouter des prix observés</li>
                    <li>→ Aller sur le <strong>Calculateur</strong> pour planifier vos productions</li>
                    <li>→ Lancer des <strong>Transformations</strong> avec timers</li>
                  </ul>
                  <p className="text-xs text-sage-500 dark:text-sage-500 mt-4">
                    💡 Conseil: Fermez cet onglet et rafraîchissez l'application principale
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-dark-200 dark:border-dark-700">
            <p className="text-xs text-dark-500 dark:text-dark-500 text-center">
              Cette page peut être supprimée après la première initialisation
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
