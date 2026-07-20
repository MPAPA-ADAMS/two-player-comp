# Prisma/PostgreSQL migration

This package migrates competition persistence from browser-only localStorage to PostgreSQL through Prisma ORM.

## Architecture

- PostgreSQL is the source of truth.
- Prisma stores one JSON CompetitionState per tournament.
- The app keeps a localStorage cache so the existing client components remain fast and do not require a large UI rewrite.
- On every page load, CompetitionDatabaseSync downloads current database state and refreshes the UI.
- Admin edits update the UI immediately and are then written to PostgreSQL.
- Public pages can read data, but PUT and DELETE require the existing admin cookie.

## 1. Copy files

Copy this package over the project root. Do not copy PACKAGE-CHANGES.json over package.json.

## 2. Install packages

npm install @prisma/client@7 @prisma/adapter-pg dotenv pg
npm install -D prisma@7 tsx @types/pg

Prisma 7 requires Node 20.19+, 22.12+, or 24+.

## 3. Update package.json

Add `"type": "module"` at the top level.

Merge these scripts:

"postinstall": "prisma generate",
"db:migrate": "prisma migrate dev",
"db:seed": "prisma db seed",
"db:studio": "prisma studio"

PACKAGE-CHANGES.json contains the exact additions.

## 4. Configure PostgreSQL

Copy `.env.example` to `.env` and replace DATABASE_URL with your PostgreSQL connection string.
Keep `.env.local` for ADMIN_PIN and ADMIN_SESSION_SECRET, or place all three values in `.env` during local development.

## 5. Create the database

npx prisma migrate dev --name init_competition_state
npx prisma db seed

Prisma 7 does not automatically seed after migrations, so run the seed command explicitly.

## 6. Start the app

npm run dev

Open `/admin`, edit a tournament, then open the site in a second browser. The second browser should receive the shared database state on page load.

## Important migration behaviour

The seed command uses `upsert` with an empty update. It creates missing T1-T8 records without overwriting existing database results.

After verifying PostgreSQL persistence, old localStorage values may be removed. The database synchroniser will repopulate the cache on reload.
