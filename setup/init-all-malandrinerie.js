/**
 * Script d'initialisation complète Malandrinerie (avec authentification)
 *
 * Usage: node setup/init-all-malandrinerie.js <email> <password>
 *
 * Ce script initialise tout en une fois :
 * 1. Données globales (matières, recettes, groupes)
 * 2. Stocks utilisateur à 0
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration Firebase
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
const auth = getAuth(app);

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
 * Initialise les stocks pour un utilisateur
 */
async function initUserStocks(userId) {
  console.log(`📦 Initialisation des stocks pour l'utilisateur ${userId}...\n`);

  for (const material of malandrinerie.materials) {
    const stockRef = doc(db, 'users', userId, 'materialStocks', material.id);
    await setDoc(stockRef, {
      materialId: material.id,
      materialName: material.name,
      space: 'malandrinerie',
      quantity: 0,
      unit: material.unit,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`  ✓ ${material.name}: 0 ${material.unit}`);
  }

  console.log(`\n✅ ${malandrinerie.materials.length} stocks initialisés à 0\n`);
}

/**
 * Fonction principale
 */
async function main() {
  const userEmail = process.argv[2];
  const userPassword = process.argv[3];

  if (!userEmail || !userPassword) {
    console.error('❌ Usage: node setup/init-all-malandrinerie.js <email> <password>');
    process.exit(1);
  }

  console.log('🚀 Initialisation complète Malandrinerie\n');

  try {
    // Se connecter avec l'utilisateur
    console.log(`🔐 Connexion avec ${userEmail}...`);
    const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword);
    const userId = userCredential.user.uid;
    console.log(`✅ Connecté (UID: ${userId})\n`);

    // Initialiser les données globales
    await initMaterials();
    await initRecipes();
    await initGroups();

    // Initialiser les stocks utilisateur
    await initUserStocks(userId);

    console.log('🎉 Initialisation terminée avec succès !');
    console.log('\n📊 Résumé :');
    console.log(`   - ${malandrinerie.materials.length} matières premières`);
    console.log(`   - ${malandrinerie.recipes.length} recettes (10 T1 + 10 T2)`);
    console.log(`   - ${malandrinerie.groups.length} groupes`);
    console.log(`   - ${malandrinerie.materials.length} stocks initialisés à 0`);
    console.log('\n✅ Vous pouvez maintenant accéder à l\'espace Malandrinerie dans l\'app !');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation :', error.message);
    process.exit(1);
  }
}

// Exécution
main();
