# Docker quickstart for this Vite + React app

## Dev mode (HMR)
1. Put these files in the project root (same folder as package.json).
2. Start the dev container:
   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```
3. Open http://localhost:5173

## Production build (static files served by Nginx)
1. Build the production image:
   ```bash
   docker compose build
   ```
2. Run it:
   ```bash
   docker compose up -d
   ```
3. Open http://localhost:8080

## Environment variables
- For Vite, only variables prefixed with `VITE_` are exposed to the client at build time.
- If you need `VITE_*` envs, create a `.env` file and either:
  - dev: uncomment `env_file` in `docker-compose.dev.yml`
  - prod: build with build args or `.env` and **rebuild** so values are baked into the bundle.

## Common issues
- **HMR not updating in Docker** → polling is enabled with `CHOKIDAR_USEPOLLING`/`WATCHPACK_POLLING`.
- **node_modules disappears when using volumes** → the anonymous volume `/app/node_modules` prevents shadowing.
- **Cannot access the dev server from the host** → we bind to `0.0.0.0` and publish port `5173` in compose.
- **404 on SPA routes in prod** → Nginx is configured to `try_files $uri /index.html` for SPA fallback.
