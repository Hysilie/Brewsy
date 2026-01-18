# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cozy Production Tracker** - A private, single-user web application for tracking production transformations, inventory (crates), and timers. The app has a cozy/pastel aesthetic with light and dark themes.

**Language**: French is the primary language for the project specification and likely for UI text.

**Stack**:
- React (frontend)
- Firebase Authentication (email/password, single authorized account)
- Firebase Firestore (all data storage)
- Hosting: GitHub Pages
- Styling: Tailwind CSS or equivalent with theme tokens

## Architecture

The application follows this recommended structure:

```
src/
  app/          # Routing and app shell
  features/     # Feature-based pages
  domain/       # Business logic and calculations (pure functions)
  services/     # Firebase, auth, and data repositories
  ui/           # Reusable UI components
  styles/       # Light/dark theme definitions
```

**Key Principles**:
- No hardcoded business data - all configuration comes from Firestore
- Business calculations isolated in `domain/` (pure functions)
- UI components kept simple and reusable
- Single user ID for all user data operations

## Data Model (Firestore)

### Configuration Data (read-only for users)
- Collection: `configs`, Document: `configs/default`
- Subcollection: `configs/default/transformations/{transformationId}`
  - Each transformation defines: input materials, tools with prices, duration, and crate output specs
  - If a transformation is watered/mixed, total time reduced by `timeReductionHours` (default: 1 hour)

### User Data (under `users/{uid}/`)
- `stocks/{crateId}` - Inventory of crates by type
- `prices/{crateId}` - Observed prices (array) for calculating averages
- `runs/{runId}` - Active transformation timers with status: `RUNNING`, `READY`, or `DONE`
- `history/{entryId}` - Historical transformation records

## Core Features

1. **Dashboard**: Quick view of stocks, total estimated value, and active/ready transformations
2. **Stocks**: Modify crate quantities, view estimated values
3. **Average Prices**: Add observed prices, auto-calculate averages
4. **Production Calculator**:
   - Select a transformation and quantity
   - Auto-calculate: materials needed, tools required, tool cost, discrete crate estimate
5. **Timers/Transformations**: Create runs with auto-calculated end times, option for "watered/mixed" (-1h)
6. **History**: Chronological list grouped by day

## Design System

**Theme**: Cozy, pastel, soft aesthetic

**Colors** (light mode): peach pink, butter yellow, lavender, sage, sky blue

**Dark mode**: Deep tones (not pure black), desaturated pastels as accents

**UI Elements**: Rounded cards, subtle shadows, non-aggressive inputs

## Firebase Security Rules

- `configs/**`: Read allowed for all authenticated users, write restricted
- `users/{uid}/**`: Read/write only if `request.auth.uid == uid`

## Development Workflow

Since this is a new project without build scripts yet, typical React + Firebase development commands would be:

- `npm install` or `yarn install` - Install dependencies (once package.json exists)
- `npm run dev` or `yarn dev` - Start development server
- `npm run build` - Build for production
- `npm run deploy` - Deploy to GitHub Pages (once configured)

## Important Notes

- This is a **private, single-user application** - authentication restricts access to one account
- All business logic should reference Firestore config data, never hardcode transformation rules
- Calculations (materials needed, tool costs, time reductions) belong in `domain/` modules
- Firestore timestamps should use `serverTimestamp()` for `createdAt` and `updatedAt` fields
