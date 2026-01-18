import { useEffect, useState } from 'react';
import { getTransformations } from '../../services/firestore';
import {
  calculateMaterialsNeeded,
  calculateToolsRequired,
  calculateTotalToolCost,
} from '../../domain/calculations';
import { Card, CardContent } from '../../ui/Card';
import { Select } from '../../ui/Select';
import { Input } from '../../ui/Input';
import type { Transformation } from '../../types';

export const CalculatorPage = () => {
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [selectedTransformation, setSelectedTransformation] = useState<Transformation | null>(null);
  const [numberOfRuns, setNumberOfRuns] = useState<string>('1');

  useEffect(() => {
    loadTransformations();
  }, []);

  const loadTransformations = async () => {
    const data = await getTransformations();
    setTransformations(data);
    if (data.length > 0) {
      setSelectedTransformation(data[0]);
    }
  };

  const handleTransformationChange = (id: string) => {
    const transformation = transformations.find(t => t.id === id);
    setSelectedTransformation(transformation || null);
  };

  const runsNumber = parseInt(numberOfRuns) || 1;

  const materialsNeeded = selectedTransformation
    ? calculateMaterialsNeeded(selectedTransformation, runsNumber)
    : 0;

  const toolsRequired = calculateToolsRequired(runsNumber);

  const totalToolCost = selectedTransformation
    ? calculateTotalToolCost(selectedTransformation, runsNumber)
    : 0;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-dark-800 dark:text-dark-100">Calculateur</h1>

      {/* Sélection compacte */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select
              label="Transformation"
              value={selectedTransformation?.id || ''}
              onChange={(e) => handleTransformationChange(e.target.value)}
            >
              {transformations.length === 0 ? (
                <option>Chargement...</option>
              ) : (
                transformations.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.durationHours}h)
                  </option>
                ))
              )}
            </Select>

            <Input
              label="Nombre"
              type="number"
              min="1"
              value={numberOfRuns}
              onChange={(e) => setNumberOfRuns(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Détails de la transformation - Ultra compact */}
      {selectedTransformation && (
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold text-dark-800 dark:text-dark-100 mb-3">
              {selectedTransformation.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="p-2 bg-butter-50 dark:bg-dark-700 rounded">
                <div className="text-xs text-dark-500 dark:text-dark-500">Matériau</div>
                <div className="font-semibold text-dark-800 dark:text-dark-100">
                  {selectedTransformation.input.quantity} {selectedTransformation.input.materialName}
                </div>
              </div>

              <div className="p-2 bg-lavender-50 dark:bg-dark-700 rounded">
                <div className="text-xs text-dark-500 dark:text-dark-500">Outil</div>
                <div className="font-semibold text-dark-800 dark:text-dark-100">
                  {selectedTransformation.tool.name}
                </div>
              </div>

              <div className="p-2 bg-sage-50 dark:bg-dark-700 rounded">
                <div className="text-xs text-dark-500 dark:text-dark-500">Durée</div>
                <div className="font-semibold text-dark-800 dark:text-dark-100">
                  {selectedTransformation.durationHours}h
                  <span className="text-xs text-dark-400 dark:text-dark-600"> (-1h si ⚡)</span>
                </div>
              </div>

              <div className="p-2 bg-sky-50 dark:bg-dark-700 rounded">
                <div className="text-xs text-dark-500 dark:text-dark-500">Caisse</div>
                <div className="font-semibold text-dark-800 dark:text-dark-100">
                  {selectedTransformation.crate.quantityPerCrate} /caisse
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats - Grid compact */}
      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold text-dark-800 dark:text-dark-100 mb-3">
            Pour {runsNumber} transformation{runsNumber > 1 ? 's' : ''}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Matériaux */}
            <div className="p-3 bg-gradient-to-br from-peach-50 to-butter-50 dark:from-peach-900/20 dark:to-butter-900/20 rounded-cozy">
              <div className="text-xs text-dark-600 dark:text-dark-400 mb-1">
                Matériaux nécessaires
              </div>
              <div className="text-2xl font-bold text-peach-600 dark:text-peach-400">
                {materialsNeeded}
              </div>
              <div className="text-xs text-dark-500 dark:text-dark-500">
                {selectedTransformation?.input.materialName}
              </div>
            </div>

            {/* Outils */}
            <div className="p-3 bg-gradient-to-br from-lavender-50 to-sage-50 dark:from-lavender-900/20 dark:to-sage-900/20 rounded-cozy">
              <div className="text-xs text-dark-600 dark:text-dark-400 mb-1">
                Outils requis
              </div>
              <div className="text-2xl font-bold text-lavender-600 dark:text-lavender-400">
                {toolsRequired}
              </div>
              <div className="text-xs text-dark-500 dark:text-dark-500">
                {selectedTransformation?.tool.name}
              </div>
            </div>

            {/* Coût (si prix > 0) */}
            {selectedTransformation && selectedTransformation.tool.price > 0 && (
              <div className="p-3 bg-gradient-to-br from-sky-50 to-lavender-50 dark:from-sky-900/20 dark:to-lavender-900/20 rounded-cozy">
                <div className="text-xs text-dark-600 dark:text-dark-400 mb-1">
                  Coût total
                </div>
                <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                  {totalToolCost.toLocaleString()} $
                </div>
                <div className="text-xs text-dark-500 dark:text-dark-500">
                  {selectedTransformation.tool.price.toLocaleString()} $ × {toolsRequired}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
