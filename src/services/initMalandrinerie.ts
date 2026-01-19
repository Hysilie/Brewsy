import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import malandrinerieData from '../data/malandrinerie-data.json';

/**
 * Initialise les données Malandrinerie dans Firestore
 * À exécuter une seule fois lors de la première installation
 */
export const initializeMalandrinerie = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, message: 'Vous devez être connecté pour initialiser les données' };
    }

    console.log('🚀 Début de l\'initialisation Malandrinerie...');

    const materials = malandrinerieData.spaces.malandrinerie.materials;
    const recipes = malandrinerieData.spaces.malandrinerie.recipes;
    const groups = malandrinerieData.spaces.malandrinerie.groups;

    // 1. Créer les matières premières
    console.log('📦 Création des matières premières...');
    for (const material of materials) {
      const materialRef = doc(db, 'configs', 'default', 'spaces', 'malandrinerie', 'materials', material.id);
      await setDoc(materialRef, {
        ...material,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log(`✅ ${materials.length} matières premières créées`);

    // 2. Créer les recettes
    console.log('📝 Création des recettes...');
    for (const recipe of recipes) {
      const recipeRef = doc(db, 'configs', 'default', 'spaces', 'malandrinerie', 'recipes', recipe.id);
      await setDoc(recipeRef, {
        ...recipe,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log(`✅ ${recipes.length} recettes créées`);

    // 3. Créer les groupes
    console.log('👥 Création des groupes...');
    for (const group of groups) {
      const groupRef = doc(db, 'configs', 'default', 'spaces', 'malandrinerie', 'groups', group.id);
      await setDoc(groupRef, {
        ...group,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log(`✅ ${groups.length} groupes créés`);

    // 4. Initialiser les stocks utilisateur à 0
    console.log('📦 Initialisation des stocks utilisateur...');
    for (const material of materials) {
      const stockRef = doc(db, 'users', user.uid, 'materialStocks', material.id);
      await setDoc(stockRef, {
        materialId: material.id,
        materialName: material.name,
        space: 'malandrinerie',
        quantity: 0,
        unit: material.unit,
        speciality: (material as any).speciality,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log(`✅ ${materials.length} stocks initialisés`);

    console.log('🎉 Initialisation Malandrinerie terminée avec succès!');
    return {
      success: true,
      message: `✅ ${materials.length} matières, ${recipes.length} recettes, ${groups.length} groupes et ${materials.length} stocks créés!`
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation Malandrinerie:', error);
    return { success: false, message: `Erreur: ${(error as Error).message}` };
  }
};
