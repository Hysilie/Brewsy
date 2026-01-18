# Journal de Progression - Cozy Production Tracker

## Date: 18 Janvier 2026

### Session 1: Installation et Configuration de Tailwind CSS

#### Contexte
Projet Vite + React + TypeScript initialisé avec Firebase installé.
Besoin d'installer Tailwind CSS pour l'esthétique cozy/pastel de l'application.

#### Actions Réalisées

**1. Installation des dépendances Tailwind CSS**
```bash
npm install -D tailwindcss postcss autoprefixer
```
- Ajout de 4 packages
- Aucune vulnérabilité détectée

**2. Création de `tailwind.config.js`**
Configuration personnalisée avec:
- Palette de couleurs cozy/pastel:
  - `peach` (rose pêche) - 50 à 900
  - `butter` (jaune beurre) - 50 à 900
  - `lavender` (lavande) - 50 à 900
  - `sage` (vert sauge) - 50 à 900
  - `sky` (bleu ciel) - 50 à 900
  - `dark` (tons sombres pour dark mode) - 50 à 950
- Border radius personnalisés:
  - `cozy`: 12px
  - `cozy-lg`: 16px
- Ombres personnalisées:
  - `cozy`: légère (0 2px 8px rgba(0, 0, 0, 0.08))
  - `cozy-lg`: plus prononcée (0 4px 16px rgba(0, 0, 0, 0.12))
- Mode sombre: `darkMode: 'class'`
- Content paths: `["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]`

**3. Création de `postcss.config.js`**
Configuration standard avec plugins tailwindcss et autoprefixer.

**4. Configuration de `src/index.css`**
Remplacement du CSS Vite par défaut par:
- Directives Tailwind (`@tailwind base`, `@tailwind components`, `@tailwind utilities`)
- Layer base avec:
  - Font-family système moderne
  - Gradient de fond mode clair: `from-peach-50 via-butter-50 to-lavender-50`
  - Gradient de fond mode sombre: `from-dark-900 via-dark-800 to-dark-900`

**5. Modification de `src/App.tsx`**
Création d'une page de test Tailwind montrant:
- Titre "Cozy Production Tracker" en peach
- Card blanche/dark avec ombres cozy
- Message de confirmation "Tailwind CSS est configuré avec succès !"
- Bouton avec gradient peach-lavender et compteur
- Démonstration des couleurs sage et sky
- Utilisation des border-radius et shadows personnalisés

**6. Vérification**
Serveur de développement lancé avec succès:
```bash
npm run dev
```
- Serveur accessible sur `http://localhost:5173/`
- Compilation réussie en ~1.2s
- Aucune erreur Tailwind

#### État Actuel du Projet

**Fichiers Modifiés:**
- `/Users/marion/Brewsy/package.json` (+ tailwindcss, postcss, autoprefixer)
- `/Users/marion/Brewsy/src/index.css` (configuration Tailwind)
- `/Users/marion/Brewsy/src/App.tsx` (page de test)

**Fichiers Créés:**
- `/Users/marion/Brewsy/tailwind.config.js`
- `/Users/marion/Brewsy/postcss.config.js`
- `/Users/marion/Brewsy/PROGRESS.md` (ce fichier)

**Serveur de Développement:**
- Status: En cours d'exécution (Background Bash ID: 7a519a)
- URL: http://localhost:5173/

#### Prochaines Étapes Suggérées

1. **Structure du projet**
   - Créer l'arborescence: `app/`, `features/`, `domain/`, `services/`, `ui/`

2. **Configuration Firebase**
   - Créer fichier de config Firebase
   - Setup Authentication
   - Setup Firestore

3. **Système de thème**
   - Context pour light/dark mode
   - Toggle de thème

4. **Composants UI de base**
   - Card
   - Button
   - Input
   - Layout/Container

5. **Pages principales**
   - Dashboard
   - Stocks
   - Prix Moyens
   - Calculateur de Production
   - Transformations/Timers
   - Historique

6. **Logique métier (domain/)**
   - Calculs de matériaux
   - Calculs de coûts outils
   - Calculs de temps (avec réduction si watered/mixed)
   - Calculs de crates discrètes

7. **Services Firestore**
   - Repository pour configs
   - Repository pour stocks
   - Repository pour prices
   - Repository pour runs
   - Repository pour history

#### Notes Importantes
- Projet pour un seul utilisateur (single-user app)
- Langue principale: Français
- Aucune donnée métier en dur - tout vient de Firestore
- Authentification Firebase avec email/password
- Règles de sécurité Firestore à configurer
