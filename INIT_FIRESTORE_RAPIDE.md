# 🚀 Initialisation Firestore - Guide Ultra-Rapide

## Étape 1: Créer la base de données Firestore

1. Allez sur [Firebase Console](https://console.firebase.google.com/u/0/project/brewsy-6e24c/firestore)
2. Cliquez sur **"Créer une base de données"**
3. Sélectionnez **"Mode production"**
4. Choisissez une région (ex: `europe-west1`)

---

## Étape 2: Configurer les règles de sécurité

1. Dans Firestore, cliquez sur l'onglet **"Règles"**
2. Copiez-collez ceci:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /configs/{document=**} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

3. Cliquez sur **"Publier"**

---

## Étape 3: Créer les données de configuration

### A. Collection `configs`

1. Dans l'onglet **"Données"**, cliquez sur **"Commencer une collection"**
2. ID de collection: `configs`
3. ID du document: `default`
4. Ajoutez les champs suivants:

```
name (string): default
rules (map):
  └─ timeReductionHours (number): 1
updatedAt (timestamp): [Cliquez sur l'icône horloge pour "Timestamp serveur"]
```

5. Cliquez sur **"Enregistrer"**

---

### B. Sous-collection `transformations`

Maintenant, dans le document `configs/default` que vous venez de créer:

1. Cliquez sur **"Ajouter une sous-collection"**
2. ID de sous-collection: `transformations`

---

#### Transformation 1: Zeed 🌿

**ID du document:** `zeed`

```
id (string): zeed
name (string): Zeed

input (map):
  └─ materialName (string): Feuille
  └─ quantity (number): 60

tool (map):
  └─ name (string): Pot de terre
  └─ price (number): 0

durationHours (number): 48

crate (map):
  └─ name (string): Caisse de Zeed
  └─ quantityPerCrate (number): 20
```

Cliquez sur **"Enregistrer"**

---

#### Transformation 2: Pandoxine 🥩

**ID du document:** `pandoxine`

```
id (string): pandoxine
name (string): Pandoxine

input (map):
  └─ materialName (string): Viande
  └─ quantity (number): 18

tool (map):
  └─ name (string): Marmite
  └─ price (number): 0

durationHours (number): 96

crate (map):
  └─ name (string): Caisse de Pandoxine
  └─ quantityPerCrate (number): 12
```

Cliquez sur **"Enregistrer"**

---

#### Transformation 3: Krakenine 🛢️

**ID du document:** `krakenine`

```
id (string): krakenine
name (string): Krakenine

input (map):
  └─ materialName (string): Huile
  └─ quantity (number): 10

tool (map):
  └─ name (string): Bidon de chauffe
  └─ price (number): 0

durationHours (number): 24

crate (map):
  └─ name (string): Caisse de Krakenine
  └─ quantityPerCrate (number): 12
```

Cliquez sur **"Enregistrer"**

---

#### Transformation 4: Psylocybine 🍄

**ID du document:** `psylocybine`

```
id (string): psylocybine
name (string): Psylocybine

input (map):
  └─ materialName (string): Champignon
  └─ quantity (number): 60

tool (map):
  └─ name (string): Sachet de fermentation
  └─ price (number): 0

durationHours (number): 72

crate (map):
  └─ name (string): Caisse de Psylocybine
  └─ quantityPerCrate (number): 20
```

Cliquez sur **"Enregistrer"**

---

## ✅ Vérification

Votre Firestore devrait maintenant ressembler à ceci:

```
Firestore Database
└─ configs
   └─ default
      ├─ name: "default"
      ├─ rules: { timeReductionHours: 1 }
      └─ transformations (sous-collection)
         ├─ zeed
         ├─ pandoxine
         ├─ krakenine
         └─ psylocybine
```

---

## 🎯 Testez l'application

1. **Rafraîchissez** la page de l'application (F5)
2. **Page Stocks** : Les 4 caisses devraient apparaître avec icônes
3. **Page Prix** : Les 4 types devraient être visibles
4. **Page Calculateur** : Les transformations devraient être dans le dropdown
5. **Dashboard** : Les 4 caisses devraient être dans la grille

---

## 🐛 Problèmes courants

### "Aucune caisse visible"
→ Vérifiez que les 4 transformations sont bien créées avec les bons IDs

### "Erreur de permission"
→ Vérifiez que les règles Firestore sont bien publiées

### "Page blanche"
→ Ouvrez la console (F12) et vérifiez les erreurs

---

## 💡 Astuce

Les **stocks et prix** se créeront automatiquement quand vous:
- Modifierez une quantité dans Stocks (boutons +/-)
- Ajouterez un prix dans Prix moyens

Ils seront stockés sous `users/{votre-uid}/stocks/` et `users/{votre-uid}/prices/`

---

## ⏱️ Temps estimé

- **Création de la base:** 2 min
- **Règles de sécurité:** 1 min
- **Config + 4 transformations:** 10 min

**Total: ~15 minutes**

---

## 🆘 Besoin d'aide?

1. Vérifiez que vous êtes bien connecté à l'application
2. Ouvrez la console (F12) et regardez les erreurs
3. Vérifiez que votre compte Firebase Authentication existe

Une fois les données créées, **tout fonctionnera automatiquement**! 🎉
