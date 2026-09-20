"use server";

import { db } from "~/server/db";
import { products, productVariants } from "~/server/db/schema";
import { eq, ilike, or, and, sql, asc, desc, gte, lte, inArray, notInArray } from "drizzle-orm";

type StorefrontProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  targetDemographic?: string;
  frameMaterial?: string;
  gears?: string;
  heightInches?: number;
  heightRange?: string;
  minPrice?: number;
  maxPrice?: number;
  gender?: string;
  brakes?: string;
  wheelSize?: string;
  availability?: string;
  ageRange?: string;
};

export async function getStorefrontProducts({
  page = 1,
  limit = 15,
  search = "",
  category,
  targetDemographic,
  frameMaterial,
  gears,
  heightInches,
  heightRange,
  minPrice,
  maxPrice,
  gender,
  brakes,
  wheelSize,
  availability,
  ageRange,
}: StorefrontProductsParams) {
  const conditions = [];
  let searchWhere;

  if (search) {
    const searchConditions = [
      ilike(products.name, `%${search}%`),
      ilike(products.brand, `%${search}%`),
      ilike(products.category, `%${search}%`),
      ilike(products.target_demographic, `%${search}%`),
      ilike(products.frame_material, `%${search}%`),
      ilike(products.gender, `%${search}%`),
      ilike(products.brakes, `%${search}%`),
      ilike(products.wheel_size_t, `%${search}%`),
      inArray(
        products.id,
        db.select({ id: productVariants.product_id })
          .from(productVariants)
          .where(ilike(productVariants.color_name, `%${search}%`))
      )
    ];

    const searchNum = parseInt(search);
    if (!isNaN(searchNum)) {
      searchConditions.push(eq(products.gears, searchNum));
    }

    searchWhere = or(...searchConditions);
    conditions.push(searchWhere);
  }
  if (category) conditions.push(eq(products.category, category));
  if (targetDemographic) conditions.push(eq(products.target_demographic, targetDemographic));
  if (frameMaterial) conditions.push(eq(products.frame_material, frameMaterial));
  if (gender) conditions.push(eq(products.gender, gender));
  if (brakes) conditions.push(eq(products.brakes, brakes));
  if (wheelSize) conditions.push(ilike(products.wheel_size_t, `%${wheelSize}%`));
  if (ageRange) {
    const [filterMinStr, filterMaxStr] = ageRange.split("-");
    const filterMin = parseInt(filterMinStr ?? "");
    if (!isNaN(filterMin)) {
      const filterMax = parseInt(filterMaxStr ?? "");
      const fMax = isNaN(filterMax) ? 20 : filterMax;
      conditions.push(
        sql`
          CASE 
            WHEN ${products.age_range} ~ '^[0-9]+-[0-9]+$' THEN
              CAST(SPLIT_PART(${products.age_range}, '-', 1) AS INTEGER) <= ${fMax} AND CAST(SPLIT_PART(${products.age_range}, '-', 2) AS INTEGER) >= ${filterMin}
            ELSE FALSE
          END
        `
      );
    }
  }
  
  if (availability === "in_stock") {
    conditions.push(
      inArray(
        products.id,
        db.select({ id: productVariants.product_id })
          .from(productVariants)
          .where(eq(productVariants.in_stock, true))
      )
    );
  } else if (availability === "out_of_stock") {
    conditions.push(
      notInArray(
        products.id,
        db.select({ id: productVariants.product_id })
          .from(productVariants)
          .where(eq(productVariants.in_stock, true))
      )
    );
  }

  // Gears filter: "1" = single, "7" = 7-speed, "21" = 21+
  if (gears) {
    const gearsNum = parseInt(gears);
    if (gearsNum >= 21) {
      conditions.push(gte(products.gears, 21));
    } else {
      conditions.push(eq(products.gears, gearsNum));
    }
  }

  // Height filter (legacy explicit height check)
  if (heightInches) {
    conditions.push(lte(products.height_min_inches, heightInches));
    conditions.push(gte(products.height_max_inches, heightInches));
  }
  
  // Height range overlap filter (e.g. "30-48", "72-100")
  if (heightRange) {
    const [minStr, maxStr] = heightRange.split("-");
    const minRange = parseInt(minStr ?? "");
    const maxRange = parseInt(maxStr ?? "");
    if (!isNaN(minRange) && !isNaN(maxRange)) {
      conditions.push(
        and(
          lte(products.height_min_inches, maxRange),
          gte(products.height_max_inches, minRange)
        )
      );
    }
  }

  // Price range filter
  if (minPrice) conditions.push(gte(sql`${products.base_price}::numeric`, minPrice));
  if (maxPrice) conditions.push(lte(sql`${products.base_price}::numeric`, maxPrice));

  const baseWhere = conditions.length > 0 ? and(...conditions) : undefined;

  // 1. Get total count
  const _totalRes = await db
    .select({ totalCount: sql<number>`count(*)::int` })
    .from(products)
    .where(baseWhere);
  const totalCount = _totalRes[0]?.totalCount ?? 0;

  const totalPages = Math.ceil(totalCount / limit);
  const queryOffset = (page - 1) * limit;

  // 2. Fetch the specific page of products
  const data = await db.query.products.findMany({
    where: baseWhere,
    orderBy: [desc(products.is_featured), asc(products.name)],
    limit: limit,
    offset: queryOffset,
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

  const isFetchingFeatured = page === 1 && data.some(p => p.is_featured);

  // 4. Extract Dynamic Filter Options (based on current search/base conditions)
  const filterData = await db
    .select({
      category: products.category,
      targetDemographic: products.target_demographic,
      frameMaterial: products.frame_material,
      gears: products.gears,
      brakes: products.brakes,
      wheelSize: products.wheel_size_t,
      gender: products.gender,
      ageRange: products.age_range,
    })
    .from(products)
    .where(searchWhere); // Filter options only by text search, not selected facets

  const availableFilters = {
    categories: Array.from(new Set(filterData.map(d => d.category).filter((x): x is string => Boolean(x)))),
    demographics: Array.from(new Set(filterData.map(d => d.targetDemographic).filter((x): x is string => Boolean(x)))),
    frameMaterials: Array.from(new Set(filterData.map(d => d.frameMaterial).filter((x): x is string => Boolean(x)))),
    gears: Array.from(new Set(filterData.map(d => d.gears).filter((x): x is number => x !== null && x !== undefined))),
    brakes: Array.from(new Set(filterData.map(d => d.brakes).filter((x): x is string => Boolean(x)))),
    wheelSizes: Array.from(new Set(filterData.flatMap(d => d.wheelSize ? d.wheelSize.split(",").map(s => s.trim()) : []))),
    genders: Array.from(new Set(filterData.map(d => d.gender).filter((x): x is string => Boolean(x)))),
    ageRanges: Array.from(new Set(filterData.map(d => d.ageRange).filter((x): x is string => Boolean(x)))),
  };

  return {
    products: data,
    pagination: {
      currentPage: page,
      totalPages: totalPages === 0 ? 1 : totalPages,
      isFeaturedPage: isFetchingFeatured,
    },
    availableFilters,
  };
}
