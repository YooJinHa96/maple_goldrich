import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
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

export async function getGPTRecommendation(
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

응답은 반드시 다음 JSON 형식으로만 제공해주세요:
{
  "recommendedNumbers": [번호1, 번호2, ...],
  "analysis": "추천 이유 분석",
  "confidence": 0.0-1.0 사이의 신뢰도
}

번호는 5자리 숫자여야 하며, 10000-99999 범위 내에서 선택해주세요.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "당신은 메이플스토리 골드리치의 비밀금고 이벤트 번호 추천 전문가입니다. 모든 응답은 JSON 형식으로만 제공합니다.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from GPT");
    }

    const parsed = JSON.parse(content);
    return {
      recommendedNumbers: parsed.recommendedNumbers,
      analysis: parsed.analysis,
      confidence: parsed.confidence,
    };
  } catch (error) {
    console.error("GPT API error:", error);
    throw new Error("Failed to get recommendation from GPT");
  }
}
