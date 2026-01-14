import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();

  const fastApiRes = await fetch("https://python-code-execution-json-apis.onrender.com/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await fastApiRes.json();

  // ✅ Return FastAPI response AS-IS
  return NextResponse.json(json);
}
