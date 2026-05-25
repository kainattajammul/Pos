import type { Metadata } from "next";
import { AddUserPageView } from "@/components/users/add-user-page-view";

export const metadata: Metadata = {
  title: "Add user | User Management",
  description: "Create a new system user",
};

export default function AddUserPage() {
  return <AddUserPageView />;
}
