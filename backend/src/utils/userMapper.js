import { roleNameFromId } from "../constants/roles.js";

/** Never expose password_hash in API responses. */
export function toPublicUser(user) {
  return {
    id: String(user.id),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    roleId: user.roleId,
    shopId: user.shopId,
    status: user.status,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
  };
}

/** Shape expected by the existing Next.js frontend after login. */
export function toAuthUser(user) {
  return {
    id: String(user.id),
    email: user.email,
    role: roleNameFromId(user.roleId),
    name: user.fullName,
  };
}
