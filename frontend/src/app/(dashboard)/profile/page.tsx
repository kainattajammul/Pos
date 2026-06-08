import type { Metadata } from "next";
import { MyProfilePage } from "@/components/profile/my-profile-page";

export const metadata: Metadata = {
  title: "My Profile | Repair Management System",
  description: "View your account details, work status, commission summary, and security settings",
};

export default function ProfileRoutePage() {
  return <MyProfilePage />;
}
