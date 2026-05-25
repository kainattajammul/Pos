import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP } from "../constants/httpStatus.js";
import { ApiError } from "../utils/ApiError.js";
import {
  createRepairDevice,
  deleteRepairDevice,
  listRepairDevices,
  updateRepairDevice,
} from "../services/repairDevice.service.js";
import { uploadRepairDeviceImage } from "../services/supabaseStorage.service.js";
import { toPublicRepairDevice } from "../utils/repairDeviceMapper.js";

export const RepairDeviceController = {
  async list(req, res) {
    const shopId = Number(req.query.shopId);
    const repairCategoryId = Number(req.query.repairCategoryId);
    const repairManufacturerId = Number(req.query.repairManufacturerId);
    const devices = await listRepairDevices(
      shopId,
      repairCategoryId,
      repairManufacturerId,
    );

    return ApiResponse.success(res, {
      message: "Repair devices fetched successfully",
      data: devices.map(toPublicRepairDevice),
    });
  },

  async uploadImage(req, res) {
    const shopId = Number(req.body.shopId);
    const repairCategoryId = Number(req.body.repairCategoryId);
    const repairManufacturerId = Number(req.body.repairManufacturerId);
    if (!req.file) {
      throw new ApiError(HTTP.BAD_REQUEST, "Image file is required (field name: image)");
    }

    const result = await uploadRepairDeviceImage(
      req.file,
      shopId,
      repairCategoryId,
      repairManufacturerId,
    );

    return ApiResponse.success(res, {
      statusCode: HTTP.CREATED,
      message: "Image uploaded successfully",
      data: result,
    });
  },

  async create(req, res) {
    const device = await createRepairDevice(req.body);

    return ApiResponse.success(res, {
      statusCode: HTTP.CREATED,
      message: "Repair device created successfully",
      data: toPublicRepairDevice(device),
    });
  },

  async update(req, res) {
    const device = await updateRepairDevice(req.params.id, req.body);

    return ApiResponse.success(res, {
      message: "Repair device updated successfully",
      data: toPublicRepairDevice(device),
    });
  },

  async remove(req, res) {
    await deleteRepairDevice(req.params.id);

    return ApiResponse.success(res, {
      message: "Repair device deleted successfully",
    });
  },
};
