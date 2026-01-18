import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Initialise les données de configuration dans Firestore
 * À exécuter une seule fois lors de la première installation
 */
export const initializeFirestoreData = async () => {
  try {
    console.log('🚀 Début de l\'initialisation Firestore...');

    // 1. Créer le document de config
    const configRef = doc(db, 'configs', 'default');
    await setDoc(configRef, {
      name: 'default',
      rules: {
        timeReductionHours: 1
      },
      updatedAt: serverTimestamp()
    });
    console.log('✅ Config créée');

    // 2. Créer les 4 transformations
    const transformations = [
      {
        id: 'zeed',
        name: 'Zeed',
        input: {
          materialName: 'Feuille',
          quantity: 60
        },
        tool: {
          name: 'Pot de terre',
          price: 0
        },
        durationHours: 48,
        crate: {
          name: 'Caisse de Zeed',
          quantityPerCrate: 20
        }
      },
      {
        id: 'pandoxine',
        name: 'Pandoxine',
        input: {
          materialName: 'Viande',
          quantity: 18
        },
        tool: {
          name: 'Marmite',
          price: 0
        },
        durationHours: 96,
        crate: {
          name: 'Caisse de Pandoxine',
          quantityPerCrate: 12
        }
      },
      {
        id: 'krakenine',
        name: 'Krakenine',
        input: {
          materialName: 'Huile',
          quantity: 10
        },
        tool: {
          name: 'Bidon de chauffe',
          price: 0
        },
        durationHours: 24,
        crate: {
          name: 'Caisse de Krakenine',
          quantityPerCrate: 12
        }
      },
      {
        id: 'psylocybine',
        name: 'Psylocybine',
        input: {
          materialName: 'Champignon',
          quantity: 60
        },
        tool: {
          name: 'Sachet de fermentation',
          price: 0
        },
        durationHours: 72,
        crate: {
          name: 'Caisse de Psylocybine',
          quantityPerCrate: 20
        }
      }
    ];

    for (const transformation of transformations) {
      const transformationRef = doc(db, 'configs', 'default', 'transformations', transformation.id);
      await setDoc(transformationRef, transformation);
      console.log(`✅ Transformation ${transformation.name} créée`);
    }

    console.log('🎉 Initialisation terminée avec succès!');
    return { success: true, message: 'Toutes les données ont été créées avec succès!' };

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    return { success: false, message: `Erreur: ${(error as Error).message}` };
  }
};
