export const BRANDS = [
  "BSA",
  "Hercules",
  "Hero Cycles",
  "Bitson",
  "Tata Stryder"
] as const;

export type BrandName = typeof BRANDS[number];
