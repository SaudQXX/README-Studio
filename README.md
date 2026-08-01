# README.Studio (Internal Developer Setup)

## Prerequisites
- Node.js (v18+)
- npm or pnpm

## Environment Setup
1. Copy `.env.example` to `.env` in the root directory.
2. Fill in the required environment variables:
   - `GEMINI_API_KEY`: Get this from AI Studio.
   - `APP_URL`: Your local or hosted app URL.
   - Firebase variables: Follow the Firebase console to get these.

## Installation
Run the following command to install both frontend and backend dependencies:
```bash
npm install
```

## Running the App Locally
We use a combined Express and Vite setup. To run the local dev server:
```bash
npm run dev
```
The server will start on port 3000 (http://localhost:3000).

## Building for Production
```bash
npm run build
```
This builds the Vite frontend and bundles the Express backend to `dist/server.cjs`.

To run the production build:
```bash
npm run start
```

## Linting & Formatting
- **Lint (TS Strict Check)**: `npm run lint`
- **Format**: `npm run format`

## Architecture
- `src/`: Frontend React components, hooks, services.
- `server/`: Backend services, API routes, and prompt builders.
- `server.ts`: The main Express server entry point.
