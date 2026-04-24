import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { Role } from "./constants";

export async function requireAuth() {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return session;
}

export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth();
  const userRole = session.user?.role;

  if (!userRole || !allowedRoles.includes(userRole)) {
    redirect("/dashboard");
  }

  return session;
}
