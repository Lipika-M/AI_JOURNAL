# Solace Frontend

Frontend client for Solace (AI Journal), built with React + TypeScript + Vite.

## Features

- Authentication flows (login/register) with protected routes
- Journal dashboard with:
  - Search by title/content/tags
  - Search-only mode (results shown below search bar)
  - Mood trend and sentiment analytics visuals
- Journal create/edit in modal flow
- Friendly auth error messages in UI
- Cookie-based auth with Axios interceptor + refresh token retry

## Tech

- React 19
- TypeScript
- Vite
- React Router DOM
- Axios
- TailwindCSS (via global stylesheet usage)

## Environment

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Install

```bash
cd frontend
npm install
```

## Run

```bash
npm run dev
```

Frontend will run on Vite default host/port (typically `http://localhost:5173`).

## Scripts

- `npm run dev` — start development server
- `npm run build` — typecheck + production build
- `npm run preview` — preview production build
- `npm run lint` — run ESLint

## Folder Overview

```text
src/
├── api/          # Axios client + endpoint wrappers
├── components/   # Reusable UI components
├── context/      # Auth context/provider
├── hooks/        # Custom hooks
├── pages/        # Route pages
├── routes/       # Route guards
└── types/        # TS types
```

## Notes

- Make sure backend is running and CORS allows the frontend origin.
- `withCredentials: true` is enabled in Axios client for cookie auth.
