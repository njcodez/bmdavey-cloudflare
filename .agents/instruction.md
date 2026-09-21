# Project Instructions & Workflow

Welcome to the B. M. Davey & Co. web application project. This guide outlines the deployment workflow, local testing procedures, and architectural decisions made for the Cloudflare Workers + OpenNext deployment. 

## 🚀 Deployment Workflow

You have a fully custom, robust deployment script that handles environment variable injection and deployment safely. 

**Whenever you make changes to the codebase and want to push to production, you ONLY need to run:**

```bash
npm run deploy
```

### What this does:
1. **Pulls Secrets**: It uses `dotenv-cli` to securely load your `.env` variables into the environment.
2. **Builds the App**: It runs `opennextjs-cloudflare build` to compile your Next.js application into a Cloudflare Worker compatible format.
3. **Deploys**: It runs `opennextjs-cloudflare deploy` to upload the Worker and static assets to Cloudflare. 

*Note: You do not need GitHub actions. You control when deployments happen right from your terminal.*

---

## 🧪 Verifying Locally Before Deploying

To ensure that your `npm run deploy` command won't fail in production, you should verify two things locally:

### 1. Verify the Build (Catches 99% of deploy errors)
Most deployment failures happen during the Next.js build phase (e.g., TypeScript errors, Zod environment validation errors, or Pre-rendering errors). 

To test this locally without deploying, run:
```bash
npm run build
```
*If this completes successfully, your deploy is almost guaranteed to succeed.*

### 2. Verify Runtime (Local Development)
When you are actively writing code, use the standard Next.js development server:
```bash
npm run dev
```

---

## 🔐 Environment Variables Guide

The project relies on two main environment files:

1. `.env`: Contains variables for your **local Next.js build and development**. (Includes `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, etc).
2. `.dev.vars`: Contains variables that are meant to mock Cloudflare Worker bindings locally (e.g., `NEXTJS_ENV=development`).

### How Production Environment Variables Work:
Because we are deploying to Cloudflare Workers, there is no traditional `process.env` on the production server. Instead, Cloudflare uses **bindings** and **vars**.

- **Public Variables**: Variables like `NEXT_PUBLIC_SUPABASE_URL` are explicitly defined in the `wrangler.jsonc` file under the `"vars"` block. 
- **Database Connection**: We bypass Cloudflare Hyperdrive due to a Supabase IPv4 firewall restriction. The direct Supabase Connection Pooler URL is placed securely in `wrangler.jsonc` as `DATABASE_URL`.

**IMPORTANT**: If you ever add a NEW environment variable that the production server needs to read, you MUST add it to the `"vars"` block in `wrangler.jsonc`.

---

## 🏗️ Going Forward: How to Build New Features

As you build out the project, keep these architectural patterns in mind:

### 1. Database (Drizzle ORM)
You are using Drizzle ORM connected to a PostgreSQL database (Supabase).
- **Schema**: Define your tables in `src/server/db/schema.ts`.
- **Migrations**: After altering the schema, push your changes to the database using:
  ```bash
  npm run db:push
  ```
- **Accessing DB**: Always import `db` from `src/server/db/index.ts` to execute queries in your Server Actions or Route Handlers.

### 2. File Uploads (Images)
You have a Cloudflare R2 or similar Image binding configured. If you build features like "Upload Product Image", ensure you interact with the `IMAGES` binding provided in the Cloudflare context.

### 3. Edge Compatibility
Because your app runs on Cloudflare Workers (Edge runtime), you cannot use Node.js specific native modules (like `fs` or `child_process`) inside your Server Components or API routes. Always ensure that the libraries you install are Edge-compatible.
