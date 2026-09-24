# Setup Template: Next.js + Drizzle ORM + Supabase PostgreSQL + OpenNext + Cloudflare

This template documents the exact setup used in this project, which you can replicate for other projects. It combines Next.js 15, Drizzle ORM (with PostgreSQL/Supabase), OpenNext for Cloudflare compatibility, and Wrangler for deployment.

## 1. Initial Setup

Create a new Next.js project (this project started with Create T3 App for a solid foundation):

```bash
npx create-t3-app@latest my-app
# or standard Next.js:
npx create-next-app@latest my-app
cd my-app
```

## 2. Install Dependencies

### Database (Drizzle ORM & PostgreSQL)
```bash
npm install drizzle-orm pg @supabase/supabase-js
npm install -D drizzle-kit @types/pg
```

### Cloudflare & OpenNext
```bash
npm install -D @opennextjs/cloudflare wrangler dotenv-cli
```

## 3. Configuration Files

### `drizzle.config.ts`
Setup Drizzle to point to your Supabase PostgreSQL database:

```typescript
import { type Config } from "drizzle-kit";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
  tablesFilter: ["my_app_*"],
} satisfies Config;
```

### `open-next.config.ts`
Create this file in the root to configure OpenNext for Cloudflare:

```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // You can configure R2 incremental caching here
});
```

### `wrangler.jsonc`
Create the Wrangler configuration for local testing and deploying to Cloudflare:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "main": ".open-next/worker.js",
  "name": "my-app",
  "compatibility_date": "2026-09-20",
  "compatibility_flags": [
    "nodejs_compat",
    "global_fetch_strictly_public"
  ],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "services": [
    {
      "binding": "WORKER_SELF_REFERENCE",
      "service": "my-app" // Must match the name above
    }
  ],
  "images": {
    "binding": "IMAGES"
  }
}
```

## 4. `package.json` Scripts

Add these deployment and DB commands to your `scripts` in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "deploy": "npx --yes dotenv-cli -e .env -- opennextjs-cloudflare build && npx --yes dotenv-cli -e .env -- opennextjs-cloudflare deploy"
  }
}
```

## 5. Local Development Workflow

1. **Environment Variables**: Create a `.env` file with `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. **Database Schema**: Define your tables in `src/server/db/schema.ts` using Drizzle syntax.
3. **Sync Database**: Run `npm run db:push` to apply your schema to Supabase.
4. **Develop UI**: Run `npm run dev` to start the local Next.js server. Open `localhost:3000` and start messing around with your `.tsx` components in `src/app` and `src/components`.

## 6. Testing & Deploying to Cloudflare

- **Test Cloudflare Build Locally**: `npm run preview`
- **Deploy to Cloudflare**: `npm run deploy` (This uses dotenv-cli to pass your `.env` variables securely during the OpenNext build and Wrangler deployment process)
