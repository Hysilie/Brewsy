# 🚀 Initialisation Firestore en 1 CLIC!

## Étape 1: Les règles de sécurité (30 secondes)

1. Allez sur [Firebase Console - Règles](https://console.firebase.google.com/u/0/project/brewsy-6e24c/firestore/rules)
2. Copiez-collez ceci:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /configs/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;  // ← Temporaire pour l'initialisation
    }
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

3. Cliquez sur **"Publier"**

⚠️ **Note:** On autorise temporairement l'écriture pour l'initialisation. Après, vous pourrez changer `write: if request.auth != null` en `write: if false` pour plus de sécurité.

---

## Étape 2: Initialisation automatique (10 secondes)

1. **Allez sur** http://localhost:5173/setup

2. **Cliquez sur le gros bouton** "🚀 Initialiser Firestore"

3. **Attendez** quelques secondes

4. **C'est tout!** ✅

---

## ✅ Qu'est-ce qui a été créé?

- ✅ Collection `configs/default`
- ✅ Règle de temps (-1h si arrosé/mélangé)
- ✅ 4 transformations:
  - 🌿 **Zeed** (Feuille → 48h)
  - 🥩 **Pandoxine** (Viande → 96h)
  - 🛢️ **Krakenine** (Huile → 24h)
  - 🍄 **Psylocybine** (Champignon → 72h)

---

## 🎯 Testez tout de suite!

1. **Rafraîchissez** l'application (F5)
2. **Page Stocks** → Vous voyez les 4 caisses avec icônes 🌿🥩🛢️🍄
3. **Boutons +/-** → Ils fonctionnent!
4. **Page Prix** → Vous voyez les 4 types
5. **Calculateur** → Les transformations sont dans le dropdown

---

## 💡 Astuce

Les **stocks et prix** se créent automatiquement quand vous:
- Modifiez une quantité (boutons +/-)
- Ajoutez un prix

Pas besoin de les créer manuellement!

---

## ⏱️ Temps total

- **Règles:** 30 sec
- **Initialisation:** 10 sec

**Total: 40 secondes** ⚡

---

## 🔥 La page `/setup` peut être supprimée après

Une fois l'initialisation faite, vous pouvez:
- Supprimer le fichier `src/features/setup/SetupPage.tsx`
- Supprimer la route `/setup` dans `App.tsx`
- Supprimer le service `src/services/initFirestore.ts`

Ou la garder au cas où vous voulez réinitialiser!

---

## 🆘 En cas de problème

**"Permission denied"**
→ Vérifiez que les règles Firestore sont bien publiées

**"Le bouton ne fait rien"**
→ Ouvrez la console (F12) et regardez les erreurs

**"Page blanche"**
→ Vérifiez que vous êtes bien connecté à l'application

---

## 🎉 C'est fini!

Votre application est maintenant **100% fonctionnelle** et prête à l'emploi!

Amusez-vous bien avec votre Cozy Production Tracker! 🌟
