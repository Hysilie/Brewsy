# Guide de Configuration Firebase - Cozy Production Tracker

## ✅ Configuration Firebase terminée!

Votre configuration Firebase est maintenant en place. Suivez ces étapes pour finaliser l'installation.

---

## 📋 Étape 1 : Configurer Firestore Database

### 1.1 Créer la base de données
1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet **brewsy-6e24c**
3. Dans le menu de gauche, cliquez sur **Firestore Database**
4. Cliquez sur **Créer une base de données**
5. Choisissez **Mode production**
6. Sélectionnez une localisation (ex: `europe-west1` pour l'Europe)

### 1.2 Configurer les règles de sécurité
1. Dans Firestore, allez dans l'onglet **Règles**
2. Copiez le contenu du fichier `firestore.rules` de votre projet
3. Collez-le dans l'éditeur de règles
4. Cliquez sur **Publier**

Les règles garantissent que :
- ✅ Seuls les utilisateurs authentifiés peuvent lire les configurations
- ✅ Chaque utilisateur ne peut accéder qu'à ses propres données
- ✅ Les configurations ne peuvent être modifiées que via la console

---

## 📦 Étape 2 : Initialiser les données de configuration

### 2.1 Créer la collection configs

1. Dans Firestore, cliquez sur **Commencer une collection**
2. ID de la collection : `configs`
3. ID du document : `default`
4. Ajoutez ces champs :
   ```
   name (string) : "default"
   rules (map) :
     └── timeReductionHours (number) : 1
   updatedAt (timestamp) : (cliquez sur l'horloge pour timestamp serveur)
   ```

### 2.2 Créer les transformations

1. Dans le document `configs/default`, cliquez sur **Ajouter une sous-collection**
2. ID de la sous-collection : `transformations`

#### Transformation 1 : Zeed
ID du document : `zeed`
```
id (string) : "zeed"
name (string) : "Zeed"
input (map) :
  └── materialName (string) : "Feuille"
  └── quantity (number) : 60
tool (map) :
  └── name (string) : "Pot de terre"
  └── price (number) : 250
durationHours (number) : 48
crate (map) :
  └── name (string) : "Caisse de Zeed"
  └── quantityPerCrate (number) : 20
```

#### Transformation 2 : Pandoxine
ID du document : `pandoxine`
```
id (string) : "pandoxine"
name (string) : "Pandoxine"
input (map) :
  └── materialName (string) : "Bambou"
  └── quantity (number) : 80
tool (map) :
  └── name (string) : "Alambic"
  └── price (number) : 500
durationHours (number) : 96
crate (map) :
  └── name (string) : "Caisse de Pandoxine"
  └── quantityPerCrate (number) : 15
```

#### Transformation 3 : Essence Florale
ID du document : `essence_florale`
```
id (string) : "essence_florale"
name (string) : "Essence Florale"
input (map) :
  └── materialName (string) : "Pétale"
  └── quantity (number) : 100
tool (map) :
  └── name (string) : "Pressoir"
  └── price (number) : 350
durationHours (number) : 72
crate (map) :
  └── name (string) : "Caisse d'Essence Florale"
  └── quantityPerCrate (number) : 25
```

💡 **Conseil** : Vous pouvez ajouter autant de transformations que vous voulez en suivant le même format!

---

## 👤 Étape 3 : Créer un compte utilisateur

### 3.1 Activer l'authentification Email/Password
1. Dans Firebase Console, allez dans **Authentication**
2. Cliquez sur **Commencer**
3. Dans l'onglet **Sign-in method**, activez **E-mail/Mot de passe**
4. Assurez-vous que la première option est activée (pas le lien email)

### 3.2 Créer votre compte
1. Allez dans l'onglet **Users**
2. Cliquez sur **Ajouter un utilisateur**
3. Entrez votre email et mot de passe
4. Cliquez sur **Ajouter un utilisateur**

⚠️ **Important** : Notez bien votre email et mot de passe, vous en aurez besoin pour vous connecter!

---

## 🚀 Étape 4 : Lancer l'application

### En mode développement
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5174`

### Première connexion
1. Ouvrez l'application dans votre navigateur
2. Vous serez redirigé vers la page de connexion
3. Entrez l'email et le mot de passe que vous avez créés
4. Vous accéderez au Dashboard!

---

## 🎨 Étape 5 : Tester l'application

Une fois connecté, vous devriez voir :
- ✅ Le Dashboard avec 3 cartes de statistiques
- ✅ La navigation (sidebar sur desktop, bottom nav sur mobile)
- ✅ Les couleurs pastel/cozy

**Les données utilisateur seront vides au début** car vous n'avez pas encore :
- Ajouté de stocks de caisses
- Enregistré de prix moyens
- Créé de transformations/timers

C'est normal! Les pages pour gérer ces données seront implémentées ensuite.

---

## 🔍 Vérification

Pour vérifier que tout fonctionne :

1. **Firebase fonctionne** : Vous pouvez vous connecter
2. **Firestore fonctionne** : Pas d'erreurs dans la console du navigateur (F12)
3. **Les transformations sont chargées** : Ouvrez la console et tapez :
   ```javascript
   // Cette commande sera utilisée plus tard dans l'app
   ```

---

## 📝 Prochaines étapes

Maintenant que Firebase est configuré, nous pouvons implémenter les pages manquantes :

1. **Page Stocks** - Gérer vos caisses
2. **Page Prix** - Enregistrer les prix observés
3. **Calculateur** - Calculer les ressources nécessaires
4. **Timers** - Gérer les transformations en cours
5. **Historique** - Voir l'historique des transformations

---

## ❓ Problèmes courants

### Erreur "Permission denied"
- Vérifiez que les règles Firestore sont bien configurées
- Vérifiez que vous êtes bien connecté

### Erreur de connexion
- Vérifiez que l'authentification Email/Password est activée
- Vérifiez que le compte utilisateur existe

### Page blanche
- Ouvrez la console du navigateur (F12) pour voir les erreurs
- Vérifiez que le fichier `.env` existe et contient vos clés Firebase

---

## 🎉 Félicitations!

Votre application Cozy Production Tracker est maintenant configurée et prête à être utilisée!

Voulez-vous que je continue avec l'implémentation des autres pages?
