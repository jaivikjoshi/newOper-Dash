"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "./utils/UserContext";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useUser();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, loading, router]);

  // Show loading spinner while checking auth status
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e9e2fe]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}
