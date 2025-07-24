import { NextRequest, NextResponse } from "next/server";
import { getClaudeRecommendation } from "@/lib/ai/claude";
import { getGPTRecommendation } from "@/lib/ai/openai";
import { getStatistics } from "@/lib/supabase/queries";
import { saveRecommendation } from "@/lib/supabase/queries";
import { validateRecommendationRequest } from "@/lib/utils/validation";
import { generateSessionId } from "@/lib/utils/helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 입력 검증
    const validation = validateRecommendationRequest(body);
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

    const { count, aiModel, strategy = "balanced" } = validation.data;

    // 통계 데이터 조회
    const stats = await getStatistics();

    // AI 추천 요청 데이터 준비
    const aiRequest = {
      count,
      strategy,
      recentWinningNumbers: stats.recentWinningNumbers,
      totalResults: stats.totalResults,
      averageWinningNumber: stats.averageWinningNumber,
    };

    let recommendation;
    let modelName;

    // AI 모델에 따른 추천 생성
    if (aiModel === "claude") {
      recommendation = await getClaudeRecommendation(aiRequest);
      modelName = "claude";
    } else if (aiModel === "gpt") {
      recommendation = await getGPTRecommendation(aiRequest);
      modelName = "gpt";
    } else if (aiModel === "both") {
      // 두 모델 모두 사용하여 평균 계산
      const [claudeResult, gptResult] = await Promise.all([
        getClaudeRecommendation(aiRequest),
        getGPTRecommendation(aiRequest),
      ]);

      // 번호 합치기 (중복 제거)
      const allNumbers = [
        ...claudeResult.recommendedNumbers,
        ...gptResult.recommendedNumbers,
      ];
      const uniqueNumbers = [...new Set(allNumbers)];

      // 요청된 개수만큼 선택
      const selectedNumbers = uniqueNumbers.slice(0, count);

      // 부족한 경우 랜덤 번호로 채우기
      while (selectedNumbers.length < count) {
        const randomNum = Math.floor(Math.random() * 90000) + 10000;
        if (!selectedNumbers.includes(randomNum)) {
          selectedNumbers.push(randomNum);
        }
      }

      recommendation = {
        recommendedNumbers: selectedNumbers,
        analysis: `Claude: ${claudeResult.analysis}\n\nGPT: ${gptResult.analysis}`,
        confidence: (claudeResult.confidence + gptResult.confidence) / 2,
      };
      modelName = "both";
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid AI model",
        },
        { status: 400 }
      );
    }

    // 추천 히스토리 저장
    const sessionId = generateSessionId();
    await saveRecommendation({
      user_session_id: sessionId,
      recommended_numbers: recommendation.recommendedNumbers,
      ai_model: modelName,
      count_requested: count,
      analysis_reason: recommendation.analysis,
    });

    return NextResponse.json({
      success: true,
      data: {
        recommendedNumbers: recommendation.recommendedNumbers,
        analysis: recommendation.analysis,
        confidence: recommendation.confidence,
        aiModel: modelName,
        strategy,
      },
    });
  } catch (error) {
    console.error("Recommendation API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate recommendation",
      },
      { status: 500 }
    );
  }
}
