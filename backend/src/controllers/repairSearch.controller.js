import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getRepairBookingContext,
  searchRepairs,
} from "../services/repairCatalog.service.js";

export const RepairSearchController = {
  async search(req, res) {
    const shopId = Number(req.query.shopId ?? 1);
    const query = String(req.query.query ?? "");

    const data = await searchRepairs(shopId, query);

    return ApiResponse.success(res, {
      message: "Repair search completed",
      data,
    });
  },

  async bookingContext(req, res) {
    const shopId = Number(req.query.shopId ?? 1);
    const deviceId = Number(req.query.deviceId);
    const repairTypeId = Number(req.query.repairTypeId);

    const data = await getRepairBookingContext(deviceId, repairTypeId, shopId);

    return ApiResponse.success(res, {
      message: "Repair booking context fetched",
      data,
    });
  },
};
