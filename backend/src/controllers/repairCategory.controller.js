import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP } from "../constants/httpStatus.js";
import { ApiError } from "../utils/ApiError.js";
import {
  createRepairCategory,
  deleteRepairCategory,
  listRepairCategories,
  searchIcons,
  updateRepairCategory,
} from "../services/repairCategory.service.js";
import { uploadRepairCategoryImage } from "../services/supabaseStorage.service.js";
import { toPublicRepairCategory } from "../utils/repairCategoryMapper.js";

export const RepairCategoryController = {
  async list(req, res) {
    const shopId = Number(req.query.shopId);
    const categories = await listRepairCategories(shopId);

    return ApiResponse.success(res, {
      message: "Repair categories fetched successfully",
      data: categories.map(toPublicRepairCategory),
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
    if (!req.file) {
      throw new ApiError(HTTP.BAD_REQUEST, "Image file is required (field name: image)");
    }

    const result = await uploadRepairCategoryImage(req.file, shopId);

    return ApiResponse.success(res, {
      statusCode: HTTP.CREATED,
      message: "Image uploaded successfully",
      data: result,
    });
  },

  async create(req, res) {
    const category = await createRepairCategory(req.body);

    return ApiResponse.success(res, {
      statusCode: HTTP.CREATED,
      message: "Repair category created successfully",
      data: toPublicRepairCategory(category),
    });
  },

  async update(req, res) {
    const category = await updateRepairCategory(req.params.id, req.body);

    return ApiResponse.success(res, {
      message: "Repair category updated successfully",
      data: toPublicRepairCategory(category),
    });
  },

  async remove(req, res) {
    await deleteRepairCategory(req.params.id);

    return ApiResponse.success(res, {
      message: "Repair category deleted successfully",
    });
  },
};
