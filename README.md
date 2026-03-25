# Mida

Base desktop avec Electron, React, Vite, Tailwind CSS et `shadcn/ui`.

## Scripts

- `npm run dev` lance l'application en développement
- `npm run build` compile `main`, `preload` et `renderer`
- `npm run dist` génère un package installable avec `electron-builder`

## Structure

- `src/main` contient le process principal Electron
- `src/preload` expose une API minimale au renderer
- `src/renderer` contient l'interface React

## Choix

- structure courte et lisible
- séparation claire des responsabilités
- base `shadcn/ui` prête pour ajouter d'autres composants
