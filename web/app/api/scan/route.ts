// web/app/api/scan/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import axios from "axios";
import { authOptions } from "@/lib/auth"; // Import from the new lib file

export async function POST(req: Request) {
  // 1. Pass authOptions here. Crucial fix.
  const session = await getServerSession(authOptions);
  
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { repo_full_name } = body;

    console.log(`[Next.js] Forwarding scan request for: ${repo_full_name}`);

    // Call Python
    const pythonResponse = await axios.post("http://127.0.0.1:8000/scan", {
      repo_name: repo_full_name,
      access_token: (session as any).accessToken
    });

    return NextResponse.json(pythonResponse.data);

  } catch (error: any) {
    console.error("Connection Failed:", error.message);
    return NextResponse.json({ error: "Failed to connect to AI Engine" }, { status: 500 });
  }
}