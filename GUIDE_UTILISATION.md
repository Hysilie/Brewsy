# Guide d'utilisation - Cozy Production Tracker

## 🎉 Application complète!

Toutes les fonctionnalités ont été implémentées avec succès!

---

## 📱 Fonctionnalités disponibles

### 1. **Dashboard** (Page d'accueil)
- Vue d'ensemble de vos stocks
- Valeur totale estimée
- Nombre de transformations actives
- Nombre de transformations prêtes à récolter
- Liste des stocks avec leurs valeurs

### 2. **Stocks** (Gestion des caisses)
- ✅ Ajouter de nouveaux types de caisses
- ✅ Modifier les quantités
- ✅ Voir la valeur estimée par type
- ✅ Voir la valeur totale de tous vos stocks

**Comment l'utiliser:**
1. Cliquez sur "+ Ajouter une caisse"
2. Entrez le nom (ex: "Caisse de Zeed")
3. Entrez la quantité initiale
4. Pour modifier: Cliquez sur "Modifier", changez la quantité, puis "Sauvegarder"

### 3. **Prix moyens**
- ✅ Ajouter des prix observés pour chaque type de caisse
- ✅ Calcul automatique du prix moyen
- ✅ Voir les statistiques (min, max, nombre d'observations)
- ✅ Supprimer des prix individuels
- ✅ Historique complet des prix

**Comment l'utiliser:**
1. Pour un nouveau type: Cliquez sur "+ Nouveau type de caisse"
2. Pour ajouter un prix: Entrez le prix dans le champ et cliquez "Ajouter"
3. Les moyennes se calculent automatiquement

### 4. **Calculateur de production**
- ✅ Sélectionner une transformation
- ✅ Définir le nombre de transformations souhaitées
- ✅ Calcul automatique de:
  - Matériaux nécessaires
  - Outils requis
  - Coût total des outils
  - Estimation du nombre de caisses produites

**Comment l'utiliser:**
1. Sélectionnez une transformation dans la liste
2. Entrez le nombre de transformations que vous voulez faire
3. Les calculs s'affichent automatiquement!

### 5. **Transformations** (Timers)
- ✅ Démarrer une nouvelle transformation
- ✅ Option "Arrosé/Mélangé" pour réduire le temps
- ✅ Suivi en temps réel avec barre de progression
- ✅ Notification visuelle quand c'est prêt
- ✅ Bouton "Récolter" pour terminer
- ✅ Les transformations terminées vont dans l'historique

**Comment l'utiliser:**
1. Cliquez sur "+ Nouvelle transformation"
2. Sélectionnez le type de transformation
3. Entrez la quantité de matériau utilisée
4. Cochez "Arrosé/Mélangé" si applicable (-1h)
5. Cliquez "Démarrer la transformation"
6. Suivez la progression en temps réel
7. Quand c'est prêt, cliquez "Récolter"

### 6. **Historique**
- ✅ Liste chronologique de toutes les transformations terminées
- ✅ Regroupement par jour
- ✅ Statistiques (total, cette semaine, avec bonus)
- ✅ Détails de chaque transformation (début, fin, durée)

---

## 🎨 Thème et Design

- **Style cozy/pastel** : Couleurs douces et ambiance chaleureuse
- **Mode sombre** : Automatique selon les préférences système
- **Responsive** : Fonctionne sur mobile et desktop
- **Navigation intuitive** :
  - Desktop: Sidebar à gauche
  - Mobile: Bottom navigation

---

## 🔥 Configuration Firestore requise

Avant d'utiliser l'application, vous devez:

### 1. Créer les données de configuration dans Firestore

**Collection: `configs`**
**Document: `default`**
```json
{
  "name": "default",
  "rules": {
    "timeReductionHours": 1
  }
}
```

**Sous-collection: `configs/default/transformations`**

Créez au moins une transformation, exemple:

**Document ID: `zeed`**
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

Voir le fichier `firestore-init-data.json` pour plus d'exemples!

### 2. Configurer les règles de sécurité

Allez dans Firestore > Règles et collez le contenu du fichier `firestore.rules`

---

## 🚀 Démarrage rapide

1. **Développement**
   ```bash
   npm run dev
   ```
   → Application sur http://localhost:5173/

2. **Build production**
   ```bash
   npm run build
   ```
   → Fichiers dans `/dist`

3. **Déploiement GitHub Pages**
   - Installez: `npm install --save-dev gh-pages`
   - Ajoutez dans `package.json`:
     ```json
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
     ```
   - Déployez: `npm run deploy`

---

## 💾 Structure des données utilisateur

Toutes vos données sont stockées sous `users/{votre-uid}/`:

- **`stocks/{crateId}`** : Vos stocks de caisses
- **`prices/{crateId}`** : Les prix observés
- **`runs/{runId}`** : Les transformations en cours
- **`history/{entryId}`** : L'historique des transformations

---

## 🔒 Sécurité

- Application privée, un seul utilisateur
- Authentification Firebase requise
- Chaque utilisateur n'accède qu'à ses propres données
- Les règles Firestore garantissent l'isolation

---

## 📊 Workflow typique

1. **Configuration initiale** (une seule fois)
   - Ajoutez vos types de caisses dans "Stocks"
   - Enregistrez quelques prix dans "Prix moyens"

2. **Planification**
   - Utilisez le "Calculateur" pour savoir combien de matériaux vous avez besoin

3. **Production**
   - Démarrez vos transformations dans "Transformations"
   - Suivez la progression en temps réel

4. **Récolte**
   - Récoltez quand c'est prêt
   - Les données vont automatiquement dans l'historique

5. **Suivi**
   - Consultez le Dashboard pour une vue d'ensemble
   - Consultez l'Historique pour revoir vos transformations passées

---

## 🐛 Problèmes connus / Limitations

1. **Le calculateur donne une estimation** : Le rendement réel peut varier
2. **Pas de notifications** : Vous devez rafraîchir la page pour voir les mises à jour
3. **Un seul utilisateur** : Par design, l'application est mono-utilisateur

---

## 🎯 Prochaines améliorations possibles

- [ ] Notifications push quand une transformation est prête
- [ ] Graphiques de statistiques
- [ ] Export des données en CSV
- [ ] Mode hors ligne (Progressive Web App)
- [ ] Prédictions basées sur l'historique
- [ ] Gestion de plusieurs "fermes" ou "ateliers"

---

## ❓ Questions fréquentes

**Q: Pourquoi mes stocks sont vides?**
R: Vous devez d'abord ajouter des caisses dans la page "Stocks"

**Q: Les prix moyens ne s'affichent pas**
R: Vous devez d'abord enregistrer des prix dans "Prix moyens"

**Q: Le calculateur ne montre rien**
R: Vérifiez que les transformations sont bien créées dans Firestore

**Q: La page transformations est vide**
R: Normal si vous n'avez pas encore démarré de transformation. Cliquez sur "+ Nouvelle transformation"

**Q: Comment supprimer une transformation en cours?**
R: Cliquez sur le "✕" en haut à droite de la carte de transformation

---

## 🎨 Personnalisation

Pour modifier les couleurs du thème, éditez `/src/index.css` dans la section `@theme`:

```css
--color-peach-500: #ff6b4a;   /* Couleur principale
--color-lavender-500: #a855f7; /* Couleur secondaire
/* etc. */
```

---

## 📝 Fichiers importants

- `src/services/firebase.ts` : Configuration Firebase
- `src/services/firestore.ts` : Toutes les opérations Firestore
- `src/domain/calculations.ts` : Logique métier / calculs
- `src/types/index.ts` : Types TypeScript
- `.env` : Variables d'environnement (NE PAS COMMIT!)

---

## 🆘 Support

Si vous rencontrez des problèmes:
1. Vérifiez la console du navigateur (F12)
2. Vérifiez que Firebase est bien configuré
3. Vérifiez que les données de configuration existent dans Firestore
4. Vérifiez que vous êtes bien connecté

---

## 🎉 Félicitations!

Votre application **Cozy Production Tracker** est maintenant complète et prête à l'emploi!

Profitez bien de votre nouvel outil de gestion de production! 🌟
