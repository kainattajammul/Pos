"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useUploadImage } from "@/hooks/use-upload-image";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ChevronDown,
  ChevronRight,
  ImagePlus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEMO_INVENTORY_PRODUCTS, FILTER_SELECT_OPTIONS } from "@/lib/inventory-products-demo-data";
import { cn } from "@/lib/utils";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";

const newProductSchema = z.object({
  name: z.string().trim().min(1, "Product Name is required"),
  category: z.string().trim().min(1, "Category is required"),
  brand: z.string().trim().optional(),
  model: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  upc: z.string().trim().optional(),
  wooCategory: z.string().trim().optional(),
  description: z.string().trim().optional(),
  condition: z.string().trim().optional(),
  physicalLocation: z.string().trim().optional(),
  warranty: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || Number.isFinite(Number(v)), "Warranty must be a valid number"),
  warrantyUnit: z.string().trim().optional(),
  imei: z.string().trim().optional(),
  stockQty: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 0), "Inventory quantity must be a valid number"),
  lowStockAlertQty: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 0), "Low stock alert must be a valid number"),
  supplier: z.string().trim().optional(),
  price: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (Number.isFinite(Number(v)) && Number(v) >= 0), "Price must be >= 0"),
  unitCost: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (Number.isFinite(Number(v)) && Number(v) >= 0), "Unit Cost must be >= 0"),
  tax: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (Number.isFinite(Number(v)) && Number(v) >= 0), "Tax must be >= 0"),
  pricingOption: z.string().trim().optional(),
  manageInventory: z.boolean(),
  serializedInventory: z.boolean(),
  stockWarning: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 0), "Stock warning must be a valid number"),
  minimumReorderLevel: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 0), "Minimum reorder level must be a valid number"),
  valuationMethod: z.string().trim().optional(),
  retailMarkup: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || Number.isFinite(Number(v)), "Retail markup must be a valid number"),
  retailPrice: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (Number.isFinite(Number(v)) && Number(v) >= 0), "Retail price must be >= 0"),
  promotionalPrice: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (Number.isFinite(Number(v)) && Number(v) >= 0), "Promotional price must be >= 0"),
  promotionStartDate: z.string().trim().optional(),
  promotionEndDate: z.string().trim().optional(),
  minimumPrice: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (Number.isFinite(Number(v)) && Number(v) >= 0), "Minimum price must be >= 0"),
  onlinePrice: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (Number.isFinite(Number(v)) && Number(v) >= 0), "Online price must be >= 0"),
  taxClass: z.string().trim().optional(),
  commissionEnabled: z.boolean(),
  groupPricingEnabled: z.boolean(),
  loyaltyEnabled: z.boolean(),
  loyaltyMode: z.enum(["default", "custom"]),
  includeSuggestiveSale: z.boolean(),
  displayOnPOS: z.boolean(),
  syncWooCommerce: z.boolean(),
});

type NewProductFormValues = z.infer<typeof newProductSchema>;
type ProductTab = "name" | "sku";

const defaultValues: NewProductFormValues = {
  name: "",
  category: "",
  brand: "",
  model: "",
  sku: "",
  upc: "",
  wooCategory: "",
  description: "",
  condition: "",
  physicalLocation: "",
  warranty: "",
  warrantyUnit: "Months",
  imei: "",
  stockQty: "0",
  lowStockAlertQty: "5",
  supplier: "",
  price: "",
  unitCost: "",
  tax: "",
  pricingOption: "",
  manageInventory: true,
  serializedInventory: false,
  stockWarning: "",
  minimumReorderLevel: "",
  valuationMethod: "WAC (Weighted Average Cost)",
  retailMarkup: "0",
  retailPrice: "0",
  promotionalPrice: "0",
  promotionStartDate: "",
  promotionEndDate: "",
  minimumPrice: "0",
  onlinePrice: "0",
  taxClass: "SalesTax",
  commissionEnabled: false,
  groupPricingEnabled: false,
  loyaltyEnabled: true,
  loyaltyMode: "default",
  includeSuggestiveSale: false,
  displayOnPOS: true,
  syncWooCommerce: false,
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function SectionHeader({
  title,
  open,
  onToggle,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-md px-1 py-1 text-left"
    >
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      {open ? <ChevronDown className="size-4 text-neutral-500" /> : <ChevronRight className="size-4 text-neutral-500" />}
    </button>
  );
}

export function NewProductPageView() {
  const [activeTab, setActiveTab] = useState<ProductTab>("name");
  const [openProductInfo, setOpenProductInfo] = useState(true);
  const [openDescription, setOpenDescription] = useState(false);
  const [openAdditionalDetails, setOpenAdditionalDetails] = useState(true);
  const [selectedImageName, setSelectedImageName] = useState<string>("");
  const [productImageUrl, setProductImageUrl] = useState<string>("");
  const [productImagePath, setProductImagePath] = useState<string>("");
  const imageRef = useRef<HTMLInputElement>(null);
  const uploadImage = useUploadImage("inventory/products");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<NewProductFormValues>({
    resolver: zodResolver(newProductSchema),
    defaultValues,
  });

  const includeSuggestiveSale = watch("includeSuggestiveSale");
  const displayOnPOS = watch("displayOnPOS");
  const syncWooCommerce = watch("syncWooCommerce");
  const manageInventory = watch("manageInventory");
  const serializedInventory = watch("serializedInventory");
  const commissionEnabled = watch("commissionEnabled");
  const groupPricingEnabled = watch("groupPricingEnabled");
  const loyaltyEnabled = watch("loyaltyEnabled");
  const loyaltyMode = watch("loyaltyMode");

  const existingSkuSet = useMemo(
    () =>
      new Set(
        DEMO_INVENTORY_PRODUCTS.map((p) => p.sku.trim().toLowerCase()).filter(Boolean),
      ),
    [],
  );
  const existingUpcSet = useMemo(
    () =>
      new Set(
        DEMO_INVENTORY_PRODUCTS.map((p) => p.barcode.trim().toLowerCase()).filter(Boolean),
      ),
    [],
  );

  const submit = (values: NewProductFormValues, mode: "save" | "save-add-new") => {
    const sku = values.sku?.trim().toLowerCase();
    const upc = values.upc?.trim().toLowerCase();
    if (sku && existingSkuSet.has(sku)) {
      toast.error("SKU must be unique.");
      return;
    }
    if (upc && existingUpcSet.has(upc)) {
      toast.error("UPC must be unique.");
      return;
    }
    if (productImageUrl) {
      // Image metadata (productImagePath) ready when product create API is wired.
      void productImagePath;
    }
    toast.success(mode === "save-add-new" ? "Product saved. Ready for next one." : "Product saved.");
  };

  const onPickImage = () => imageRef.current?.click();
  const onImageChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPEG, PNG, or WebP images are allowed.");
      e.currentTarget.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be 5MB or less.");
      e.currentTarget.value = "";
      return;
    }
    try {
      const uploaded = await uploadImage.mutateAsync({ file });
      setSelectedImageName(file.name);
      setProductImageUrl(uploaded.url);
      setProductImagePath(uploaded.path);
      toast.success("Image uploaded");
    } catch {
      /* toast from hook */
    }
    e.currentTarget.value = "";
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#F8FAFC]">
      <RepairsTopNav />
      <main className="flex-1 overflow-auto px-4 py-4 md:px-5">
        <div className="mx-auto max-w-[1600px] space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/inventory/products" className="transition-colors hover:text-foreground">
            Manage Products
          </Link>
          <ChevronRight className="size-3.5 shrink-0" />
          <span className="font-medium text-foreground">New Product</span>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 border-neutral-200 bg-white"
            onClick={handleSubmit((v) => submit(v, "save-add-new"))}
            disabled={isSubmitting}
          >
            Save & Add New
          </Button>
          <Button
            type="button"
            className="h-9 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSubmit((v) => submit(v, "save"))}
            disabled={isSubmitting}
          >
            Save
          </Button>
        </div>
          </div>

          <section className="grid gap-4 lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-primary">Details</h2>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li className="font-medium">Product Information</li>
              <li className="pl-3 text-neutral-500">About</li>
              <li className="pl-3 text-neutral-500">Description</li>
              <li className="pl-3 text-neutral-500">Additional Details</li>
              <li className="font-medium">Stock</li>
              <li className="font-medium">Pricing & Tax</li>
              <li className="pl-3 text-neutral-500">Pricing</li>
              <li className="pl-3 text-neutral-500">Tax</li>
              <li className="pl-3 text-neutral-500">Pricing Options</li>
              <li className="font-medium">Quick Settings</li>
            </ul>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-neutral-800">Quick Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <Checkbox
                  checked={includeSuggestiveSale}
                  onCheckedChange={(checked) => setValue("includeSuggestiveSale", checked === true)}
                />
                Include In Suggestive Sale Alert
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <Checkbox
                  checked={displayOnPOS}
                  onCheckedChange={(checked) => setValue("displayOnPOS", checked === true)}
                />
                Display On Point of Sale
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <Checkbox
                  checked={syncWooCommerce}
                  onCheckedChange={(checked) => setValue("syncWooCommerce", checked === true)}
                />
                Sync With WooCommerce
              </label>
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("name")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium",
                  activeTab === "name" ? "bg-primary text-primary-foreground" : "bg-neutral-100 text-neutral-700",
                )}
              >
                Name
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("sku")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium",
                  activeTab === "sku" ? "bg-primary text-primary-foreground" : "bg-neutral-100 text-neutral-700",
                )}
              >
                SKU
              </button>
              <div className="ml-auto flex min-w-0 items-center gap-2">
                <Select defaultValue="vendor-1">
                  <SelectTrigger className="h-9 w-[180px] border-neutral-200 bg-white text-sm">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendor-1">Vendor 1</SelectItem>
                    <SelectItem value="vendor-2">Vendor 2</SelectItem>
                    <SelectItem value="vendor-3">Vendor 3</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                  <Input className="h-9 w-[220px] border-neutral-200 bg-white pl-9" placeholder="Search by name" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
              <span className="font-medium">Supported Vendors:</span>
              {["V1", "V2", "V3", "V4"].map((v) => (
                <span
                  key={v}
                  className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-neutral-200 bg-neutral-50 px-2 font-medium text-neutral-600"
                >
                  {v}
                </span>
              ))}
            </div>
          </section>

          <form className="space-y-4" onSubmit={handleSubmit((v) => submit(v, "save"))} noValidate>
            <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
              <SectionHeader
                title="Product Information"
                open={openProductInfo}
                onToggle={() => setOpenProductInfo((v) => !v)}
              />
              {openProductInfo ? (
                <div className="mt-4 space-y-5">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-neutral-800">About</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5 md:col-span-2">
                        <Label>
                          Name <span className="text-destructive">*</span>
                        </Label>
                        <Input className="h-10 border-neutral-200" {...register("name")} />
                        <FieldError message={errors.name?.message} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>
                          Category <span className="text-destructive">*</span>
                        </Label>
                        <Select onValueChange={(v: string | null) => setValue("category", v ?? "")}>
                          <SelectTrigger className="h-10 border-neutral-200">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {FILTER_SELECT_OPTIONS.categories.filter(Boolean).map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError message={errors.category?.message} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Brand</Label>
                        <Select onValueChange={(v: string | null) => setValue("brand", v ?? "")}>
                          <SelectTrigger className="h-10 border-neutral-200">
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                          <SelectContent>
                            {FILTER_SELECT_OPTIONS.brands.filter(Boolean).map((b) => (
                              <SelectItem key={b} value={b}>
                                {b}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Model</Label>
                        <Select onValueChange={(v: string | null) => setValue("model", v ?? "")}>
                          <SelectTrigger className="h-10 border-neutral-200">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            {FILTER_SELECT_OPTIONS.models.filter(Boolean).map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>SKU</Label>
                        <Input className="h-10 border-neutral-200" {...register("sku")} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>UPC</Label>
                        <Input className="h-10 border-neutral-200" {...register("upc")} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>WooCommerce Category</Label>
                        <Select onValueChange={(v: string | null) => setValue("wooCategory", v ?? "")}>
                          <SelectTrigger className="h-10 border-neutral-200">
                            <SelectValue placeholder="Select WooCommerce category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mobile-parts">Mobile Parts</SelectItem>
                            <SelectItem value="accessories">Accessories</SelectItem>
                            <SelectItem value="tablet-parts">Tablet Parts</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Images</Label>
                        <input
                          ref={imageRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={onImageChange}
                        />
                        <button
                          type="button"
                          onClick={onPickImage}
                          disabled={uploadImage.isPending}
                          className="flex h-20 w-full flex-col items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 disabled:opacity-60"
                        >
                          <ImagePlus className="mb-1 size-4" />
                          <span className="text-xs font-medium">
                            {uploadImage.isPending
                              ? "Uploading…"
                              : selectedImageName || "Add Image"}
                          </span>
                          <span className="text-[11px] text-neutral-400">JPEG, PNG, WebP · 5MB</span>
                        </button>
                        {productImageUrl ? (
                          <div className="relative mt-2 size-20 overflow-hidden rounded border border-neutral-200">
                            <Image
                              src={productImageUrl}
                              alt="Product preview"
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-neutral-100 pt-3">
                    <SectionHeader
                      title="Description"
                      open={openDescription}
                      onToggle={() => setOpenDescription((v) => !v)}
                    />
                    {openDescription ? (
                      <textarea
                        rows={4}
                        placeholder="Write here..."
                        className="w-full resize-none rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        {...register("description")}
                      />
                    ) : null}
                  </div>

                  <div className="space-y-2 border-t border-neutral-100 pt-3">
                    <SectionHeader
                      title="Additional Details"
                      open={openAdditionalDetails}
                      onToggle={() => setOpenAdditionalDetails((v) => !v)}
                    />
                    {openAdditionalDetails ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label>Condition</Label>
                          <Select onValueChange={(v: string | null) => setValue("condition", v ?? "")}>
                            <SelectTrigger className="h-10 border-neutral-200">
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="used">Used</SelectItem>
                              <SelectItem value="refurbished">Refurbished</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Physical Location</Label>
                          <Select onValueChange={(v: string | null) => setValue("physicalLocation", v ?? "")}>
                            <SelectTrigger className="h-10 border-neutral-200">
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="main-store">Main Store</SelectItem>
                              <SelectItem value="warehouse-a">Warehouse A</SelectItem>
                              <SelectItem value="warehouse-b">Warehouse B</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Warranty</Label>
                          <Input className="h-10 border-neutral-200" {...register("warranty")} />
                          <FieldError message={errors.warranty?.message} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Warranty Unit</Label>
                          <Select defaultValue="Months" onValueChange={(v: string | null) => setValue("warrantyUnit", v ?? "")}>
                            <SelectTrigger className="h-10 border-neutral-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Days">Days</SelectItem>
                              <SelectItem value="Months">Months</SelectItem>
                              <SelectItem value="Years">Years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <Label>IMEI</Label>
                          <Input className="h-10 border-neutral-200" {...register("imei")} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </section>

            <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-primary">Stock</h3>
              <div className="space-y-4 rounded-md border border-neutral-100 bg-neutral-50/70 p-3">
                <div className="flex items-center justify-between rounded border border-neutral-100 bg-white px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Manage inventory level for this product</p>
                    <p className="text-xs text-neutral-500">
                      Select this option if you prefer not to monitor stock levels for this product.
                    </p>
                  </div>
                  <Switch
                    checked={manageInventory}
                    onCheckedChange={(checked) => setValue("manageInventory", checked)}
                    aria-label="Manage inventory"
                  />
                </div>

                <div className="flex items-center justify-between rounded border border-neutral-100 bg-white px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Serialized Inventory</p>
                    <p className="text-xs text-neutral-500">
                      Enable this if product requires IMEI/Serial tracking.
                    </p>
                  </div>
                  <Switch
                    checked={serializedInventory}
                    onCheckedChange={(checked) => setValue("serializedInventory", checked)}
                    aria-label="Serialized inventory"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label>On-Hand Stock Quantity</Label>
                    <Input className="h-10 border-neutral-200" {...register("stockQty")} />
                    <FieldError message={errors.stockQty?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Stock Warning</Label>
                    <Input className="h-10 border-neutral-200" {...register("stockWarning")} />
                    <FieldError message={errors.stockWarning?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Minimum Reorder Level</Label>
                    <Input className="h-10 border-neutral-200" {...register("minimumReorderLevel")} />
                    <FieldError message={errors.minimumReorderLevel?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Supplier</Label>
                    <Select onValueChange={(v: string | null) => setValue("supplier", v ?? "")}>
                      <SelectTrigger className="h-10 border-neutral-200">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {FILTER_SELECT_OPTIONS.suppliers.filter(Boolean).map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Valuation Method</Label>
                    <Select defaultValue="WAC (Weighted Average Cost)" onValueChange={(v: string | null) => setValue("valuationMethod", v ?? "")}>
                      <SelectTrigger className="h-10 border-neutral-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIFO">FIFO</SelectItem>
                        <SelectItem value="LIFO">LIFO</SelectItem>
                        <SelectItem value="WAC (Weighted Average Cost)">WAC (Weighted Average Cost)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-neutral-500">On hand stock must be 0 to update valuation method.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-primary">Pricing & Tax</h3>
              <div className="space-y-5">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-neutral-800">Pricing</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label>Cost Price</Label>
                      <Input className="h-10 border-neutral-200" {...register("unitCost")} />
                      <FieldError message={errors.unitCost?.message} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Retail Markup (%)</Label>
                      <Input className="h-10 border-neutral-200" {...register("retailMarkup")} />
                      <FieldError message={errors.retailMarkup?.message} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Retail Price</Label>
                      <Input className="h-10 border-neutral-200" {...register("retailPrice")} />
                      <FieldError message={errors.retailPrice?.message} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Promotional Price</Label>
                      <Input className="h-10 border-neutral-200" {...register("promotionalPrice")} />
                      <FieldError message={errors.promotionalPrice?.message} />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Promotion Duration</Label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input type="date" className="h-10 border-neutral-200" {...register("promotionStartDate")} />
                        <Input type="date" className="h-10 border-neutral-200" {...register("promotionEndDate")} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Minimum Price</Label>
                      <Input className="h-10 border-neutral-200" {...register("minimumPrice")} />
                      <FieldError message={errors.minimumPrice?.message} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Online Price</Label>
                      <Input className="h-10 border-neutral-200" {...register("onlinePrice")} />
                      <FieldError message={errors.onlinePrice?.message} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t border-neutral-100 pt-3">
                  <h4 className="text-sm font-semibold text-neutral-800">Tax</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Tax Class</Label>
                      <Select defaultValue="SalesTax" onValueChange={(v: string | null) => setValue("taxClass", v ?? "")}>
                        <SelectTrigger className="h-10 border-neutral-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SalesTax">SalesTax</SelectItem>
                          <SelectItem value="NoTax">NoTax</SelectItem>
                          <SelectItem value="ReducedTax">ReducedTax</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tax Value</Label>
                      <Input className="h-10 border-neutral-200" {...register("tax")} />
                      <FieldError message={errors.tax?.message} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t border-neutral-100 pt-3">
                  <h4 className="text-sm font-semibold text-neutral-800">Pricing Options</h4>
                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="space-y-2 rounded-md border border-neutral-100 bg-neutral-50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-700">Commission</span>
                        <Switch
                          checked={commissionEnabled}
                          onCheckedChange={(checked) => setValue("commissionEnabled", checked)}
                          aria-label="Commission option"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-700">Group Pricing</span>
                        <Switch
                          checked={groupPricingEnabled}
                          onCheckedChange={(checked) => setValue("groupPricingEnabled", checked)}
                          aria-label="Group pricing option"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 rounded-md border border-neutral-100 bg-neutral-50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-neutral-800">Loyalty</span>
                        <Switch
                          checked={loyaltyEnabled}
                          onCheckedChange={(checked) => setValue("loyaltyEnabled", checked)}
                          aria-label="Loyalty option"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-neutral-700">
                        <input
                          type="radio"
                          className="size-3.5 accent-primary"
                          checked={loyaltyMode === "default"}
                          onChange={() => setValue("loyaltyMode", "default")}
                        />
                        Default Loyalty
                      </label>
                      <label className="flex items-center gap-2 text-sm text-neutral-700">
                        <input
                          type="radio"
                          className="size-3.5 accent-primary"
                          checked={loyaltyMode === "custom"}
                          onChange={() => setValue("loyaltyMode", "custom")}
                        />
                        Custom Loyalty
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </form>
        </div>
          </section>
        </div>
      </main>
    </div>
  );
}

