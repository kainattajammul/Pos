"use client";

import { useEffect } from "react";
import { readSession } from "@/lib/auth-session";
import { useAppDispatch } from "@/store/hooks";
import { setHydrated, setUser } from "@/store/auth-slice";

export function AuthHydrator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const session = readSession();
    if (session?.user) {
      dispatch(setUser(session.user));
    }
    dispatch(setHydrated(true));
  }, [dispatch]);

  return null;
}
