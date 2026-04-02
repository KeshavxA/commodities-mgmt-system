"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    router.replace(user?.role === "Manager" ? "/dashboard" : "/commodities");
  }, [isAuthenticated, user, router]);

  return null;
}
