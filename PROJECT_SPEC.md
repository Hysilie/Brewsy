# Cozy Production Tracker — Project Spec

## 1. Connexion

- L’application est **privée**
- Utilisée par **un seul compte**
- Objectif : protéger les données, pas de multi-utilisateurs

### Authentification
- Firebase Authentication
- **Email / mot de passe**
- Pas d’inscription publique
- Un seul compte autorisé
- Une fois connecté, accès direct à toute l’app

---

## 2. Modèle de données (Firestore)

### 2.1 Données fixes (configuration)

Collection : `configs`  
Document : `configs/default`

```json
{
  "name": "default",
  "rules": {
    "timeReductionHours": 1
  },
  "updatedAt": "serverTimestamp"
}



Transformations

Sous-collection : configs/default/transformations/{transformationId}
1 document = 1 transformation
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

Notes :

Chaque outil a un prix

Le rendement est variable (pas de sortie fixe)

Si la transformation est arrosée ou mélangée, le temps total est réduit de 1 heure


2.2 Données utilisateur

Collection : users/{uid}
(un seul uid en pratique)

Stocks de caisses

users/{uid}/stocks/{crateId}

{
  "crateId": "crate_zeed",
  "label": "Caisse de Zeed",
  "quantity": 3,
  "updatedAt": "serverTimestamp"
}

Prix observés (pour moyenne)

users/{uid}/prices/{crateId}

{
  "crateId": "crate_zeed",
  "values": [1800, 1750, 1900],
  "updatedAt": "serverTimestamp"
}

Transformations en cours (timers)

users/{uid}/runs/{runId}
{
  "transformationId": "pandoxine",
  "inputQuantityUsed": 20,
  "startedAt": "timestamp",
  "durationHours": 96,
  "reducedByAction": true,
  "endsAt": "timestamp",
  "status": "RUNNING",
  "createdAt": "serverTimestamp"
}

Status possibles :

RUNNING

READY

DONE

Historique

users/{uid}/history/{entryId}
{
  "type": "TRANSFORMATION",
  "transformationId": "zeed",
  "startedAt": "timestamp",
  "endsAt": "timestamp",
  "reducedByAction": false,
  "createdAt": "serverTimestamp"
}

3. Fonctionnalités
Dashboard (vue rapide)

stocks de caisses

estimation de la valeur totale (stock × prix moyen)

transformations en cours / prêtes

Stocks

modification rapide des quantités de caisses

affichage de la valeur estimée par type

Prix moyens

ajout de prix observés

calcul automatique de la moyenne

affichage du nombre de valeurs

Calculateur de production

sélection d’une transformation

nombre de transformations souhaitées

calcul automatique :

matières nécessaires

nombre d’outils requis

coût total des outils

estimation discrète du nombre de caisses possibles

Timers / Transformations

création d’une transformation

calcul automatique de la date de fin

option “arrosé / mélangé” (-1h)

marquer une transformation comme terminée

Historique

liste chronologique

regroupement par jour

résumé simple de chaque transformation

4. Design & UX

Application responsive (mobile / desktop)

Thème clair et sombre

Ambiance cozy / pastel / douce

Cartes arrondies, ombres légères

Inputs “cozy” (non agressifs)

Lecture rapide, usage fréquent

Palette :

rose pêche, beurre, lavande, sauge, bleu ciel

mode sombre : tons profonds, non noirs, accents pastel désaturés

5. Architecture React

Structure recommandée :


src/
  app/          // routing, app shell
  features/     // pages par fonctionnalité
  domain/       // logique métier (calculs)
  services/     // firebase, auth, repositories
  ui/           // composants UI réutilisables
  styles/       // thèmes clair / sombre

Principes :

aucune donnée métier hardcodée

toutes les constantes viennent de Firestore

calculs isolés dans domain/

composants UI simples et réutilisables

6. Gestion des données

Firebase Firestore pour toutes les données

Firebase Auth (email / mot de passe)

Données config chargées au démarrage

Données utilisateur lues/écrites sous un seul uid

Écoute temps réel ou fetch + cache selon besoin

Sécurité Firestore

configs

/** : lecture autorisée, écriture restreinte

users/{uid}/** : lecture / écriture uniquement si request.auth.uid == uid

7. Stack technique

React

Firebase (Auth + Firestore)

Hébergement : GitHub Pages

CSS : Tailwind ou équivalent (tokens pour thème clair/sombre)
