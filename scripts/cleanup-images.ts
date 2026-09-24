import { createClient } from "@supabase/supabase-js";
import { db } from "../src/server/db/index";
import { productImages } from "../src/server/db/schema";
import "dotenv/config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Fetching images from Supabase Storage...");
  
  // Need to handle pagination if there are many files, but limit 1000 should suffice for 176 files.
  const { data: files, error } = await supabaseAdmin.storage
    .from("images")
    .list("product-images", { limit: 1000 });
    
  if (error) {
    console.error("Error fetching from supabase:", error);
    return;
  }
  
  if (!files || files.length === 0) {
    console.log("No files found in Supabase 'product-images' folder.");
    return;
  }
  
  console.log(`Found ${files.length} files in Supabase 'product-images' folder.`);

  console.log("Fetching active images from database...");
  const dbImages = await db.query.productImages.findMany();
  
  const validUrls = new Set(dbImages.map(img => img.url));
  console.log(`Found ${dbImages.length} active images in the database.`);
  
  let deletedCount = 0;
  
  for (const file of files) {
    if (!file.id && file.name === '.emptyFolderPlaceholder') continue;
    
    const filePath = `product-images/${file.name}`;
    const { data } = supabaseAdmin.storage.from("images").getPublicUrl(filePath);
    
    if (!validUrls.has(data.publicUrl)) {
      console.log(`Deleting orphaned file: ${filePath}`);
      const { error: delErr } = await supabaseAdmin.storage.from("images").remove([filePath]);
      if (delErr) {
        console.error(`Failed to delete ${filePath}:`, delErr);
      } else {
        deletedCount++;
      }
    }
  }
  
  console.log(`Cleanup complete. Deleted ${deletedCount} orphaned files.`);
  process.exit(0);
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
