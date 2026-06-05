"use client";

import dynamic from "next/dynamic";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnOrderState,
  type VisibilityState,
  type RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { createProductColumns } from "@/components/inventory/products/columns";
import {
  DEFAULT_PRODUCT_ADVANCED_FILTERS,
  ProductAdvancedFilters,
  type ProductAdvancedFiltersState,
} from "@/components/inventory/products/product-advanced-filters";
import { ProductPageToolbar } from "@/components/inventory/products/product-page-toolbar";
import { ProductSummaryCards } from "@/components/inventory/products/product-summary-cards";

const DeleteProductDialog = dynamic(
  () =>
    import("@/components/inventory/products/delete-product-dialog").then(
      (m) => m.DeleteProductDialog,
    ),
  { ssr: false },
);
const InventoryAdjustmentDialog = dynamic(
  () =>
    import("@/components/inventory/products/inventory-adjustment-dialog").then(
      (m) => m.InventoryAdjustmentDialog,
    ),
  { ssr: false },
);
const ProductFormDialog = dynamic(
  () =>
    import("@/components/inventory/products/product-form-dialog").then(
      (m) => m.ProductFormDialog,
    ),
  { ssr: false },
);
const ProductTable = dynamic(
  () =>
    import("@/components/inventory/products/product-table").then((m) => m.ProductTable),
  { ssr: false, loading: () => <div className="min-h-[200px] animate-pulse rounded-md bg-muted/40" /> },
);
import type { ColumnMeta } from "@/components/inventory/products/column-customizer";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { EmptyState } from "@/components/shared/empty-state";
import { DEMO_INVENTORY_PRODUCTS } from "@/lib/inventory-products-demo-data";
import {
  formValuesToProduct,
  type InventoryProductFormValues,
} from "@/lib/inventory-product-form";
import type { InventoryProduct } from "@/types/inventory-product";

type FormMode = "add" | "edit" | "view" | null;

const CUSTOMIZABLE_COLUMNS: ColumnMeta[] = [
  { id: "numericId", label: "ID" },
  { id: "name", label: "Name" },
  { id: "brand", label: "Brand" },
  { id: "image", label: "Image" },
  { id: "category", label: "Category" },
  { id: "model", label: "Model" },
  { id: "stockWarning", label: "Stock Warning" },
  { id: "reorderLevel", label: "Reorder Level" },
  { id: "stock", label: "On Hand" },
  { id: "salePrice", label: "Price" },
  { id: "costPrice", label: "Unit Cost" },
];

const CUSTOMIZABLE_COLUMN_IDS = new Set(CUSTOMIZABLE_COLUMNS.map((c) => c.id));

const DEFAULT_COLUMN_ORDER: ColumnOrderState = [
  "select",
  ...CUSTOMIZABLE_COLUMNS.map((c) => c.id),
  "actions",
];

function buildFullColumnOrder(customOrder: string[]): ColumnOrderState {
  const ordered = customOrder.filter((id) => CUSTOMIZABLE_COLUMN_IDS.has(id));
  for (const { id } of CUSTOMIZABLE_COLUMNS) {
    if (!ordered.includes(id)) ordered.push(id);
  }
  return ["select", ...ordered, "actions"];
}

function matchesFilters(
  product: InventoryProduct,
  filters: ProductAdvancedFiltersState,
): boolean {
  if (filters.id && !String(product.numericId).includes(filters.id.trim())) return false;
  if (filters.name && !product.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
  if (filters.category && product.category !== filters.category) return false;
  if (filters.brand && product.brand !== filters.brand) return false;
  if (filters.model && product.model !== filters.model) return false;
  if (filters.skuUpc) {
    const q = filters.skuUpc.toLowerCase();
    if (!product.sku.toLowerCase().includes(q) && !product.barcode.toLowerCase().includes(q)) {
      return false;
    }
  }
  if (filters.imei && !(product.imei ?? "").toLowerCase().includes(filters.imei.toLowerCase())) return false;
  if (filters.serial && !(product.serial ?? "").toLowerCase().includes(filters.serial.toLowerCase())) return false;
  if (filters.supplier && product.supplier !== filters.supplier) return false;
  if (filters.valuationMethod && product.valuationMethod !== filters.valuationMethod) return false;
  if (filters.hideOutOfStock && product.status === "Out of Stock") return false;
  return true;
}

export function ProductsManagementView() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<InventoryProduct[]>(DEMO_INVENTORY_PRODUCTS);
  const [filters, setFilters] = useState<ProductAdvancedFiltersState>(
    DEFAULT_PRODUCT_ADVANCED_FILTERS,
  );
  const [activeFilters, setActiveFilters] = useState<ProductAdvancedFiltersState>(
    DEFAULT_PRODUCT_ADVANCED_FILTERS,
  );
  const [filtersPinned, setFiltersPinned] = useState(true);
  const [insightsOpen, setInsightsOpen] = useState(true);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(DEFAULT_COLUMN_ORDER);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [activeProduct, setActiveProduct] = useState<InventoryProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryProduct | null>(null);
  const [adjustmentTarget, setAdjustmentTarget] = useState<InventoryProduct | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredProducts = useMemo(
    () => products.filter((p) => matchesFilters(p, activeFilters)),
    [products, activeFilters],
  );

  const onEdit = useCallback((product: InventoryProduct) => {
    setActiveProduct(product);
    setFormMode("edit");
  }, []);

  const onDelete = useCallback((product: InventoryProduct) => {
    setDeleteTarget(product);
  }, []);

  const onAdjustInventory = useCallback((product: InventoryProduct) => {
    setAdjustmentTarget(product);
  }, []);

  const columns = useMemo(
    () => createProductColumns({ onEdit, onDelete, onAdjustInventory }),
    [onEdit, onDelete, onAdjustInventory],
  );

  const table = useReactTable({
    data: filteredProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    state: { rowSelection, columnOrder, columnVisibility },
    initialState: {
      pagination: { pageSize: 10, pageIndex: 0 },
    },
  });

  function handleColumnCustomizerSave(newOrder: string[], hidden: Set<string>) {
    const full = buildFullColumnOrder(newOrder);
    setColumnOrder(full);
    // build visibility map: hidden → false, else omit (defaults to visible)
    const vis: VisibilityState = {};
    CUSTOMIZABLE_COLUMNS.forEach((c) => {
      if (hidden.has(c.id)) vis[c.id] = false;
      else vis[c.id] = true;
    });
    setColumnVisibility(vis);
  }

  const openAdd = () => {
    router.push("/inventory/products/new");
  };

  const closeForm = () => {
    if (isSaving) return;
    setFormMode(null);
    setActiveProduct(null);
  };

  const handleSave = (values: InventoryProductFormValues) => {
    setIsSaving(true);
    setTimeout(() => {
      if (formMode === "add") {
        const created = formValuesToProduct(values);
        setProducts((prev) => [created, ...prev]);
        toast.success("Product added", { description: created.name });
      } else if (formMode === "edit" && activeProduct) {
        const updated = formValuesToProduct(values, activeProduct);
        setProducts((prev) =>
          prev.map((p) => (p.id === activeProduct.id ? updated : p)),
        );
        toast.success("Product updated", { description: updated.name });
      }
      setIsSaving(false);
      closeForm();
    }, 400);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    toast.success("Product deleted", { description: deleteTarget.name });
    setDeleteTarget(null);
  };

  const handleInventoryAdjustment = (payload: {
    productId: string;
    adjustmentType: "increase" | "decrease";
    adjustmentQuantity: number;
    costPrice: number;
    newOnHandQuantity: number;
    notes: string;
  }) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id !== payload.productId) return product;
        const nextStock = payload.newOnHandQuantity;
        const nextStatus =
          nextStock <= 0
            ? "Out of Stock"
            : nextStock <= product.lowStockAlert
              ? "Low Stock"
              : product.status === "Draft"
                ? "Draft"
                : "In Stock";
        return {
          ...product,
          stock: nextStock,
          costPrice: payload.costPrice,
          stockWarning: nextStock <= product.lowStockAlert ? 1 : 0,
          status: nextStatus,
        };
      }),
    );
    toast.success("Inventory adjusted", {
      description: `${payload.adjustmentType === "increase" ? "Increased" : "Decreased"} by ${payload.adjustmentQuantity}`,
    });
  };

  if (!mounted) return null;

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <RepairsTopNav />
      <main className="flex-1 overflow-auto px-4 py-4 md:px-5">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <nav
            className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
            aria-label="Breadcrumb"
          >
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden />
            <span>Manage Inventory</span>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden />
            <span className="font-medium text-foreground">Products</span>
          </nav>

          <header>
            <ProductPageToolbar
              onAddProduct={openAdd}
              filtersOpen={filtersPinned}
              onToggleFilters={() => setFiltersPinned((v) => !v)}
              onClearFilters={() => {
                setFilters(DEFAULT_PRODUCT_ADVANCED_FILTERS);
                setActiveFilters(DEFAULT_PRODUCT_ADVANCED_FILTERS);
                table.setPageIndex(0);
              }}
              insightsOpen={insightsOpen}
              onToggleInsights={() => setInsightsOpen((v) => !v)}
            />
          </header>

          {insightsOpen ? <ProductSummaryCards products={filteredProducts} /> : null}

          <section className="pos-table-shell space-y-3 p-3 md:p-4">
            {filtersPinned ? (
            <ProductAdvancedFilters
              filters={filters}
              pinned={filtersPinned}
              onPinnedChange={setFiltersPinned}
              onChange={setFilters}
              onSearch={() => {
                setActiveFilters(filters);
                table.setPageIndex(0);
              }}
              onReset={() => {
                setFilters(DEFAULT_PRODUCT_ADVANCED_FILTERS);
                setActiveFilters(DEFAULT_PRODUCT_ADVANCED_FILTERS);
                table.setPageIndex(0);
              }}
            />
            ) : null}

            {products.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No products yet"
                description="Add your first product to start managing inventory."
                actionLabel="Add Product"
                onAction={openAdd}
              />
            ) : (
              <ProductTable
                table={table}
                customizerProps={{
                  columns: CUSTOMIZABLE_COLUMNS,
                  columnOrder: columnOrder.filter((id) => CUSTOMIZABLE_COLUMN_IDS.has(id)),
                  hiddenColumns: new Set(
                    Object.entries(columnVisibility)
                      .filter(([, v]) => v === false)
                      .map(([k]) => k),
                  ),
                  onSave: handleColumnCustomizerSave,
                }}
              />
            )}
          </section>

          <ProductFormDialog
            open={formMode != null}
            onOpenChange={(open) => {
              if (!open) closeForm();
            }}
            mode={formMode === "view" ? "view" : formMode === "edit" ? "edit" : "add"}
            product={activeProduct}
            isSubmitting={isSaving}
            onSave={handleSave}
          />

          <DeleteProductDialog
            open={deleteTarget != null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            productLabel={deleteTarget?.name ?? ""}
            onConfirm={handleDeleteConfirm}
          />

          <InventoryAdjustmentDialog
            open={adjustmentTarget != null}
            onOpenChange={(open) => {
              if (!open) setAdjustmentTarget(null);
            }}
            product={adjustmentTarget}
            onSubmit={handleInventoryAdjustment}
          />
        </div>
      </main>
    </div>
  );
}

export { ProductsManagementView as ProductsPage };
