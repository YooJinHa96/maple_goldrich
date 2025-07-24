import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import {
  validateGetResultsQuery,
  validateCreateResultRequest,
  validateApiKey,
} from "@/lib/utils/validation";

// GET: 당첨 결과 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    // 쿼리 파라미터 검증
    const validation = validateGetResultsQuery(query);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const { page, limit, startDate, endDate } = validation.data;

    // 쿼리 빌더 시작
    let queryBuilder = supabase
      .from("winning_results")
      .select("*", { count: "exact" });

    // 날짜 필터 적용
    if (startDate) {
      queryBuilder = queryBuilder.gte("date", startDate);
    }
    if (endDate) {
      queryBuilder = queryBuilder.lte("date", endDate);
    }

    // 페이지네이션 적용
    const offset = (page - 1) * limit;
    queryBuilder = queryBuilder
      .order("date", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: results, error, count } = await queryBuilder;

    if (error) {
      console.error("Error fetching results:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch results",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        results: results || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Results GET API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// POST: 당첨 결과 생성 (관리자용)
export async function POST(request: NextRequest) {
  try {
    // API 키 검증
    const apiKey = request.headers.get("x-api-key");
    if (!validateApiKey(apiKey)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 입력 데이터 검증
    const validation = validateCreateResultRequest(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const { date, winningNumbers, totalParticipants } = validation.data;

    // 중복 날짜 확인
    const { data: existingResult } = await supabase
      .from("winning_results")
      .select("id")
      .eq("date", date)
      .single();

    if (existingResult) {
      return NextResponse.json(
        {
          success: false,
          error: "Result for this date already exists",
        },
        { status: 409 }
      );
    }

    // 새 결과 삽입
    const { data: newResult, error } = await supabase
      .from("winning_results")
      .insert([
        {
          date,
          winning_numbers: winningNumbers,
          total_participants: totalParticipants,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating result:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create result",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newResult,
    });
  } catch (error) {
    console.error("Results POST API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
