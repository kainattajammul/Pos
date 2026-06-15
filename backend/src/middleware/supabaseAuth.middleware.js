import { prisma } from "../config/database.js";
import { getSupabaseAdmin } from "../config/supabase.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { env } from "../config/env.js";
import { UserModel } from "../models/user.model.js";
import { ShopMemberModel } from "../models/branch.model.js";
import { ACTIVE_STAFF_STATUSES } from "../constants/branchStaffEnums.js";

/**
 * Resolves authenticated user from app JWT or Supabase Auth JWT.
 */
export async function resolveAuthUser(req) {
  if (req.user?.id) return req.user;

  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new ApiError(HTTP.UNAUTHORIZED, "Access token required");
  }

  const token = header.slice(7);

  try {
    const decoded = verifyAccessToken(token);
    if (decoded.devBypass) {
      return {
        id: decoded.userId,
        fullName: decoded.name ?? "Dev User",
        email: decoded.email,
        devBypass: true,
      };
    }
    const user = await UserModel.findById(decoded.userId);
    if (!user) throw new ApiError(HTTP.UNAUTHORIZED, "Invalid user");
    return user;
  } catch {
    // fall through to Supabase
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new ApiError(HTTP.UNAUTHORIZED, "Invalid or expired token");
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    throw new ApiError(HTTP.UNAUTHORIZED, "Invalid Supabase token");
  }

  const authUser = data.user;
  let user = null;
  if (authUser.id) {
    user = await prisma.user.findFirst({ where: { supabaseAuthId: authUser.id } });
  }
  if (!user && authUser.email) {
    user = await UserModel.findByEmail(authUser.email);
    if (user && !user.supabaseAuthId) {
      user = await UserModel.update(user.id, { supabaseAuthId: authUser.id });
    }
  }

  if (!user) {
    throw new ApiError(HTTP.UNAUTHORIZED, "No application profile linked to this Supabase account");
  }

  return { ...user, supabaseAuthId: authUser.id };
}

export async function buildAuthContext(req, shopId) {
  const user = await resolveAuthUser(req);
  if (user.devBypass || env.devAuthBypass) {
    return {
      authUserId: user.supabaseAuthId ?? null,
      userId: user.id,
      shopId: Number(shopId),
      branchIds: [],
      isShopOwner: true,
      isSuperAdmin: true,
      devBypass: true,
    };
  }

  const membership = await ShopMemberModel.findActiveMembership(user.id, shopId);
  if (!membership) {
    throw new ApiError(HTTP.FORBIDDEN, "You do not have access to this shop");
  }

  const assignments = await prisma.branchStaffAssignment.findMany({
    where: {
      userId: user.id,
      shopId: Number(shopId),
      status: { in: ACTIVE_STAFF_STATUSES },
      archivedAt: null,
    },
    select: { branch: { select: { uuid: true } } },
  });

  const shopPermissions = await ShopMemberModel.userPermissionKeys(user.id, shopId);

  return {
    authUserId: user.supabaseAuthId ?? null,
    userId: user.id,
    shopId: Number(shopId),
    branchIds: assignments.map((a) => a.branch.uuid),
    shopPermissions,
    isShopOwner: shopPermissions.includes("shop.owner"),
    isSuperAdmin: false,
    membership,
  };
}

export async function resolveBranchContext(req) {
  const shopId = Number(req.params.shopId ?? req.shopId);
  const branchUuid = req.params.branchUuid;
  if (!branchUuid) throw new ApiError(HTTP.BAD_REQUEST, "branchUuid required");

  const branch = await prisma.branch.findFirst({
    where: { uuid: branchUuid, shopId, deletedAt: null },
  });
  if (!branch) throw new ApiError(HTTP.NOT_FOUND, "Branch not found");

  if (req.user?.devBypass || env.devAuthBypass) {
    req.authContext = {
      authUserId: null,
      userId: req.user?.id ?? null,
      shopId,
      branchIds: [branch.uuid],
      shopPermissions: null,
      isShopOwner: true,
      isSuperAdmin: true,
      devBypass: true,
    };
  } else {
    const authContext = await buildAuthContext(req, shopId);
    req.authContext = authContext;
  }

  req.shopId = shopId;
  req.branch = branch;
  req.branchId = branch.id;
  req.branchUuid = branch.uuid;
  return { branch, authContext: req.authContext };
}
