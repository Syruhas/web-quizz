import { auth } from '@/auth';
import { NextResponse } from "next/server";

export async function requireRole(
  allowedRoles: ("teacher" | "student")[],
  handler: () => Promise<NextResponse>
) {
  const session = await auth();
  
  if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  
  return handler();
}