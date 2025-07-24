import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface RecommendationRequest {
  count: number;
  strategy: "safe" | "aggressive" | "balanced";
  recentWinningNumbers: number[];
  totalResults: number;
  averageWinningNumber: number;
}

export interface RecommendationResponse {
  recommendedNumbers: number[];
  analysis: string;
  confidence: number;
}

export async function getClaudeRecommendation(
  request: RecommendationRequest
): Promise<RecommendationResponse> {
  const strategyDescriptions = {
    safe: "안전한 전략: 과거 당첨 번호의 평균값 근처의 번호들을 추천",
    aggressive: "공격적 전략: 과거 당첨 번호와 다른 패턴의 번호들을 추천",
    balanced: "균형 전략: 과거 데이터를 분석하여 적절히 분산된 번호들을 추천",
  };

  const prompt = `당신은 메이플스토리 골드리치의 비밀금고 이벤트 번호 추천 전문가입니다.

현재 상황:
- 요청된 추천 개수: ${request.count}개
- 선택된 전략: ${strategyDescriptions[request.strategy]}
- 최근 당첨 번호들: ${request.recentWinningNumbers.join(", ")}
- 전체 결과 수: ${request.totalResults}개
- 평균 당첨 번호: ${request.averageWinningNumber}

${request.strategy} 전략에 따라 ${request.count}개의 번호를 추천해주세요.

응답 형식:
{
  "recommendedNumbers": [번호1, 번호2, ...],
  "analysis": "추천 이유 분석",
  "confidence": 0.0-1.0 사이의 신뢰도
}

번호는 5자리 숫자여야 하며, 10000-99999 범위 내에서 선택해주세요.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === "text") {
      const parsed = JSON.parse(content.text);
      return {
        recommendedNumbers: parsed.recommendedNumbers,
        analysis: parsed.analysis,
        confidence: parsed.confidence,
      };
    }

    throw new Error("Invalid response format from Claude");
  } catch (error) {
    console.error("Claude API error:", error);
    throw new Error("Failed to get recommendation from Claude");
  }
}
