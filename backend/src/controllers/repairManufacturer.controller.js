import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP } from "../constants/httpStatus.js";
import { ApiError } from "../utils/ApiError.js";
import {
  createRepairManufacturer,
  deleteRepairManufacturer,
  listRepairManufacturers,
  searchIcons,
  updateRepairManufacturer,
} from "../services/repairManufacturer.service.js";
import { uploadRepairManufacturerImage } from "../services/supabaseStorage.service.js";
import { toPublicRepairManufacturer } from "../utils/repairManufacturerMapper.js";

export const RepairManufacturerController = {
  async list(req, res) {
    const shopId = Number(req.query.shopId);
    const repairCategoryId = Number(req.query.repairCategoryId);
    const manufacturers = await listRepairManufacturers(shopId, repairCategoryId);

    return ApiResponse.success(res, {
      message: "Repair manufacturers fetched successfully",
      data: manufacturers.map(toPublicRepairManufacturer),
    });
  },

  async searchIcons(req, res) {
    const q = req.query.q ?? "";
    const limit = req.query.limit ? Number(req.query.limit) : 32;
    const icons = searchIcons(q, limit);

    return ApiResponse.success(res, {
      message: "Icons fetched successfully",
      data: icons,
    });
  },

  async uploadImage(req, res) {
    const shopId = Number(req.body.shopId);
    const repairCategoryId = Number(req.body.repairCategoryId);
    if (!req.file) {
      throw new ApiError(HTTP.BAD_REQUEST, "Image file is required (field name: image)");
    }

    const result = await uploadRepairManufacturerImage(req.file, shopId, repairCategoryId);

    return ApiResponse.success(res, {
      statusCode: HTTP.CREATED,
      message: "Image uploaded successfully",
      data: result,
    });
  },

  async create(req, res) {
    const manufacturer = await createRepairManufacturer(req.body);

    return ApiResponse.success(res, {
      statusCode: HTTP.CREATED,
      message: "Repair manufacturer created successfully",
      data: toPublicRepairManufacturer(manufacturer),
    });
  },

  async update(req, res) {
    const manufacturer = await updateRepairManufacturer(req.params.id, req.body);

    return ApiResponse.success(res, {
      message: "Repair manufacturer updated successfully",
      data: toPublicRepairManufacturer(manufacturer),
    });
  },

  async remove(req, res) {
    await deleteRepairManufacturer(req.params.id);

    return ApiResponse.success(res, {
      message: "Repair manufacturer deleted successfully",
    });
  },
};
