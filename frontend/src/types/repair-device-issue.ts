import type { RepairProblemIcon } from "@/lib/repair-issue-icons";

export interface ApiRepairDeviceIssue {
  id: number;
  shopId: number;
  repairCategoryId: number;
  repairManufacturerId: number;
  repairDeviceId: number;
  name: string;
  slug: string;
  price: number;
  iconKey: RepairProblemIcon;
  imageUrl: string | null;
  sortOrder: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IssueIconOption {
  key: RepairProblemIcon;
  label: string;
}

export interface CreateRepairDeviceIssuePayload {
  shopId: number;
  repairCategoryId: number;
  repairManufacturerId: number;
  repairDeviceId: number;
  name: string;
  price: number;
  iconKey?: RepairProblemIcon;
  imageUrl?: string | null;
  sortOrder?: number;
}

export interface UpdateRepairDeviceIssuePayload {
  name?: string;
  price?: number;
  iconKey?: RepairProblemIcon;
  imageUrl?: string | null;
  sortOrder?: number;
}

export interface UploadRepairDeviceIssueImageResult {
  url: string;
  path: string;
}
