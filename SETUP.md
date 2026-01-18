# Configuration de Cozy Production Tracker

## 1. Configuration Firebase

### Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet
3. Activez **Firebase Authentication** et activez la méthode Email/Password
4. Activez **Cloud Firestore**

### Configurer l'application

1. Dans les paramètres du projet Firebase, copiez votre configuration Firebase
2. Ouvrez le fichier `src/services/firebase.ts`
3. Remplacez les valeurs placeholder par votre configuration:

```typescript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_AUTH_DOMAIN",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_STORAGE_BUCKET",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};
```

### Créer un compte utilisateur

1. Dans Firebase Console, allez dans Authentication
2. Créez un compte avec email/password (ce sera le seul compte autorisé)

### Configurer les règles de sécurité Firestore

Dans Firebase Console > Firestore > Règles, copiez ces règles:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Configuration - lecture autorisée pour tous les utilisateurs authentifiés
    match /configs/{document=**} {
      allow read: if request.auth != null;
      allow write: if false; // Écriture restreinte
    }

    // Données utilisateur - accès uniquement pour l'utilisateur propriétaire
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## 2. Initialiser les données de configuration

### Structure des transformations

Créez manuellement dans Firestore la structure suivante:

**Collection**: `configs`
**Document**: `default`
```json
{
  "name": "default",
  "rules": {
    "timeReductionHours": 1
  },
  "updatedAt": "timestamp"
}
```

**Sous-collection**: `configs/default/transformations`

Exemple de transformation (créez un document par transformation):

Document ID: `zeed`
```json
{
  "id": "zeed",
  "name": "Zeed",
  "input": {
    "materialName": "Feuille",
    "quantity": 60
  },
  "tool": {
    "name": "Pot de terre",
    "price": 250
  },
  "durationHours": 48,
  "crate": {
    "name": "Caisse de Zeed",
    "quantityPerCrate": 20
  }
}
```

Vous pouvez créer d'autres transformations selon vos besoins (pandoxine, etc.).

## 3. Développement

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour production
npm run build
```

## 4. Déploiement sur GitHub Pages

### Configuration

1. Créez un fichier `vite.config.ts` et ajoutez:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/VOTRE_REPO_NAME/', // Remplacez par le nom de votre repo
})
```

2. Installez gh-pages:

```bash
npm install --save-dev gh-pages
```

3. Ajoutez ces scripts dans `package.json`:

```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

4. Déployez:

```bash
npm run deploy
```

5. Dans les paramètres GitHub de votre repo, activez GitHub Pages sur la branche `gh-pages`

6. N'oubliez pas d'ajouter votre URL GitHub Pages dans les domaines autorisés de Firebase Authentication!

## 5. Prochaines étapes

L'application de base est maintenant fonctionnelle avec:
- ✅ Authentification
- ✅ Dashboard
- ✅ Navigation
- ✅ Structure de données

Les pages suivantes restent à implémenter:
- [ ] Page Stocks (gestion des caisses)
- [ ] Page Prix moyens
- [ ] Calculateur de production
- [ ] Page Timers/Transformations
- [ ] Page Historique

Chaque page pourra être développée progressivement selon vos besoins!
