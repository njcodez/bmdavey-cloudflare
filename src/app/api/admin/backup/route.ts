import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import JSZip from "jszip";

// Force Edge runtime if desired, but next-on-pages handles this.


export async function GET() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin-session")?.value !== "authenticated") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const allProducts = await db.query.products.findMany({
    with: {
      productVariants: {
        with: {
          productImages: {
            orderBy: (imgs, { asc }) => [asc(imgs.order)],
          },
        },
      },
    },
  });

  const zip = new JSZip();
  let csvContent = "id,name,brand,base_price,mrp,category,target_demographic,gears,wheel_size_t,key_features,color_name,color_label,in_stock,image_filenames\n";

  for (const product of allProducts) {
    const keyFeaturesArr = [];
    if (product.key_features) {
      for (const [k, v] of Object.entries(product.key_features)) {
        if (v && typeof v === "string") {
          keyFeaturesArr.push(`${k}: ${v}`);
        }
      }
    }
    const keyFeaturesStr = keyFeaturesArr.join(", ").replace(/"/g, '""');

    for (const variant of product.productVariants) {
      const imageFilenames: string[] = [];
      let imgIndex = 1;
      
      for (const img of variant.productImages) {
        try {
          const res = await fetch(img.url);
          if (res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            const safeProductName = product.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
            const safeColorName = variant.color_name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
            const filename = `${product.id}_${safeProductName}_${safeColorName}_${imgIndex}.png`;
            
            zip.file(`images/${filename}`, arrayBuffer);
            imageFilenames.push(`images/${filename}`);
            imgIndex++;
          }
        } catch (e) {
          console.error(`Failed to fetch image ${img.url}`, e);
        }
      }

      const row = [
        product.id,
        `"${product.name.replace(/"/g, '""')}"`,
        `"${product.brand.replace(/"/g, '""')}"`,
        product.base_price,
        product.mrp,
        `"${product.category}"`,
        `"${product.target_demographic}"`,
        product.gears ?? "",
        `"${product.wheel_size_t ?? ""}"`,
        `"${keyFeaturesStr}"`,
        `"${variant.color_name.replace(/"/g, '""')}"`,
        `"${(variant.color_label ?? variant.color_name).replace(/"/g, '""')}"`,
        variant.in_stock ? "TRUE" : "FALSE",
        `"${imageFilenames.join(",")}"`,
      ];
      
      csvContent += row.join(",") + "\n";
    }
  }

  zip.file("products_backup.csv", csvContent);

  const dateStr = new Date().toISOString().split("T")[0];
  
  // Cloudflare Workers support returning a ReadableStream directly via a transform
  // or we can generate a Blob. For simplicity in Edge, we generate a Uint8Array.
  // Note: For massive DBs, this might hit the 128MB memory limit.
  const content = await zip.generateAsync({ type: "blob" });

  return new NextResponse(content, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="bmdavey_backup_${dateStr}.zip"`,
    },
  });
}
