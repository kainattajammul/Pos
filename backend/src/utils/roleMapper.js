/** Public role shape for API responses */
export function toPublicRole(role) {
  return {
    id: role.id,
    shopId: role.shopId,
    name: role.name,
    createdAt: role.createdAt,
  };
}
