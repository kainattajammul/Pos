export interface RepairConditionImage {
  id: string;
  url: string;
  name: string;
  uploadedAt: number;
}

export function createConditionImageFromFile(file: File): RepairConditionImage {
  return {
    id: crypto.randomUUID(),
    url: URL.createObjectURL(file),
    name: file.name,
    uploadedAt: Date.now(),
  };
}

export function revokeConditionImage(image: RepairConditionImage) {
  if (image.url.startsWith("blob:")) {
    URL.revokeObjectURL(image.url);
  }
}

export function revokeConditionImages(images: RepairConditionImage[]) {
  images.forEach(revokeConditionImage);
}
