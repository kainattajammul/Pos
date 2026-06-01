/** Public API shape for sales commission agents. */
export function toPublicSalesCommissionAgent(agent) {
  const percent = agent.salesCommissionPercent;
  return {
    id: agent.id,
    name: agent.name,
    email: agent.email ?? null,
    contactNumber: agent.contactNumber ?? null,
    address: agent.address ?? null,
    salesCommissionPercent: percent != null ? Number(percent) : null,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
  };
}
