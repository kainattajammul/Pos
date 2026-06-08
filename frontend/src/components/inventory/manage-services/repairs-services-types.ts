export interface RepairsService {
  id: string;
  numericId: number;
  category: string;
  brand: string;
  model: string;
  serviceName: string;
  price: number;
  displayOnWidget: boolean;
}

export interface RepairsServiceFilters {
  category: string;
  brand: string;
  model: string;
  keyword: string;
}

export const DEFAULT_REPAIRS_FILTERS: RepairsServiceFilters = {
  category: "",
  brand: "",
  model: "",
  keyword: "",
};

export const MOCK_REPAIRS_SERVICES: RepairsService[] = [];

export const CATEGORY_OPTIONS = [
  "Please Select",
  "Screen Repair",
  "Battery",
  "Water Damage",
];

export const BRAND_OPTIONS = ["Please Select", "Apple", "Samsung", "Huawei"];

export const MODEL_OPTIONS = [
  "Please Select",
  "iPhone 15 Pro",
  "Galaxy S24",
  "P50 Pro",
];

export function filterRepairsServices(
  rows: RepairsService[],
  filters: RepairsServiceFilters,
): RepairsService[] {
  const keyword = filters.keyword.trim().toLowerCase();

  return rows.filter((row) => {
    if (filters.category && row.category !== filters.category) return false;
    if (filters.brand && row.brand !== filters.brand) return false;
    if (filters.model && row.model !== filters.model) return false;
    if (keyword && !row.serviceName.toLowerCase().includes(keyword)) return false;
    return true;
  });
}
