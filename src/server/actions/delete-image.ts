"use server";

import { createClient } from "@supabase/supabase-js";
import { env } from "~/env";

export async function deleteSupabaseImages(urls: string[]) {
  if (!urls || urls.length === 0) return;
  
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
    return;
  }
  
  const supabaseAdmin = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  const filePaths = urls.map(url => {
    // Extract the path after the bucket name ('images')
    const parts = url.split('/images/');
    if (parts.length === 2) {
      return parts[1]; // e.g., 'product-images/123.png'
    }
    return null;
  }).filter((p): p is string => p !== null);

  if (filePaths.length > 0) {
    const { error } = await supabaseAdmin.storage.from("images").remove(filePaths);
    if (error) {
      console.error("Failed to delete images from Supabase:", error);
    }
  }
}
