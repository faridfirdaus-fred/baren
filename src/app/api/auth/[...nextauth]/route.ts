import type { NextRequest } from "next/server";

import { authHandlers } from "@/auth";

export const dynamic = "force-dynamic";

async function getHandlers() {
  return authHandlers();
}

export async function GET(request: NextRequest) {
  const { GET: handler } = await getHandlers();
  return handler(request);
}

export async function POST(request: NextRequest) {
  const { POST: handler } = await getHandlers();
  return handler(request);
}
