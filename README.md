# MSPR-Frontend

Ce projet est une application web développée avec Next.js, React et TypeScript. Il utilise Tailwind CSS pour le style et de nombreux composants UI modernes pour une expérience utilisateur riche.

## Technologies principales

- **Next.js** : Framework React pour le rendu côté serveur et la génération de sites statiques.
- **React** : Bibliothèque JavaScript pour construire des interfaces utilisateur.
- **TypeScript** : Sur-ensemble de JavaScript ajoutant le typage statique.
- **Tailwind CSS** : Framework CSS utilitaire pour un design rapide et moderne.
- **Radix UI** : Composants d’interface utilisateur accessibles et non stylisés.
- **React Hook Form** : Gestion des formulaires et validation.
- **Zod** : Validation de schémas de données.
- **Recharts** : Graphiques et visualisations de données.
- **Date-fns** : Manipulation de dates.

## Structure du projet

- `app/` : Pages et routes de l’application (Next.js App Router)
- `components/` : Composants réutilisables (UI, formulaires, thèmes, etc.)
- `hooks/` : Hooks personnalisés React
- `lib/` : Fonctions utilitaires
- `public/` : Fichiers statiques
- `styles/` : Fichiers CSS globaux

## Scripts utiles

- `pnpm dev` : Démarre le serveur de développement
- `pnpm build` : Compile l’application pour la production
- `pnpm start` : Lance l’application en mode production
- `pnpm lint` : Analyse le code avec ESLint

## Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/Swaksm/MSPR-Frontend.git
   ```
2. Installez les dépendances :
   ```bash
   pnpm install
   ```
3. Lancez le serveur de développement :
   ```bash
   pnpm dev
   ```

## Configuration

- La configuration TypeScript se trouve dans `tsconfig.json`.
- La configuration Next.js est dans `next.config.mjs`.
- Les styles globaux sont dans `app/globals.css` et `styles/globals.css`.

## Contribution

Les contributions sont les bienvenues !

---

Pour toute question, ouvrez une issue sur le dépôt GitHub.
