CREATE TABLE "bmdavey_coupon" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(8) NOT NULL,
	"user_name" varchar(256) NOT NULL,
	"contact_info" varchar(256) NOT NULL,
	"product_id" integer NOT NULL,
	"variant_id" integer NOT NULL,
	"locked_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "bmdavey_coupon_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "bmdavey_product_image" (
	"id" serial PRIMARY KEY NOT NULL,
	"variant_id" integer NOT NULL,
	"url" varchar(1024) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bmdavey_product_variant" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"color_name" varchar(128) NOT NULL,
	"color_hex" varchar(32) NOT NULL,
	"in_stock" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bmdavey_product" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"brand" varchar(256) NOT NULL,
	"base_price" numeric(10, 2) NOT NULL,
	"mrp" numeric(10, 2) NOT NULL,
	"discount_highlight" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"category" varchar(128) NOT NULL,
	"wheel_size_t" varchar(64),
	"height_min_inches" integer,
	"height_max_inches" integer,
	"gears" integer,
	"target_demographic" varchar(64) NOT NULL,
	"gender" varchar(64),
	"frame_material" varchar(128),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "bmdavey_coupon" ADD CONSTRAINT "bmdavey_coupon_product_id_bmdavey_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."bmdavey_product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bmdavey_coupon" ADD CONSTRAINT "bmdavey_coupon_variant_id_bmdavey_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."bmdavey_product_variant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bmdavey_product_image" ADD CONSTRAINT "bmdavey_product_image_variant_id_bmdavey_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."bmdavey_product_variant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bmdavey_product_variant" ADD CONSTRAINT "bmdavey_product_variant_product_id_bmdavey_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."bmdavey_product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "coupon_code_idx" ON "bmdavey_coupon" USING btree ("code");--> statement-breakpoint
CREATE INDEX "product_name_idx" ON "bmdavey_product" USING btree ("name");