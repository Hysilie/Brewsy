import { useState } from 'react';
import { initializeFirestoreData } from '../../services/initFirestore';
import { initializeMalandrinerie } from '../../services/initMalandrinerie';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';

type Result = { success: boolean; message: string } | null;

export const SetupPage = () => {
  const [loadingDrogue, setLoadingDrogue] = useState(false);
  const [resultDrogue, setResultDrogue] = useState<Result>(null);

  const [loadingMalandrinerie, setLoadingMalandrinerie] = useState(false);
  const [resultMalandrinerie, setResultMalandrinerie] = useState<Result>(null);

  const handleInitializeDrogue = async () => {
    setLoadingDrogue(true);
    setResultDrogue(null);
    const res = await initializeFirestoreData();
    setResultDrogue(res);
    setLoadingDrogue(false);
  };

  const handleInitializeMalandrinerie = async () => {
    setLoadingMalandrinerie(true);
    setResultMalandrinerie(null);
    const res = await initializeMalandrinerie();
    setResultMalandrinerie(res);
    setLoadingMalandrinerie(false);
  };

  const ResultDisplay = ({ result }: { result: Result }) => {
    if (!result) return null;

    return (
      <div
        className={`p-4 rounded-soft mt-4 ${
          result.success
            ? 'bg-sage-light border border-sage'
            : 'bg-peach-light border border-peach'
        }`}
      >
        <p className={`font-semibold mb-2 ${result.success ? 'text-sage-dark' : 'text-peach-dark'}`}>
          {result.success ? '✅ Succès!' : '❌ Erreur'}
        </p>
        <p className="text-sm text-text-secondary">{result.message}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-6xl w-full space-y-6">
        <h1 className="text-4xl font-bold text-text text-center mb-8">
          🚀 Initialisation Firestore
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section Drogue / Naturopathie */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-mint-dark mb-4 flex items-center gap-2">
                🍃 Espace Drogue
              </h2>

              <div className="space-y-3 mb-6">
                <p className="text-sm text-text-secondary">
                  Initialise les données pour l'espace Drogue/Naturopathie :
                </p>

                <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary ml-4">
                  <li>Configuration globale</li>
                  <li>4 transformations (Zeed, Pandoxine, Krakenine, Psylocybine)</li>
                  <li>Règle de réduction de temps (1h)</li>
                </ul>

                <div className="bg-butter-light border border-butter rounded-soft p-3">
                  <p className="text-xs text-text-muted">
                    ⚠️ N'exécuter qu'une seule fois!
                  </p>
                </div>
              </div>

              <Button
                onClick={handleInitializeDrogue}
                disabled={loadingDrogue}
                className="w-full"
              >
                {loadingDrogue ? 'Initialisation...' : '🚀 Initialiser Drogue'}
              </Button>

              <ResultDisplay result={resultDrogue} />
            </CardContent>
          </Card>

          {/* Section Malandrinerie */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-peach-dark mb-4 flex items-center gap-2">
                ⚔️ Espace Malandrinerie
              </h2>

              <div className="space-y-3 mb-6">
                <p className="text-sm text-text-secondary">
                  Initialise les données pour l'espace Malandrinerie :
                </p>

                <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary ml-4">
                  <li>31 matières premières</li>
                  <li>20 recettes/crafts (10 T1 + 10 T2)</li>
                  <li>7 groupes de commandes</li>
                  <li>Stocks utilisateur à 0</li>
                </ul>

                <div className="bg-butter-light border border-butter rounded-soft p-3">
                  <p className="text-xs text-text-muted">
                    ⚠️ Nécessite d'être connecté!
                  </p>
                </div>
              </div>

              <Button
                onClick={handleInitializeMalandrinerie}
                disabled={loadingMalandrinerie}
                className="w-full"
              >
                {loadingMalandrinerie ? 'Initialisation...' : '🚀 Initialiser Malandrinerie'}
              </Button>

              <ResultDisplay result={resultMalandrinerie} />
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-text-muted">
            💡 Cette page peut être supprimée après l'initialisation
          </p>
        </div>
      </div>
    </div>
  );
};
