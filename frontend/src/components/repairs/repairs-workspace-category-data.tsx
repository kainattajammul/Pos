"use client";

import { useEffect, useRef } from "react";
import {
  useCreateRepairCategory,
  useDeleteRepairCategory,
  useRepairCategories,
  useUpdateRepairCategory,
} from "@/hooks/use-repair-categories";
import { REPAIR_CATEGORIES, type RepairCategoryCard } from "@/lib/repairs-pos-data";

export interface RepairsWorkspaceCategoryDataSnapshot {
  categories: RepairCategoryCard[];
  categoriesLoading: boolean;
  categoriesError: boolean;
  createCategory: ReturnType<typeof useCreateRepairCategory>;
  updateCategory: ReturnType<typeof useUpdateRepairCategory>;
  deleteCategory: ReturnType<typeof useDeleteRepairCategory>;
}

interface RepairsWorkspaceCategoryDataProps {
  shopId: number;
  onSnapshot: (snapshot: RepairsWorkspaceCategoryDataSnapshot) => void;
}

export function RepairsWorkspaceCategoryData({
  shopId,
  onSnapshot,
}: RepairsWorkspaceCategoryDataProps) {
  const {
    data: categories = REPAIR_CATEGORIES,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useRepairCategories(shopId);
  const createCategory = useCreateRepairCategory(shopId);
  const updateCategory = useUpdateRepairCategory(shopId);
  const deleteCategory = useDeleteRepairCategory(shopId);

  const onSnapshotRef = useRef(onSnapshot);
  onSnapshotRef.current = onSnapshot;

  const mutationPending =
    createCategory.isPending ||
    updateCategory.isPending ||
    deleteCategory.isPending;

  const lastEmitRef = useRef<{
    categories: RepairCategoryCard[];
    categoriesLoading: boolean;
    categoriesError: boolean;
    mutationPending: boolean;
  } | null>(null);

  useEffect(() => {
    const prev = lastEmitRef.current;
    if (
      prev &&
      prev.categories === categories &&
      prev.categoriesLoading === categoriesLoading &&
      prev.categoriesError === categoriesError &&
      prev.mutationPending === mutationPending
    ) {
      return;
    }
    lastEmitRef.current = {
      categories,
      categoriesLoading,
      categoriesError,
      mutationPending,
    };
    onSnapshotRef.current({
      categories,
      categoriesLoading,
      categoriesError,
      createCategory,
      updateCategory,
      deleteCategory,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, categoriesLoading, categoriesError, mutationPending]);

  return null;
}
