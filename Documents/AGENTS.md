# Repository Guidelines

## Project Structure & Module Organization
NaviMart is split into a NestJS API and a React/Vite client. Backend code lives in `backend/src/`, organized by feature modules such as `auth/`, `families/`, `shopping-lists/`, `pantry/`, `recipes/`, `meals/`, `reports/`, `notifications/`, `admin/`, and `catalog/`. Backend e2e tests live in `backend/test/`; unit and API specs sit beside source as `*.spec.ts` or `*.api.spec.ts`.

Frontend code lives in `frontend/src/`: `pages/` for routed screens, `components/` for shared UI, `contexts/` for providers, `api/` for HTTP/socket clients, `utils/` for helpers, and `assets/` for images/logos. Docs and diagrams are kept at the root, `diagrams/`, `DetailedDesign/`, and `test/`.

## Project instructions

- Respond in Vietnamese
- Prefer minimal changes.
- Do not refactor unrelated code.
- Do not rename files, folders, APIs, DTOs, schemas, or components unless required.
- Start by reading only the files directly related to the task.
- Before editing more than 3 files, explain why.
- Keep existing API response formats unless the task explicitly requires a change.
- Do not change UI design unless the task is about UI.
- Do not add new dependencies unless necessary.
- Do not modify .env files or commit secrets.
- After changes, summarize only:
- What changed
- Files changed
- How to test

## Build, Test, and Development Commands
Install dependencies per app:

```powershell
cd backend; npm install
cd ../frontend; npm install
```

Run locally:

```powershell
cd backend; npm run start:dev   # API at http://localhost:3000/api
cd frontend; npm run dev        # web app at http://localhost:5173
```

Checks:

```powershell
cd backend; npm run build; npm test; npm run test:e2e
cd frontend; npm run build; npm run lint; npm test
```

Use `npm run seed` in `backend/` for sample data and the admin user.

## Coding Style & Naming Conventions
Use TypeScript throughout. Backend formatting is Prettier with single quotes and trailing commas; run `npm run format` before large changes. Follow NestJS naming: `*.module.ts`, `*.controller.ts`, `*.service.ts`, DTOs in `dto/`, schemas in `schemas/`, and kebab-case feature folders.

Frontend components and pages use PascalCase filenames such as `ProtectedRoute.tsx`. Utility and API modules use lower camelCase exports. Reuse existing Tailwind and component patterns.

## Testing Guidelines
Backend uses Jest, Supertest, and `mongodb-memory-server` for e2e flows. Keep unit specs near code as `name.service.spec.ts`, `name.controller.spec.ts`, or `name.controller.api.spec.ts`; put e2e coverage in `backend/test/*.e2e-spec.ts`. Frontend uses Vitest with React Testing Library; colocate tests as `Component.test.tsx` or `helper.test.ts`.

Run affected app tests before submitting. Backend changes touching auth, permissions, inventory, or reports need e2e coverage.

## Commit & Pull Request Guidelines
Recent commits are short imperative summaries such as `add test`, `done uc`, and `add schedule`. Keep messages concise but descriptive, for example `add pantry expiry e2e tests`.

Pull requests should include purpose, changed areas (`backend`, `frontend`, docs, diagrams), commands run, linked task when available, and screenshots for UI changes. Note skipped tests or required env vars.

## Security & Configuration Tips
Do not commit `.env` files or secrets. Start from `backend/.env.example` and `frontend/.env.example`; set `VITE_API_URL` to the backend API and keep JWT, Cloudinary, TimelyGPT, and Gmail credentials local.
