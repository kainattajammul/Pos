/** Role from GET/POST /roles */
export interface ApiRole {
  id: number;
  shopId: number;
  name: string;
  createdAt?: string;
}

/** Row model for User Management → Roles table */
export interface RoleTableRow {
  id: number;
  roleName: string;
  shopId: number | null;
  description: string | null;
  status: string;
  createdAt: string;
}

export interface CreateRolePayload {
  shopId: number;
  name: string;
}

export interface UpdateRolePayload {
  name?: string;
  shopId?: number;
}

export interface RoleMutationResult {
  id: number;
  shopId: number;
  name: string;
}
