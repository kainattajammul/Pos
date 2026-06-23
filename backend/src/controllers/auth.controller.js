import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP } from "../constants/httpStatus.js";
import { DEFAULT_ROLE_ID } from "../constants/roles.js";
import { UserModel } from "../models/user.model.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { toAuthUser, toPublicUser } from "../utils/userMapper.js";
import { env } from "../config/env.js";
import { isDatabaseConnected } from "../config/database.js";

const REFRESH_COOKIE = "refreshToken";

function devBypassLogin(email) {
  const user = {
    id: 0,
    fullName: "Dev User",
    email,
    roleId: 1,
    shopId: null,
    status: "active",
  };
  const tokenPayload = {
    userId: 0,
    email,
    devBypass: true,
    name: user.fullName,
  };
  return {
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload),
    user: toAuthUser(user),
  };
}

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export const AuthController = {
  async register(req, res) {
    const { fullName, email, password, phone, roleId, shopId } = req.body;

    const existing = await UserModel.findByEmail(email);
    if (existing) {
      throw new ApiError(HTTP.CONFLICT, "Email is already registered");
    }

    const passwordHash = await hashPassword(password);
    const user = await UserModel.create({
      fullName,
      email,
      passwordHash,
      phone: phone ?? null,
      roleId: roleId ?? DEFAULT_ROLE_ID,
      shopId: shopId ?? null,
    });

    return ApiResponse.success(res, {
      statusCode: HTTP.CREATED,
      message: "User registered successfully",
      data: toPublicUser(user),
    });
  },

  async login(req, res) {
    const { email, password } = req.body;

    if (env.devAuthBypass && !isDatabaseConnected()) {
      const session = devBypassLogin(email);
      setRefreshCookie(res, session.refreshToken);
      return ApiResponse.success(res, {
        message: "Login successful (dev bypass — database offline)",
        data: {
          accessToken: session.accessToken,
          user: session.user,
          refreshExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new ApiError(HTTP.UNAUTHORIZED, "Invalid email or password");
    }

    if (user.status !== "active") {
      throw new ApiError(HTTP.FORBIDDEN, "Account is not active");
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      throw new ApiError(HTTP.UNAUTHORIZED, "Invalid email or password");
    }

    await UserModel.updateLastLogin(user.id);
    const refreshed = await UserModel.findById(user.id);

    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);
    setRefreshCookie(res, refreshToken);

    return ApiResponse.success(res, {
      message: "Login successful",
      data: {
        accessToken,
        user: toAuthUser(refreshed),
        refreshExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  },

  async me(req, res) {
    return ApiResponse.success(res, {
      message: "Current user",
      data: toAuthUser(req.user),
    });
  },

  async refresh(req, res) {
    const token = req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken;
    if (!token) {
      throw new ApiError(HTTP.UNAUTHORIZED, "Refresh token required");
    }

    const decoded = verifyRefreshToken(token);
    const user = await UserModel.findById(decoded.userId);
    if (!user || user.status !== "active") {
      throw new ApiError(HTTP.UNAUTHORIZED, "Invalid refresh token");
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    return ApiResponse.success(res, {
      message: "Token refreshed",
      data: { accessToken },
    });
  },

  async logout(_req, res) {
    res.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return ApiResponse.success(res, {
      message: "Logged out successfully",
      data: null,
    });
  },
};
