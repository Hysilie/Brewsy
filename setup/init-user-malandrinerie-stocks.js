/**
 * Script d'initialisation des stocks utilisateur pour Malandrinerie
 *
 * Usage: node setup/init-user-malandrinerie-stocks.js <user-email>
 *
 * Ce script initialise tous les stocks de matières premières à 0
 * pour l'utilisateur spécifié dans l'espace Malandrinerie
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

/**
 * Récupère toutes les matières premières
 */
async function getMaterials() {
  const materialsRef = collection(db, 'configs', 'default', 'spaces', 'malandrinerie', 'materials');
  const snapshot = await getDocs(materialsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Initialise les stocks pour un utilisateur
 */
async function initUserStocks(userId) {
  console.log(`📦 Initialisation des stocks pour l'utilisateur ${userId}...\n`);

  const materials = await getMaterials();
  console.log(`Trouvé ${materials.length} matières premières à initialiser\n`);

  for (const material of materials) {
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

  console.log(`\n✅ ${materials.length} stocks initialisés à 0`);
}

/**
 * Fonction principale
 */
async function main() {
  const userEmail = process.argv[2];
  const userPassword = process.argv[3];

  if (!userEmail || !userPassword) {
    console.error('❌ Usage: node setup/init-user-malandrinerie-stocks.js <email> <password>');
    process.exit(1);
  }

  console.log('🚀 Initialisation des stocks utilisateur Malandrinerie\n');

  try {
    // Se connecter avec l'utilisateur
    console.log(`🔐 Connexion avec ${userEmail}...`);
    const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword);
    const userId = userCredential.user.uid;
    console.log(`✅ Connecté (UID: ${userId})\n`);

    // Initialiser les stocks
    await initUserStocks(userId);

    console.log('\n🎉 Initialisation terminée avec succès !');
    console.log('\n💡 Les stocks sont maintenant à 0, vous pouvez les modifier dans l\'interface.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation :', error.message);
    process.exit(1);
  }
}

// Exécution
main();
