export const BRANDS = [
  "BSA",
  "Hercules",
  "Mach City",
  "Hero",
] as const;

export type BrandName = typeof BRANDS[number];
