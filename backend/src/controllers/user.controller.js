import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP } from "../constants/httpStatus.js";
import { UserModel } from "../models/user.model.js";
import { createUser, deleteUser, updateUser } from "../services/user.service.js";
import {
  toCreatedUserResponse,
  toPublicUser,
  toUpdatedUserResponse,
} from "../utils/userMapper.js";

export const UserController = {
  async create(req, res) {
    const { fullName, email, password, phone, shopId, roleId, status } = req.body;

    const user = await createUser({
      fullName,
      email,
      password,
      phone: phone || null,
      shopId,
      roleId: roleId ?? null,
      status,
    });

    return ApiResponse.success(res, {
      statusCode: HTTP.CREATED,
      message: "User created successfully",
      data: toCreatedUserResponse(user),
    });
  },

  async getAll(_req, res) {
    const users = await UserModel.findAll();
    return ApiResponse.success(res, {
      message: "Users fetched successfully",
      data: users.map(toPublicUser),
    });
  },

  async getOne(req, res) {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      throw new ApiError(HTTP.NOT_FOUND, "User not found");
    }
    return ApiResponse.success(res, {
      message: "User fetched successfully",
      data: toPublicUser(user),
    });
  },

  async update(req, res) {
    const { fullName, email, password, phone } = req.body;

    const user = await updateUser(req.params.id, {
      fullName,
      email,
      password,
      phone,
    });

    return ApiResponse.success(res, {
      message: "User updated successfully",
      data: toUpdatedUserResponse(user),
    });
  },

  async remove(req, res) {
    await deleteUser(req.params.id);
    return ApiResponse.success(res, {
      message: "User deleted successfully",
    });
  },
};
