import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP } from "../constants/httpStatus.js";
import { RoleModel } from "../models/role.model.js";
import { createRole, deleteRole, getAllRoles, updateRole } from "../services/role.service.js";
import { toPublicRole } from "../utils/roleMapper.js";

export const RoleController = {
  async getAll(_req, res) {
    const roles = await getAllRoles();
    return ApiResponse.success(res, {
      message: "Roles fetched successfully",
      data: roles.map(toPublicRole),
    });
  },

  async getOne(req, res) {
    const role = await RoleModel.findById(req.params.id);
    if (!role) {
      throw new ApiError(HTTP.NOT_FOUND, "Role not found");
    }
    return ApiResponse.success(res, {
      message: "Role fetched successfully",
      data: toPublicRole(role),
    });
  },

  async create(req, res) {
    const { shopId, name } = req.body;

    const role = await createRole({ shopId, name });

    return ApiResponse.success(res, {
      statusCode: HTTP.CREATED,
      message: "Role created successfully",
      data: toPublicRole(role),
    });
  },

  async update(req, res) {
    const { shopId, name } = req.body;

    const role = await updateRole(req.params.id, { shopId, name });

    return ApiResponse.success(res, {
      message: "Role updated successfully",
      data: toPublicRole(role),
    });
  },

  async remove(req, res) {
    await deleteRole(req.params.id);
    return ApiResponse.success(res, {
      message: "Role deleted successfully",
    });
  },
};
