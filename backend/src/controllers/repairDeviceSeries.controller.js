import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP } from "../constants/httpStatus.js";
import {
  createRepairDeviceSeries,
  deleteRepairDeviceSeries,
  listRepairDeviceSeries,
  updateRepairDeviceSeries,
} from "../services/repairDeviceSeries.service.js";
import { toPublicRepairDeviceSeries } from "../utils/repairDeviceSeriesMapper.js";

export const RepairDeviceSeriesController = {
  async list(req, res) {
    const shopId = Number(req.query.shopId);
    const repairCategoryId = Number(req.query.repairCategoryId);
    const repairManufacturerId = Number(req.query.repairManufacturerId);
    const series = await listRepairDeviceSeries(
      shopId,
      repairCategoryId,
      repairManufacturerId,
    );

    return ApiResponse.success(res, {
      message: "Repair device series fetched successfully",
      data: series.map(toPublicRepairDeviceSeries),
    });
  },

  async create(req, res) {
    const created = await createRepairDeviceSeries(req.body);

    return ApiResponse.success(res, {
      statusCode: HTTP.CREATED,
      message: "Repair device series created successfully",
      data: toPublicRepairDeviceSeries(created),
    });
  },

  async update(req, res) {
    const updated = await updateRepairDeviceSeries(req.params.id, req.body);

    return ApiResponse.success(res, {
      message: "Repair device series updated successfully",
      data: toPublicRepairDeviceSeries(updated),
    });
  },

  async remove(req, res) {
    await deleteRepairDeviceSeries(req.params.id);

    return ApiResponse.success(res, {
      message: "Repair device series deleted successfully",
    });
  },
};
