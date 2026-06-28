import { NextRequest, NextResponse } from "next/server";

const BACKEND = (process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL)!;

async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const search = req.nextUrl.search;
  const url = `${BACKEND}${path}${search}`;

  console.log(`[proxy] BACKEND=${BACKEND}`);
  console.log(`[proxy] ${req.method} → ${url}`);

  const headers = new Headers();
  req.headers.forEach((v, k) => {
    if (!["host", "connection"].includes(k)) headers.set(k, v);
  });

  const body =
    req.method !== "GET" && req.method !== "HEAD"
      ? await req.arrayBuffer()
      : undefined;

  try {
    const res = await fetch(url, {
      method: req.method,
      headers,
      body: body ?? null,
    });

    console.log(`[proxy] response status=${res.status}`);

    const resHeaders = new Headers();
    res.headers.forEach((v, k) => {
      if (k !== "transfer-encoding") resHeaders.set(k, v);
    });

    return new NextResponse(res.body, {
      status: res.status,
      headers: resHeaders,
    });
  } catch (err) {
    console.error(`[proxy] fetch failed:`, err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
