import type { NextRequest } from "next/server";

import { forwardAuthenticated, invalidId, uuidParam } from "@/server/lib/forward-authenticated";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const id = uuidParam.safeParse((await params).id);
  if (!id.success) return invalidId();
  return forwardAuthenticated(request, `/users/me/addresses/${id.data}`, { method: "PATCH" });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const id = uuidParam.safeParse((await params).id);
  if (!id.success) return invalidId();
  return forwardAuthenticated(request, `/users/me/addresses/${id.data}`, { method: "DELETE" });
}
