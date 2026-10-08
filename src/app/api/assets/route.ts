import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "missing key" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, key });
}

export async function DELETE(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "missing key" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, key });
}
