"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/** Deep-link into repairs POS with a device + repair service pre-selected. */
export default function BookRepairPage() {
  const router = useRouter();
  const params = useParams();
  const deviceId = params.deviceId;
  const repairTypeId = params.repairTypeId;

  useEffect(() => {
    if (!deviceId || !repairTypeId) {
      router.replace("/repairs");
      return;
    }
    router.replace(`/repairs?deviceId=${deviceId}&repairTypeId=${repairTypeId}`);
  }, [deviceId, repairTypeId, router]);

  return null;
}
