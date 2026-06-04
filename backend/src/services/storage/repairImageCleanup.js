import { prisma } from "../../config/database.js";
import { deleteStoredImages } from "./deleteImage.js";

function collectUrls(rows) {
  return rows.map((r) => r.imageUrl).filter((url) => url?.trim());
}

/** All image URLs under a repair category (including cascaded children). */
export async function collectRepairCategoryImageUrls(categoryId) {
  const id = Number(categoryId);
  const [category, manufacturers, devices, issues, parts] = await Promise.all([
    prisma.repairCategory.findUnique({ where: { id } }),
    prisma.repairManufacturer.findMany({ where: { repairCategoryId: id } }),
    prisma.repairDevice.findMany({ where: { repairCategoryId: id } }),
    prisma.repairDeviceIssue.findMany({ where: { repairCategoryId: id } }),
    prisma.repairDevicePart.findMany({ where: { repairCategoryId: id } }),
  ]);

  return collectUrls(
    [category, ...manufacturers, ...devices, ...issues, ...parts].filter(Boolean),
  );
}

/** Images for manufacturer + its devices, issues, and parts. */
export async function collectRepairManufacturerImageUrls(manufacturerId) {
  const id = Number(manufacturerId);
  const [manufacturer, devices, issues, parts] = await Promise.all([
    prisma.repairManufacturer.findUnique({ where: { id } }),
    prisma.repairDevice.findMany({ where: { repairManufacturerId: id } }),
    prisma.repairDeviceIssue.findMany({ where: { repairManufacturerId: id } }),
    prisma.repairDevicePart.findMany({ where: { repairManufacturerId: id } }),
  ]);

  return collectUrls(
    [manufacturer, ...devices, ...issues, ...parts].filter(Boolean),
  );
}

/** Images for device + its issues and parts. */
export async function collectRepairDeviceImageUrls(deviceId) {
  const id = Number(deviceId);
  const [device, issues, parts] = await Promise.all([
    prisma.repairDevice.findUnique({ where: { id } }),
    prisma.repairDeviceIssue.findMany({ where: { repairDeviceId: id } }),
    prisma.repairDevicePart.findMany({ where: { repairDeviceId: id } }),
  ]);

  return collectUrls([device, ...issues, ...parts].filter(Boolean));
}

export async function purgeRepairCategoryImages(categoryId) {
  const urls = await collectRepairCategoryImageUrls(categoryId);
  await deleteStoredImages(urls);
}

export async function purgeRepairManufacturerImages(manufacturerId) {
  const urls = await collectRepairManufacturerImageUrls(manufacturerId);
  await deleteStoredImages(urls);
}

export async function purgeRepairDeviceImages(deviceId) {
  const urls = await collectRepairDeviceImageUrls(deviceId);
  await deleteStoredImages(urls);
}
