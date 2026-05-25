import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP } from "../constants/httpStatus.js";
import { ApiError } from "../utils/ApiError.js";
import {
  createRepairDeviceIssue,
  deleteRepairDeviceIssue,
  listRepairDeviceIssues,
  searchIcons,
  updateRepairDeviceIssue,
} from "../services/repairDeviceIssue.service.js";
import { uploadRepairDeviceIssueImage } from "../services/supabaseStorage.service.js";
import { toPublicRepairDeviceIssue } from "../utils/repairDeviceIssueMapper.js";

export const RepairDeviceIssueController = {
  async list(req, res) {
    const shopId = Number(req.query.shopId);
    const repairCategoryId = Number(req.query.repairCategoryId);
    const repairManufacturerId = Number(req.query.repairManufacturerId);
    const repairDeviceId = Number(req.query.repairDeviceId);
    const issues = await listRepairDeviceIssues(
      shopId,
      repairCategoryId,
      repairManufacturerId,
      repairDeviceId,
    );

    return ApiResponse.success(res, {
      message: "Repair device issues fetched successfully",
      data: issues.map(toPublicRepairDeviceIssue),
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
    const repairManufacturerId = Number(req.body.repairManufacturerId);
    const repairDeviceId = Number(req.body.repairDeviceId);
    if (!req.file) {
      throw new ApiError(HTTP.BAD_REQUEST, "Image file is required (field name: image)");
    }

    const result = await uploadRepairDeviceIssueImage(
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
    const issue = await createRepairDeviceIssue(req.body);

    return ApiResponse.success(res, {
      statusCode: HTTP.CREATED,
      message: "Repair device issue created successfully",
      data: toPublicRepairDeviceIssue(issue),
    });
  },

  async update(req, res) {
    const issue = await updateRepairDeviceIssue(req.params.id, req.body);

    return ApiResponse.success(res, {
      message: "Repair device issue updated successfully",
      data: toPublicRepairDeviceIssue(issue),
    });
  },

  async remove(req, res) {
    await deleteRepairDeviceIssue(req.params.id);

    return ApiResponse.success(res, {
      message: "Repair device issue deleted successfully",
    });
  },
};
