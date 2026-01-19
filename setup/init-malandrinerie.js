/**
 * Script d'initialisation des données Malandrinerie dans Firestore
 *
 * Usage: node setup/init-malandrinerie.js
 *
 * Ce script initialise :
 * - Les matières premières
 * - Les recettes/crafts (T1 et T2)
 * - Les groupes de commandes
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration Firebase (à adapter avec vos vraies credentials)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Charger les données depuis le JSON
const dataPath = join(__dirname, '..', 'firestore-malandrinerie-data.json');
const rawData = readFileSync(dataPath, 'utf8');
const data = JSON.parse(rawData);

const malandrinerie = data.spaces.malandrinerie;

/**
 * Initialise les matières premières
 */
async function initMaterials() {
  console.log('📦 Initialisation des matières premières...');

  for (const material of malandrinerie.materials) {
    const docRef = doc(db, 'configs', 'default', 'spaces', 'malandrinerie', 'materials', material.id);
    await setDoc(docRef, {
      ...material,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`  ✓ ${material.name}`);
  }

  console.log(`✅ ${malandrinerie.materials.length} matières premières créées\n`);
}

/**
 * Initialise les recettes
 */
async function initRecipes() {
  console.log('📝 Initialisation des recettes...');

  const t1Recipes = malandrinerie.recipes.filter(r => r.category === 'T1');
  const t2Recipes = malandrinerie.recipes.filter(r => r.category === 'T2');

  for (const recipe of malandrinerie.recipes) {
    const docRef = doc(db, 'configs', 'default', 'spaces', 'malandrinerie', 'recipes', recipe.id);
    await setDoc(docRef, {
      ...recipe,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`  ✓ ${recipe.emoji} ${recipe.name} (${recipe.category}, x${recipe.batchSize})`);
  }

  console.log(`✅ ${malandrinerie.recipes.length} recettes créées (${t1Recipes.length} T1 + ${t2Recipes.length} T2)\n`);
}

/**
 * Initialise les groupes de commandes
 */
async function initGroups() {
  console.log('👥 Initialisation des groupes...');

  for (const group of malandrinerie.groups) {
    const docRef = doc(db, 'configs', 'default', 'spaces', 'malandrinerie', 'groups', group.id);
    await setDoc(docRef, {
      ...group,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`  ✓ ${group.name}`);
  }

  console.log(`✅ ${malandrinerie.groups.length} groupes créés\n`);
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Démarrage de l\'initialisation Malandrinerie\n');

  try {
    await initMaterials();
    await initRecipes();
    await initGroups();

    console.log('🎉 Initialisation terminée avec succès !');
    console.log('\n📊 Résumé :');
    console.log(`   - ${malandrinerie.materials.length} matières premières`);
    console.log(`   - ${malandrinerie.recipes.length} recettes`);
    console.log(`   - ${malandrinerie.groups.length} groupes`);
    console.log('\n💡 Prochaine étape : Initialiser les stocks utilisateur à 0 pour chaque matière première');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation :', error);
    process.exit(1);
  }
}

// Exécution
main();
