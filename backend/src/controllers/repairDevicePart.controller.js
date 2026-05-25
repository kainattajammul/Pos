import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP } from "../constants/httpStatus.js";
import { ApiError } from "../utils/ApiError.js";
import {
  createRepairDevicePart,
  deleteRepairDevicePart,
  listRepairDeviceParts,
  updateRepairDevicePart,
} from "../services/repairDevicePart.service.js";
import { uploadRepairDevicePartImage } from "../services/supabaseStorage.service.js";
import { toPublicRepairDevicePart } from "../utils/repairDevicePartMapper.js";

export const RepairDevicePartController = {
  async list(req, res) {
    const shopId = Number(req.query.shopId);
    const repairCategoryId = Number(req.query.repairCategoryId);
    const repairManufacturerId = Number(req.query.repairManufacturerId);
    const repairDeviceId = Number(req.query.repairDeviceId);
    const parts = await listRepairDeviceParts(
      shopId,
      repairCategoryId,
      repairManufacturerId,
      repairDeviceId,
    );

    return ApiResponse.success(res, {
      message: "Repair device parts fetched successfully",
      data: parts.map(toPublicRepairDevicePart),
    });
  },

  async uploadImage(req, res) {
    const shopId = Number(req.body.shopId);
    const repairCategoryId = Number(req.body.repairCategoryId);
    const repairManufacturerId = Number(req.body.repairManufacturerId);
    const repairDeviceId = Number(req.body.repairDeviceId);
    if (!req.file) {
      throw new ApiError(HTTP.BAD_REQUEST, "Image file is required (field name: image)");
    }

    const result = await uploadRepairDevicePartImage(
      req.file,
      shopId,
      repairCategoryId,
      repairManufacturerId,
      repairDeviceId,
    );

    return ApiResponse.success(res, {
      statusCode: HTTP.CREATED,
      message: "Image uploaded successfully",
      data: result,
    });
  },

  async create(req, res) {
    const part = await createRepairDevicePart(req.body);

    return ApiResponse.success(res, {
      statusCode: HTTP.CREATED,
      message: "Repair device part created successfully",
      data: toPublicRepairDevicePart(part),
    });
  },

  async update(req, res) {
    const part = await updateRepairDevicePart(req.params.id, req.body);

    return ApiResponse.success(res, {
      message: "Repair device part updated successfully",
      data: toPublicRepairDevicePart(part),
    });
  },

  async remove(req, res) {
    await deleteRepairDevicePart(req.params.id);

    return ApiResponse.success(res, {
      message: "Repair device part deleted successfully",
    });
  },
};
