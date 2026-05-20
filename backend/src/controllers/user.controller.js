import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP } from "../constants/httpStatus.js";
import { UserModel } from "../models/user.model.js";
import { hashPassword } from "../utils/password.js";
import { toPublicUser } from "../utils/userMapper.js";

export const UserController = {
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
    const { fullName, email, password, phone, roleId, shopId, status } = req.body;

    const existing = await UserModel.findById(req.params.id);
    if (!existing) {
      throw new ApiError(HTTP.NOT_FOUND, "User not found");
    }

    if (email && email !== existing.email) {
      const duplicate = await UserModel.findByEmail(email);
      if (duplicate) {
        throw new ApiError(HTTP.CONFLICT, "Email is already in use");
      }
    }

    const data = {};
    if (fullName !== undefined) data.fullName = fullName;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (roleId !== undefined) data.roleId = roleId;
    if (shopId !== undefined) data.shopId = shopId;
    if (status !== undefined) data.status = status;
    if (password) data.passwordHash = await hashPassword(password);

    const user = await UserModel.update(req.params.id, data);
    return ApiResponse.success(res, {
      message: "User updated successfully",
      data: toPublicUser(user),
    });
  },

  async remove(req, res) {
    const existing = await UserModel.findById(req.params.id);
    if (!existing) {
      throw new ApiError(HTTP.NOT_FOUND, "User not found");
    }
    await UserModel.remove(req.params.id);
    return ApiResponse.success(res, {
      message: "User deleted successfully",
      data: null,
    });
  },
};
