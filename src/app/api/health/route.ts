import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/api/v1/health`, {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { status: "unhealthy", backend: "unreachable" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ status: "healthy", backend: data });
  } catch {
    return NextResponse.json(
      { status: "unhealthy", backend: "unreachable" },
      { status: 502 }
    );
  }
}
