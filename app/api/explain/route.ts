import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();

  const fastApiRes = await fetch("http://127.0.0.1:8000/explain", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await fastApiRes.json();

  return NextResponse.json(json);
}
