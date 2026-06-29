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
    if (!["host", "connection", "accept-encoding"].includes(k)) headers.set(k, v);
  });
  console.log(`[proxy] auth header: ${headers.get("authorization") ?? "MISSING"}`);

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

    // Buffer the full response body so we don't stream a ReadableStream whose
    // content-length may reference the compressed size (before Node fetch
    // auto-decompresses gzip).  Streaming + wrong content-length causes the
    // browser to truncate the body, leaving axios with a raw string instead of
    // a parsed JSON object.
    const responseBody = await res.arrayBuffer();

    const resHeaders = new Headers();
    res.headers.forEach((v, k) => {
      // Strip hop-by-hop and encoding headers; also strip content-length
      // because the buffered (decompressed) body size may differ from the
      // original compressed length.
      if (!["transfer-encoding", "content-encoding", "content-length"].includes(k)) {
        resHeaders.set(k, v);
      }
    });

    // Guarantee content-type so axios always parses JSON correctly.
    if (!resHeaders.has("content-type")) {
      resHeaders.set("content-type", "application/json");
    }

    return new NextResponse(responseBody, {
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
