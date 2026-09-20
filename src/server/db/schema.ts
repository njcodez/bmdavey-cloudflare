import {
  index,
  pgTableCreator,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `bmdavey_${name}`);

export const products = createTable(
  "product",
  (d) => ({
    id: d.serial("id").primaryKey(),
    name: d.varchar("name", { length: 256 }).notNull(),
    brand: d.varchar("brand", { length: 256 }).notNull(),
    base_price: d.numeric("base_price", { precision: 10, scale: 2 }).notNull(),
    mrp: d.numeric("mrp", { precision: 10, scale: 2 }).notNull(),
    discount_highlight: d.boolean("discount_highlight").default(false).notNull(),
    is_featured: d.boolean("is_featured").default(false).notNull(),
    category: d.varchar("category", { length: 128 }).notNull(),
    wheel_size_t: d.varchar("wheel_size_t", { length: 64 }),
    height_min_inches: d.integer("height_min_inches"),
    height_max_inches: d.integer("height_max_inches"),
    gears: d.integer("gears"),
    target_demographic: d.varchar("target_demographic", { length: 64 }).notNull(), // kids/adults
    gender: d.varchar("gender", { length: 64 }),
    frame_material: d.varchar("frame_material", { length: 128 }),
    brakes: d.varchar("brakes", { length: 64 }),
    suspension: d.varchar("suspension", { length: 64 }),
    age_range: d.varchar("age_range", { length: 32 }),
    rim_material: d.varchar("rim_material", { length: 64 }),
    fork: d.varchar("fork", { length: 64 }),
    key_features: d.jsonb("key_features"),
    createdAt: d
      .timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("product_name_idx").on(t.name)]
);

export const productVariants = createTable(
  "product_variant",
  (d) => ({
    id: d.serial("id").primaryKey(),
    product_id: d.integer("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
    color_name: d.varchar("color_name", { length: 128 }).notNull(),
    color_label: d.varchar("color_label", { length: 128 }),
    color_hex: d.varchar("color_hex", { length: 32 }).notNull(),
    in_stock: d.boolean("in_stock").default(true).notNull(),
  })
);

export const productImages = createTable(
  "product_image",
  (d) => ({
    id: d.serial("id").primaryKey(),
    variant_id: d.integer("variant_id").references(() => productVariants.id, { onDelete: 'cascade' }).notNull(),
    url: d.varchar("url", { length: 1024 }).notNull(),
    order: d.integer("order").default(0).notNull(),
  })
);

export const coupons = createTable(
  "coupon",
  (d) => ({
    id: d.serial("id").primaryKey(),
    code: d.varchar("code", { length: 8 }).unique().notNull(), // 8-char alphanumeric
    user_name: d.varchar("user_name", { length: 256 }).notNull(),
    contact_info: d.varchar("contact_info", { length: 256 }).notNull(), // email/phone
    product_id: d.integer("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
    variant_id: d.integer("variant_id").references(() => productVariants.id, { onDelete: 'cascade' }).notNull(),
    locked_price: d.numeric("locked_price", { precision: 10, scale: 2 }).notNull(),
    createdAt: d
      .timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    expires_at: d.timestamp("expires_at", { withTimezone: true }).notNull(), // timestamp 48hrs from creation
  }),
  (t) => [index("coupon_code_idx").on(t.code)]
);

import { relations } from "drizzle-orm";

export const productsRelations = relations(products, ({ many }) => ({
  productVariants: many(productVariants),
  coupons: many(coupons),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.product_id],
    references: [products.id],
  }),
  productImages: many(productImages),
  coupons: many(coupons),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  variant: one(productVariants, {
    fields: [productImages.variant_id],
    references: [productVariants.id],
  }),
}));

export const couponsRelations = relations(coupons, ({ one }) => ({
  product: one(products, {
    fields: [coupons.product_id],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [coupons.variant_id],
    references: [productVariants.id],
  }),
}));

export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;

export type ProductWithRelations = Product & {
  productVariants: (ProductVariant & {
    productImages: ProductImage[];
  })[];
};

