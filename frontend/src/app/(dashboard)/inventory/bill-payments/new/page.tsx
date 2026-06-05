"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Quick-create from nav opens the list page with add form — redirect preserves nav href. */
export default function NewBillPaymentRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/inventory/bill-payments?add=1");
  }, [router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#6B7280]">
      Opening add bill payment form…
    </div>
  );
}
