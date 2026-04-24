"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROLES } from "@/lib/constants";

export default function DefaultRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = (session.user as {role?: string}).role;
      
      switch (role) {
        case ROLES.QUAN_LY:
          router.replace("/dashboard");
          break;
        case ROLES.BEP:
          router.replace("/bep");
          break;
        case ROLES.KE_TOAN:
          router.replace("/ke-toan");
          break;
        default:
          router.replace("/dashboard");
          break;
      }
    } else if (status === "unauthenticated") {
      router.replace("/api/auth/signin");
    }
  }, [session, status, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}
