import { NextResponse } from "next/server";
import { getStatistics } from "@/lib/supabase/queries";

export async function GET() {
  try {
    const stats = await getStatistics();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Statistics API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch statistics",
      },
      { status: 500 }
    );
  }
}
