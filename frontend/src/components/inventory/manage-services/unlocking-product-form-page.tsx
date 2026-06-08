"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UnlockingProductForm } from "@/components/inventory/manage-services/unlocking-product-form";
import {
  DEFAULT_UNLOCKING_PRODUCT_FORM,
  formValuesToUnlockingProduct,
  getNextUnlockingItemId,
  unlockingRecordToFormValues,
  type UnlockingProductRecord,
} from "@/components/inventory/manage-services/unlocking-product-form-types";
import {
  getUnlockingProductById,
  loadUnlockingProductRecords,
  upsertUnlockingProduct,
} from "@/components/inventory/manage-services/unlocking-products-store";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";

interface UnlockingProductFormPageProps {
  mode: "add" | "edit";
  id?: string;
}

export function UnlockingProductFormPage({ mode, id }: UnlockingProductFormPageProps) {
  const router = useRouter();
  const [values, setValues] = useState(DEFAULT_UNLOCKING_PRODUCT_FORM);
  const [existing, setExisting] = useState<UnlockingProductRecord | null>(null);
  const [nameError, setNameError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(mode === "add");

  useEffect(() => {
    if (mode !== "edit" || !id) {
      setIsReady(true);
      return;
    }

    const record = getUnlockingProductById(id);
    if (!record) {
      toast.error("Unlocking product not found");
      router.replace("/inventory/services/unlocking");
      return;
    }

    setExisting(record);
    setValues(unlockingRecordToFormValues(record));
    setIsReady(true);
  }, [id, mode, router]);

  const listHref = "/inventory/services/unlocking";
  const breadcrumbTail =
    mode === "add" ? "New Product" : values.name.trim() || existing?.name || "Edit Product";

  const handleSave = () => {
    const trimmedName = values.name.trim();
    if (!trimmedName) {
      setNameError("Name is required");
      return;
    }

    setNameError("");
    setIsSubmitting(true);

    setTimeout(() => {
      if (mode === "edit" && existing) {
        const updated = formValuesToUnlockingProduct(values, existing);
        upsertUnlockingProduct(updated);
        toast.success("Unlocking product updated", { description: updated.name });
      } else {
        const records = loadUnlockingProductRecords();
        const created = formValuesToUnlockingProduct(values);
        created.itemId = getNextUnlockingItemId(records);
        created.id = `unlock-${created.itemId}`;
        upsertUnlockingProduct(created);
        toast.success("Unlocking product created", { description: created.name });
      }

      setIsSubmitting(false);
      router.push(listHref);
    }, 200);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    toast.message("File removed");
  };

  if (!isReady) {
    return (
      <div className="flex min-h-[320px] flex-1 items-center justify-center bg-pos-page text-sm text-[#6B7280]">
        Loading…
      </div>
    );
  }

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <RepairsTopNav />
      <main className="flex-1 overflow-auto bg-pos-page">
        <div className="mx-auto w-full max-w-[1600px] space-y-4 p-4 md:p-5">
          <nav className="pos-breadcrumb" aria-label="Breadcrumb">
            <Link href="/dashboard">Home</Link>
            <span className="mx-1.5 text-pos-subtle">/</span>
            <Link href={listHref}>Unlocking</Link>
            <span className="mx-1.5 text-pos-subtle">/</span>
            <span className="font-medium text-pos-secondary">{breadcrumbTail}</span>
          </nav>

          <h1 className="text-lg font-semibold text-pos">
            {mode === "edit" && existing
              ? `Item # ${existing.itemId}`
              : "New Unlocking Product"}
          </h1>

          <section className="pos-card rounded-sm p-4 md:p-6">
            <UnlockingProductForm
              values={values}
              onChange={setValues}
              nameError={nameError}
              selectedFileName={selectedFile?.name}
              onFileChange={setSelectedFile}
              onFileRemove={handleFileRemove}
              onSubmit={handleSave}
              onCancel={() => router.push(listHref)}
              isSubmitting={isSubmitting}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
