export const BRANCH_SETTINGS_REGISTRY = [
  {
    namespace: "security",
    key: "two_factor_required",
    label: "Two-factor authentication required",
    description: "Require 2FA for branch staff access",
    valueType: "BOOLEAN",
    defaultValue: false,
    canInherit: true,
    canOverride: true,
    requiredPermission: "branch_settings.manage_sensitive",
  },
  {
    namespace: "general",
    key: "franchise_owner_display",
    label: "Franchise owner display name",
    description: "Display name for primary franchise owner",
    valueType: "STRING",
    defaultValue: "",
    canInherit: false,
    canOverride: true,
    requiredPermission: "branch_system.manage",
  },
];

export function findSettingDefinition(namespace, key) {
  return BRANCH_SETTINGS_REGISTRY.find((d) => d.namespace === namespace && d.key === key) ?? null;
}

export function listRegistryNamespaces() {
  return [...new Set(BRANCH_SETTINGS_REGISTRY.map((d) => d.namespace))];
}
