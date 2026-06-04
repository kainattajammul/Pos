import type { Metadata } from "next";
import dynamic from "next/dynamic";

const UsersManagementView = dynamic(
  () =>
    import("@/components/users/users-management-view").then(
      (m) => m.UsersManagementView,
    ),
  {
    loading: () => (
      <div className="flex min-h-[320px] items-center justify-center text-sm text-muted-foreground">
        Loading users…
      </div>
    ),
  },
);

export const metadata: Metadata = {
  title: "Users | User Management",
  description: "View and manage system users",
};

export default function UsersPage() {
  return <UsersManagementView />;
}
