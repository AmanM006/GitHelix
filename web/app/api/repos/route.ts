import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // <--- IMPORT FROM LIB NOW
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  const session = await getServerSession(authOptions);

  // TypeScript now knows 'accessToken' exists because of Step 3
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await axios.get("https://api.github.com/user/repos?sort=updated&per_page=100", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const repos = response.data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
    }));

    return NextResponse.json({ repos });
  } catch (error: any) {
    console.error("GitHub API Error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 });
  }
}