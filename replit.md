# MyPortfolio

A personal portfolio website built with React + Vite (TypeScript).

## Project Structure

- `portfolio/` — React + Vite app (TypeScript)
  - `src/` — Source files
  - `vite.config.ts` — Vite config (port 5000, host 0.0.0.0, allowedHosts: true)
  - `package.json` — Dependencies and scripts

## Development

The app runs on port 5000 via the "Start application" workflow:
```
cd portfolio && npm run dev
```

## Deployment

Configured as a **static** deployment:
- Build: `cd portfolio && npm run build`
- Public dir: `portfolio/dist`

## Tech Stack

- React 19
- Vite 8
- TypeScript
