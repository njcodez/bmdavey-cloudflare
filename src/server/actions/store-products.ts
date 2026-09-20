"use server";

import { db } from "~/server/db";
import { products, productVariants } from "~/server/db/schema";
import { eq, ilike, or, and, sql, asc, desc, gte, lte, inArray, notInArray, type SQL } from "drizzle-orm";

type StorefrontProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string | string[];
  targetDemographic?: string | string[];
  frameMaterial?: string | string[];
  gears?: string | string[];
  heightInches?: number;
  heightRange?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  gender?: string | string[];
  brakes?: string | string[];
  wheelSize?: string | string[];
  availability?: string | string[];
  ageRange?: string | string[];
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

  const toArray = (val: string | string[] | undefined): string[] => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  };

  const categories = toArray(category);
  if (categories.length > 0) conditions.push(inArray(products.category, categories));

  const demographics = toArray(targetDemographic);
  if (demographics.length > 0) conditions.push(inArray(products.target_demographic, demographics));

  const frames = toArray(frameMaterial);
  if (frames.length > 0) conditions.push(inArray(products.frame_material, frames));

  const genders = toArray(gender);
  if (genders.length > 0) conditions.push(inArray(products.gender, genders));

  const brakeList = toArray(brakes);
  if (brakeList.length > 0) conditions.push(inArray(products.brakes, brakeList));

  const wheels = toArray(wheelSize);
  if (wheels.length > 0) {
    const wheelConditions = wheels.map(w => ilike(products.wheel_size_t, `%${w}%`));
    conditions.push(or(...wheelConditions)!);
  }

  const ageRangesList = toArray(ageRange);
  if (ageRangesList.length > 0) {
    const ageConditions = ageRangesList.map(ar => {
      const [filterMinStr, filterMaxStr] = ar.split("-");
      const filterMin = parseInt(filterMinStr ?? "");
      if (isNaN(filterMin)) return undefined;
      const filterMax = parseInt(filterMaxStr ?? "");
      const fMax = isNaN(filterMax) ? 20 : filterMax;
      return sql`
        CASE 
          WHEN ${products.age_range} ~ '^[0-9]+-[0-9]+$' THEN
            CAST(SPLIT_PART(${products.age_range}, '-', 1) AS INTEGER) <= ${fMax} AND CAST(SPLIT_PART(${products.age_range}, '-', 2) AS INTEGER) >= ${filterMin}
          ELSE FALSE
        END
      `;
    }).filter(Boolean) as SQL[];
    if (ageConditions.length > 0) {
      conditions.push(or(...ageConditions)!);
    }
  }

  const availabilities = toArray(availability);
  if (availabilities.length > 0) {
    if (availabilities.includes("in_stock") && !availabilities.includes("out_of_stock")) {
      conditions.push(
        inArray(
          products.id,
          db.select({ id: productVariants.product_id })
            .from(productVariants)
            .where(eq(productVariants.in_stock, true))
        )
      );
    } else if (availabilities.includes("out_of_stock") && !availabilities.includes("in_stock")) {
      conditions.push(
        notInArray(
          products.id,
          db.select({ id: productVariants.product_id })
            .from(productVariants)
            .where(eq(productVariants.in_stock, true))
        )
      );
    }
  }

  const gearsList = toArray(gears);
  if (gearsList.length > 0) {
    const gearsConditions = gearsList.map(g => {
      const gearsNum = parseInt(g);
      if (isNaN(gearsNum)) return undefined;
      if (gearsNum >= 21) {
        return gte(products.gears, 21);
      } else {
        return eq(products.gears, gearsNum);
      }
    }).filter(Boolean) as SQL[];
    if (gearsConditions.length > 0) {
      conditions.push(or(...gearsConditions)!);
    }
  }

  if (heightInches) {
    conditions.push(lte(products.height_min_inches, heightInches));
    conditions.push(gte(products.height_max_inches, heightInches));
  }

  const heightsList = toArray(heightRange);
  if (heightsList.length > 0) {
    const heightConditions = heightsList.map(hr => {
      const [minStr, maxStr] = hr.split("-");
      const minRange = parseInt(minStr ?? "");
      const maxRange = parseInt(maxStr ?? "");
      if (!isNaN(minRange) && !isNaN(maxRange)) {
        return and(
          lte(products.height_min_inches, maxRange),
          gte(products.height_max_inches, minRange)
        );
      }
      return undefined;
    }).filter(Boolean) as SQL[];
    if (heightConditions.length > 0) {
      conditions.push(or(...heightConditions)!);
    }
  }

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
