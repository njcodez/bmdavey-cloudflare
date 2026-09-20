"use server";

import { createClient } from "@supabase/supabase-js";
import { env } from "~/env";

export async function uploadImageAction(formData: FormData) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured in your .env file.");
  }
  
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file was provided for upload.");
  }
  
  // Initialize Supabase client bypassing RLS
  const supabaseAdmin = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `product-images/${fileName}`;

  const { error } = await supabaseAdmin.storage
    .from('images')
    .upload(filePath, file);

  if (error) {
    throw new Error(`Admin Storage Error: ${error.message}`);
  }

  const { data: publicData } = supabaseAdmin.storage.from('images').getPublicUrl(filePath);
  return publicData.publicUrl;
}
