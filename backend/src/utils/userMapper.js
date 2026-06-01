import { roleNameFromId } from "../constants/roles.js";

/** Minimal payload after user create/update (no password). */
export function toCreatedUserResponse(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  };
}

export const toUpdatedUserResponse = toCreatedUserResponse;

/** Never expose password_hash in API responses. */
export function toPublicUser(user) {
  return {
    id: String(user.id),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    accessPin: user.accessPin ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
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
