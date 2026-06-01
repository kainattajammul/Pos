import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP } from "../constants/httpStatus.js";
import {
  createSalesCommissionAgent,
  deleteSalesCommissionAgent,
  getAllSalesCommissionAgents,
  getSalesCommissionAgentById,
  updateSalesCommissionAgent,
} from "../services/salesCommissionAgent.service.js";
import { toPublicSalesCommissionAgent } from "../utils/salesCommissionAgentMapper.js";

export const SalesCommissionAgentController = {
  async getAll(_req, res) {
    const agents = await getAllSalesCommissionAgents();
    return ApiResponse.success(res, {
      message: "Sales commission agents fetched successfully",
      data: agents.map(toPublicSalesCommissionAgent),
    });
  },

  async getOne(req, res) {
    const agent = await getSalesCommissionAgentById(req.params.id);
    return ApiResponse.success(res, {
      message: "Sales commission agent fetched successfully",
      data: toPublicSalesCommissionAgent(agent),
    });
  },

  async create(req, res) {
    const agent = await createSalesCommissionAgent(req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP.CREATED,
      message: "Sales commission agent created successfully",
      data: toPublicSalesCommissionAgent(agent),
    });
  },

  async update(req, res) {
    const agent = await updateSalesCommissionAgent(req.params.id, req.body);
    return ApiResponse.success(res, {
      message: "Sales commission agent updated successfully",
      data: toPublicSalesCommissionAgent(agent),
    });
  },

  async remove(req, res) {
    await deleteSalesCommissionAgent(req.params.id);
    return ApiResponse.success(res, {
      message: "Sales commission agent deleted successfully",
    });
  },
};
