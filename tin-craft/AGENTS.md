# Repository Guidelines

## Project Structure & Module Organization

This is an Electron application built with React and TypeScript. Electron's main process lives in `src/main/`; keep OS integration, game launching, updates, and persistent storage there. The context bridge and renderer-facing types belong in `src/preload/`. UI code is under `src/renderer/src/`, organized into `screens/`, `features/`, `components/`, `providers/`, `hooks/`, and `utils/`. Static UI assets live in `src/renderer/src/assets/` or `src/renderer/public/`; packaged runtime files belong in `resources/`. Treat `out/`, `dist/`, `server-build/`, and `node_modules/` as generated content.

## Build, Test, and Development Commands

- `npm install` installs dependencies and rebuilds Electron native dependencies.
- `npm run dev` starts Electron with Vite hot reloading.
- `npm run lint` checks TypeScript and React code with ESLint.
- `npm run typecheck` validates both Node/Electron and renderer TypeScript projects.
- `npm run format` rewrites supported files with Prettier.
- `npm run build` type-checks and creates production bundles in `out/`.
- `npm run build:win` (or `build:mac`, `build:linux`) creates platform packages with electron-builder.
- `npm run start` previews the built application.

## Coding Style & Naming Conventions

Follow `.editorconfig`: UTF-8, LF line endings, two-space indentation, final newlines, and no trailing whitespace. Prettier enforces single quotes, no semicolons, a 100-character line width, and no trailing commas. Use PascalCase for React components and their files (`StatusBar.tsx`), camelCase for hooks and utilities (`useAutoRotation.ts`), and `*.module.css` for component-scoped styles. Prefer each feature or component's `index.ts` public entry point over deep imports.

## Testing Guidelines

No automated test framework or coverage threshold is configured yet. Before submitting changes, run `npm run lint`, `npm run typecheck`, and `npm run build`; manually exercise affected flows with `npm run dev`. If introducing tests, colocate them as `*.test.ts` or `*.test.tsx` and add the runner command to `package.json` and this guide.

## Commit & Pull Request Guidelines

Recent commits use short, imperative, lowercase summaries such as `add shaderpacks` and `fix bugs`; keep commits focused and describe one logical change. Pull requests should explain the user-visible impact, list verification performed, and link related issues. Include screenshots or recordings for renderer changes and call out packaging, resource, environment, or Electron IPC changes explicitly.

## Security & Configuration

Never commit credentials or production secrets from `.env` files. Keep privileged Node APIs in the main process, expose only narrow typed operations through the preload bridge, and validate renderer-provided IPC inputs.
