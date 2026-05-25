import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditUserPageView } from "@/components/users/edit-user-page-view";

export const metadata: Metadata = {
  title: "Edit user | User Management",
  description: "Update an existing system user",
};

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isFinite(userId) || userId <= 0) {
    notFound();
  }

  return <EditUserPageView userId={userId} />;
}
