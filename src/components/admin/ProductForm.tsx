"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createProduct } from "~/server/actions/product-mutations";
import { updateProduct } from "~/server/actions/update-product";
import { useRouter } from "next/navigation";
import { BICYCLE_COLORS } from "~/lib/constants/colors";
import keyFeaturesData from "~/lib/keyFeatures.json";
import { uploadImageAction } from "~/server/actions/upload-image";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Slider } from "~/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { cn } from "~/lib/utils";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().min(1, "Brand is required"),
  base_price: z.string().min(1, "Base price is required"),
  mrp: z.string().min(1, "MRP is required"),
  discount_percent: z.string().nullish(),
  category: z.string().min(1, "Category is required"),
  wheel_size_t: z.string().nullish(),
  height_min_inches: z.coerce.number().nullish(),
  height_max_inches: z.coerce.number().nullish(),
  gears: z.coerce.number().nullish(),
  target_demographic: z.string().min(1, "Demographic is required"),
  gender: z.string().nullish(),
  frame_material: z.string().nullish(),
  brakes: z.string().nullish(),
  suspension: z.string().nullish(),
  age_range: z.string().nullish(),
  rim_material: z.string().nullish(),
  fork: z.string().max(16, "Max 16 characters").nullish(),
  key_features: z.record(z.string()).nullish(),
  variants: z.array(
    z.object({
      id: z.number().optional(),
      color_name: z.string().min(1),
      color_label: z.string().optional().nullable(),
      color_hex: z.string().min(1),
      in_stock: z.boolean().default(true),
      images: z.array(z.string()),
      _files: z.unknown().optional(), // For internal handling of file inputs
    })
  ).min(1, "At least one variant is required"),
});

type FormValues = z.input<typeof productSchema>;

type ProductFormProps = {
  initialData?: (Partial<FormValues> & { id?: number }) | null;
};

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [popoverOpen, setPopoverOpen] = useState<Record<number, boolean>>({});

  const form = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData 
      ? {
          ...initialData,
          brakes: initialData.brakes ?? "Normal Brakes",
        }
      : {
          name: "",
          brand: "",
          base_price: "",
          mrp: "",
          discount_percent: "",
          category: "",
          target_demographic: "Adults",
          gender: "Unisex",
          wheel_size_t: "",
          height_min_inches: 40,
          height_max_inches: 75,
          brakes: "Normal Brakes",
          suspension: "Rigid",
          age_range: "18-20",
          rim_material: "Steel",
          fork: "",
          key_features: {},
          variants: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
    name: "variants",
    control: form.control,
  });

  const category = form.watch("category");
  const targetDemographic = form.watch("target_demographic");
  const gears = form.watch("gears");
  const showFrameMaterial = category === "Mountain (MTB)" || category === "Hybrid";

  const getActiveKeyFeatureCategory = () => {
    if (category === "Kids" || targetDemographic === "Kids") return "Kids Single Speed";
    if (category === "Hybrid") return "Hybrid";
    if (category === "Mountain (MTB)") {
      return (gears && gears > 1) ? "MTB Geared" : "MTB Single Speed";
    }
    return null; // fallback
  };
  const activeKeyFeatureCategory = getActiveKeyFeatureCategory();
  const currentKeyFeatures = activeKeyFeatureCategory ? (keyFeaturesData as Record<string, string[]>)[activeKeyFeatureCategory]! : [];

  const getAvailableWheelSizes = () => {
    if (targetDemographic === "Kids" || category === "Kids") return ["12", "14", "16", "20"];
    if (targetDemographic === "Junior MTB" || targetDemographic === "Adults") return ["24", "26", "27.5", "29"];
    return ["12", "14", "16", "20", "24", "26", "27.5", "29"];
  };
  const wheelSizes = getAvailableWheelSizes();

  useEffect(() => {
    if (category === "Kids" || targetDemographic === "Kids") {
      form.setValue("gears", 1);
    }
  }, [category, targetDemographic, form]);

  const inchesToFeetDisplay = (inches: number) => {
    const ft = Math.floor(inches / 12);
    const rem = inches % 12;
    return `${ft}'${rem}"`;
  };

  const getAgeRangeValues = (ageRangeStr?: string | null): [number, number] => {
    if (!ageRangeStr) return [18, 20];
    if (ageRangeStr.includes("years") || ageRangeStr.includes("+")) {
      if (ageRangeStr === "18+ years") return [18, 20];
      if (ageRangeStr === "13-17 years") return [13, 17];
      if (ageRangeStr === "8-12 years") return [8, 12];
      if (ageRangeStr === "5-8 years") return [5, 8];
      if (ageRangeStr === "2-5 years") return [2, 5];
    }
    const parts = ageRangeStr.split("-");
    const min = parseInt(parts[0] ?? "2") ?? 2;
    const max = parseInt(parts[1] ?? "20") ?? 20;
    return [min, max > 20 ? 20 : max];
  };

  const currentAgeValues = getAgeRangeValues(form.watch("age_range"));

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return await uploadImageAction(formData);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError("");

    try {
      // Handle image uploads first
      const variantsWithUploadedImages = await Promise.all(
        data.variants.map(async (variant) => {
          const uploadedUrls = [];
          if (variant._files) {
            for (const file of variant._files as File[]) {
              const url = await handleImageUpload(file);
              uploadedUrls.push(url);
            }
          }
          return {
            ...variant,
            images: [...variant.images, ...uploadedUrls],
          };
        })
      );

      const payload = {
        ...data,
        variants: variantsWithUploadedImages.map(({ _files, ...rest }) => ({
          ...rest,
          in_stock: rest.in_stock ?? true,
        })), // Strip _files and fallback in_stock
      };
      delete (payload as Record<string, unknown>).discount_percent;

      if (initialData?.id) {
        await updateProduct(initialData.id, payload);
      } else {
        await createProduct(payload);
      }
      
      router.push("/admin/products");
    } catch (err: unknown) {
      setError((err as Error).message ?? "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {error && <div className="bg-destructive/10 text-destructive p-4 rounded-md">{error}</div>}
      
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...form.register("name")} placeholder="e.g. Marlin 5" />
            {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Brand</Label>
            <Input {...form.register("brand")} placeholder="e.g. Trek" />
            {form.formState.errors.brand && <p className="text-sm text-destructive">{form.formState.errors.brand.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>MRP (₹)</Label>
            <Input type="number" step="0.01" {...form.register("mrp", {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const mrp = parseFloat(e.target.value);
                const dp = parseFloat(form.getValues("discount_percent") ?? "0");
                if (mrp > 0 && dp >= 0) {
                  form.setValue("base_price", (mrp - (mrp * dp / 100)).toFixed(2));
                }
              }
            })} />
            {form.formState.errors.mrp && <p className="text-sm text-destructive">{form.formState.errors.mrp.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Discount (%)</Label>
            <Input type="number" step="0.01" {...form.register("discount_percent", {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const dp = parseFloat(e.target.value);
                const mrp = parseFloat(form.getValues("mrp") ?? "0");
                if (mrp > 0 && dp >= 0) {
                  form.setValue("base_price", (mrp - (mrp * dp / 100)).toFixed(2));
                }
              }
            })} placeholder="e.g. 15" />
          </div>
          <div className="space-y-2">
            <Label>Selling Price (₹)</Label>
            <Input type="number" step="0.01" {...form.register("base_price", {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const bp = parseFloat(e.target.value);
                const mrp = parseFloat(form.getValues("mrp") ?? "0");
                if (mrp > 0 && bp >= 0) {
                  form.setValue("discount_percent", (((mrp - bp) / mrp) * 100).toFixed(2));
                }
              }
            })} />
            {form.formState.errors.base_price && <p className="text-sm text-destructive">{form.formState.errors.base_price.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select onValueChange={(val) => form.setValue("category", val!)} value={form.watch("category") ?? ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mountain (MTB)">Mountain (MTB)</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
                <SelectItem value="Kids">Kids</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.category && <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Target Demographic</Label>
            <Select onValueChange={(val) => form.setValue("target_demographic", val!)} value={form.watch("target_demographic") ?? ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select Demographic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Adults">Adults</SelectItem>
                <SelectItem value="Junior MTB">Junior MTB</SelectItem>
                <SelectItem value="Kids">Kids</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Brakes</Label>
            <Select onValueChange={(val) => form.setValue("brakes", val)} value={form.watch("brakes") ?? ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select Brakes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Normal Brakes">Normal Brakes</SelectItem>
                <SelectItem value="Dual Disc">Dual Disc</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Suspension</Label>
            <Select onValueChange={(val) => form.setValue("suspension", val)} value={form.watch("suspension") ?? ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select Suspension" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Rigid">Rigid</SelectItem>
                <SelectItem value="Front">Front</SelectItem>
                <SelectItem value="Both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4 md:col-span-2">
            <div className="flex justify-between items-center">
              <Label>Age Range</Label>
              <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                {currentAgeValues[0] >= 18 && currentAgeValues[1] === 20 ? "18+ years" : `${currentAgeValues[0]} - ${currentAgeValues[1]} years`}
              </span>
            </div>
            <div className="px-2 pt-4">
              <Slider
                min={2}
                max={20}
                step={1}
                value={currentAgeValues}
                onValueChange={(val) => {
                  const v = val as number[];
                  form.setValue("age_range", `${v[0]}-${v[1]}`);
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
              <span>2 yrs</span>
              <span>18+ yrs</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Wheel Size</Label>
            <Popover>
              <PopoverTrigger render={
                <Button variant="outline" role="combobox" className="w-full justify-between font-normal text-muted-foreground bg-background">
                  <span className="truncate">
                    {form.watch("wheel_size_t") ? form.watch("wheel_size_t") : "Select Wheel Sizes"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              } />
              <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search size..." />
                  <CommandList>
                    <CommandEmpty>No size found.</CommandEmpty>
                    <CommandGroup>
                      {wheelSizes.map((size) => {
                        const currentValue = form.watch("wheel_size_t") ?? "";
                        const currentSizes = currentValue.split(",").map(s => s.trim()).filter(Boolean);
                        const isSelected = currentSizes.includes(size);

                        return (
                          <CommandItem
                            key={size}
                            value={size}
                            onSelect={() => {
                              if (isSelected) {
                                form.setValue("wheel_size_t", currentSizes.filter(s => s !== size).join(", "));
                              } else {
                                form.setValue("wheel_size_t", [...currentSizes, size].join(", "));
                              }
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {size}&quot;
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Gears</Label>
            <Select 
              onValueChange={(val) => form.setValue("gears", parseInt(val!))} 
              value={form.watch("gears")?.toString() ?? ""}
              disabled={category === "Kids" || targetDemographic === "Kids"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Gears" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Speed</SelectItem>
                <SelectItem value="7">7 Speed</SelectItem>
                <SelectItem value="14">14 Speed</SelectItem>
                <SelectItem value="18">18 Speed</SelectItem>
                <SelectItem value="21">21 Speed</SelectItem>
                <SelectItem value="24">24 Speed</SelectItem>
                <SelectItem value="27">27 Speed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4 md:col-span-2">
            <div className="flex justify-between items-center">
              <Label>Height Range</Label>
              <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                {inchesToFeetDisplay(form.watch("height_min_inches") ?? 0)} - {inchesToFeetDisplay(form.watch("height_max_inches") ?? 0)}
              </span>
            </div>
            <div className="px-2 pt-4">
              <Slider
                min={30}
                max={90}
                step={1}
                value={[form.watch("height_min_inches") ?? 40, form.watch("height_max_inches") ?? 75]}
                onValueChange={(val) => {
                  const v = val as number[];
                  form.setValue("height_min_inches", v[0]);
                  form.setValue("height_max_inches", v[1]);
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
              <span>30&quot;</span>
              <span>90&quot;</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select onValueChange={(val) => form.setValue("gender", val)} value={form.watch("gender") ?? ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Unisex">Unisex</SelectItem>
                <SelectItem value="Kids">Kids</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {showFrameMaterial && (
            <div className="space-y-2">
              <Label>Frame Material</Label>
              <Input {...form.register("frame_material")} placeholder="e.g. Aluminum" />
            </div>
          )}
          <div className="space-y-2">
            <Label>Rim Material</Label>
            <Select onValueChange={(val) => form.setValue("rim_material", val)} value={form.watch("rim_material") ?? ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select Rim Material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Steel">Steel</SelectItem>
                <SelectItem value="Alloy">Alloy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Fork</Label>
            <Input {...form.register("fork")} maxLength={16} placeholder="e.g. Suspension Fork" />
            {form.formState.errors.fork && <p className="text-sm text-destructive">{form.formState.errors.fork.message}</p>}
          </div>
        </CardContent>
      </Card>

      {activeKeyFeatureCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Key Features ({activeKeyFeatureCategory})</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentKeyFeatures.map((featureKey) => (
              <div key={featureKey} className="space-y-2">
                <Label>{featureKey}</Label>
                <Input 
                  {...form.register(`key_features.${featureKey}`)} 
                  maxLength={16} 
                  placeholder={`Max 16 chars`} 
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Variants (Colors & Images)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg relative space-y-4 bg-muted/20">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-destructive"
                onClick={() => remove(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 flex flex-col">
                  <Label>Color</Label>
                  <Popover
                    open={popoverOpen[index] ?? false}
                    onOpenChange={(isOpen) => setPopoverOpen(prev => ({ ...prev, [index]: isOpen }))}
                  >
                    <PopoverTrigger render={
                      <Button
                        variant="outline"
                        role="combobox"
                        className="justify-between w-full"
                      >
                        {form.watch(`variants.${index}.color_name`) ? (
                          <span className="flex items-center gap-2">
                            <span 
                              className="inline-block w-4 h-4 rounded-full border" 
                              style={{ backgroundColor: form.watch(`variants.${index}.color_hex`) }}
                            />
                            {form.watch(`variants.${index}.color_name`)}
                          </span>
                        ) : (
                          "Select color..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    } />
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search color..." />
                        <CommandList>
                          <CommandEmpty>No color found.</CommandEmpty>
                          <CommandGroup>
                            {BICYCLE_COLORS.map((color) => (
                              <CommandItem
                                key={color.name}
                                value={color.name}
                                onSelect={() => {
                                  form.setValue(`variants.${index}.color_name`, color.name);
                                  form.setValue(`variants.${index}.color_hex`, color.hex);
                                  setPopoverOpen(prev => ({ ...prev, [index]: false }));
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    form.watch(`variants.${index}.color_name`) === color.name
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div 
                                  className="w-4 h-4 rounded-full border mr-2" 
                                  style={{ backgroundColor: color.hex }}
                                />
                                {color.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.variants?.[index]?.color_name && (
                    <p className="text-sm text-destructive">Color is required</p>
                  )}
                  <Input 
                    placeholder="Display Label (e.g. Matte Black)"
                    {...form.register(`variants.${index}.color_label`)}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-2 flex items-center pt-8">
                  <Checkbox
                    checked={form.watch(`variants.${index}.in_stock`) ?? true}
                    onCheckedChange={(checked) => form.setValue(`variants.${index}.in_stock`, !!checked)}
                    id={`stock-${index}`}
                  />
                  <Label htmlFor={`stock-${index}`} className="ml-2">In Stock</Label>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Images</Label>
                  <div 
                    className="flex flex-col gap-2 p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all outline-none"
                    onPaste={(e) => {
                      const items = e.clipboardData?.items;
                      if (!items) return;
                      const pastedFiles: File[] = [];
                      for (const item of Array.from(items)) {
                        if (item?.type.startsWith('image/')) {
                          const file = item.getAsFile();
                          if (file) pastedFiles.push(file);
                        }
                      }
                      if (pastedFiles.length > 0) {
                        e.preventDefault();
                        const existing = form.getValues(`variants.${index}._files`) ?? [];
                        form.setValue(`variants.${index}._files`, [...(existing as File[]), ...pastedFiles], { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                      }
                    }}
                    tabIndex={0}
                  >
                    <div className="flex flex-col items-center justify-center gap-3 py-4 pointer-events-none">
                      <p className="text-sm text-muted-foreground text-center">
                        <span className="font-semibold text-primary">Click this dashed area</span> to focus, then press <kbd className="px-1.5 py-0.5 bg-background rounded text-xs font-mono border text-foreground shadow-sm">Ctrl+V</kbd> to paste images.
                      </p>
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">or</span>
                      <div className="relative pointer-events-auto">
                        <Input
                          type="file"
                          multiple
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          title="Browse files"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              const existing = form.getValues(`variants.${index}._files`) ?? [];
                              form.setValue(`variants.${index}._files`, [...(existing as File[]), ...Array.from(files)], { shouldValidate: true, shouldDirty: true });
                              // Reset the input so the same files can be selected again if needed
                              e.target.value = "";
                            }
                          }}
                        />
                        <Button type="button" variant="outline" size="sm" className="pointer-events-none relative z-0">
                          Browse Files
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Display existing images and newly pasted files */}
                  {(form.watch(`variants.${index}.images`)?.length > 0 || ((form.watch(`variants.${index}._files`) as File[])?.length ?? 0) > 0) && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {form.watch(`variants.${index}.images`)?.map((url, imgIndex) => (
                        <div key={`img-${imgIndex}`} className="relative w-20 h-20 rounded border overflow-hidden group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="Variant" className="w-full h-full object-cover" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={async () => {
                              const pass = window.prompt("Enter master password to delete this image:");
                              if (pass) {
                                const { verifyMasterPass } = await import("~/server/actions/product-mutations");
                                const isValid = await verifyMasterPass(pass);
                                if (isValid) {
                                  const currentImages = form.getValues(`variants.${index}.images`);
                                  form.setValue(`variants.${index}.images`, currentImages.filter((_, i) => i !== imgIndex));
                                } else {
                                  alert("Invalid master password!");
                                }
                              }
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                      {(form.watch(`variants.${index}._files`) as File[])?.map((file, fileIdx) => {
                        const url = URL.createObjectURL(file);
                        return (
                          <div key={`file-${fileIdx}`} className="relative w-20 h-20 rounded border overflow-hidden group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="New Variant" className="w-full h-full object-cover opacity-70" />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] font-bold text-white bg-black/50 px-1 py-0.5 rounded">New</span>
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                const currentFiles = form.getValues(`variants.${index}._files`) as File[] ?? [];
                                form.setValue(`variants.${index}._files`, currentFiles.filter((_, i) => i !== fileIdx));
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
            onClick={() => append({ color_name: "", color_label: "", color_hex: "", in_stock: true, images: [] })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Variant
          </Button>
          {form.formState.errors.variants && (
            <p className="text-sm text-destructive">{form.formState.errors.variants.message}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="btn-cred">
          {isSubmitting ? "Saving..." : "Save Product"}
        </Button>
      </div>
    </form>
  );
}
