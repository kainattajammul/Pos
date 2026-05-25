import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditRolePageView } from "@/components/roles/edit-role-page-view";

export const metadata: Metadata = {
  title: "Edit Role | User Management",
  description: "Update role name and permissions",
};

interface EditRolePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  const { id } = await params;
  const roleId = Number(id);
  if (!Number.isFinite(roleId) || roleId <= 0) {
    notFound();
  }

  return <EditRolePageView roleId={roleId} />;
}
