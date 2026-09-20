/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unused-vars */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { env } from "~/env";
import * as schema from "./schema";

/**
 * Get the database connection, using Hyperdrive binding if available,
 * otherwise falling back to the standard DATABASE_URL.
 */
export function getDb() {
  let connectionString = env.DATABASE_URL;
  
  try {
    const ctx = getCloudflareContext();
    if ((ctx?.env as any)?.HYPERDRIVE) {
      connectionString = (ctx.env as any).HYPERDRIVE.connectionString;
    }
  } catch (e) {
    // getCloudflareContext throws if not in Edge runtime / missing context
  }

  // Drizzle with `pg` driver using a Pool
  const client = new Pool({ connectionString });
  return drizzle(client, { schema });
}

// Export a proxy so we don't have to refactor every file importing `db`.
// The proxy will dynamically call getDb() whenever a property is accessed.
export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get: (target, prop) => {
    const actualDb = getDb();
    const value = (actualDb as any)[prop];
    if (typeof value === "function") {
      return value.bind(actualDb);
    }
    return value;
  }
});
