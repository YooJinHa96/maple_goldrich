"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  AI_MODELS,
  STRATEGIES,
  RECOMMENDATION_LIMITS,
} from "@/lib/utils/constants";
import { formatNumber } from "@/lib/utils/helpers";

interface RecommendationResult {
  recommendedNumbers: number[];
  analysis: string;
  confidence: number;
  aiModel: string;
  strategy: string;
}

export default function Home() {
  const [count, setCount] = useState(RECOMMENDATION_LIMITS.DEFAULT);
  const [aiModel, setAiModel] = useState(AI_MODELS.CLAUDE);
  const [strategy, setStrategy] = useState(STRATEGIES.BALANCED);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          count,
          aiModel,
          strategy,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "추천 생성에 실패했습니다");
      }

      setResult(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🍁 골드리치의 비밀금고 번호 추천
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AI 분석을 통해 메이플스토리 골드리치의 비밀금고 이벤트에서 당첨될
            가능성이 높은 번호를 추천해드립니다
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 추천 폼 */}
          <Card>
            <CardHeader>
              <CardTitle>번호 추천</CardTitle>
              <CardDescription>
                AI 모델과 전략을 선택하여 번호를 추천받으세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 추천 개수 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    추천 개수
                  </label>
                  <Input
                    type="number"
                    min={RECOMMENDATION_LIMITS.MIN}
                    max={RECOMMENDATION_LIMITS.MAX}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {RECOMMENDATION_LIMITS.MIN}~{RECOMMENDATION_LIMITS.MAX}개
                  </p>
                </div>

                {/* AI 모델 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI 모델
                  </label>
                  <Select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full"
                  >
                    <option value={AI_MODELS.CLAUDE}>Claude (Anthropic)</option>
                    <option value={AI_MODELS.GPT}>GPT (OpenAI)</option>
                    <option value={AI_MODELS.BOTH}>Both (Claude + GPT)</option>
                  </Select>
                </div>

                {/* 전략 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    추천 전략
                  </label>
                  <Select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    className="w-full"
                  >
                    <option value={STRATEGIES.SAFE}>안전 전략</option>
                    <option value={STRATEGIES.BALANCED}>균형 전략</option>
                    <option value={STRATEGIES.AGGRESSIVE}>공격적 전략</option>
                  </Select>
                </div>

                {/* 제출 버튼 */}
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "추천 생성 중..." : "추천 받기"}
                </Button>

                {/* 에러 메시지 */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* 추천 결과 */}
          <Card>
            <CardHeader>
              <CardTitle>추천 결과</CardTitle>
              <CardDescription>
                AI가 분석한 번호와 추천 이유를 s
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-6">
                  {/* 추천 번호들 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">추천 번호</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {result.recommendedNumbers.map((number, index) => (
                        <div
                          key={index}
                          className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center"
                        >
                          <span className="text-lg font-mono font-bold text-blue-900">
                            {formatNumber(number)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 분석 결과 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">AI 분석</h3>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {result.analysis}
                      </p>
                    </div>
                  </div>

                  {/* 메타 정보 */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">AI 모델:</span>
                      <span className="ml-2 font-medium">
                        {result.aiModel === "claude"
                          ? "Claude"
                          : result.aiModel === "gpt"
                          ? "GPT"
                          : "Claude + GPT"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">전략:</span>
                      <span className="ml-2 font-medium">
                        {result.strategy === "safe"
                          ? "안전"
                          : result.strategy === "balanced"
                          ? "균형"
                          : "공격적"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">신뢰도:</span>
                      <span className="ml-2 font-medium">
                        {(result.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🎯</div>
                  <p className="text-gray-500">
                    왼쪽에서 설정을 완료하고 추천을 받아보세요
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* 기능 소개 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 mt-12">
          <Card className="text-center p-6">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI 분석</h3>
            <p className="text-gray-600">
              Claude와 GPT의 고급 AI가 과거 데이터를 분석하여 최적의 번호를
              추천합니다
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-semibold mb-2">실시간 통계</h3>
            <p className="text-gray-600">
              최신 당첨 결과와 인기 번호를 실시간으로 확인할 수 있습니다
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">전략 선택</h3>
            <p className="text-gray-600">
              안전, 공격적, 균형 전략 중 원하는 스타일을 선택하세요
            </p>
          </Card>
        </div>

        {/* 주의사항 */}
        <div className="mt-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="text-yellow-500 text-xl">⚠️</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">주의사항</h3>
                  <p className="text-sm text-gray-600">
                    이 서비스는 AI 분석을 통한 추천일 뿐이며, 당첨을 보장하지
                    않습니다. 도박 중독 예방을 위해 적절한 금액으로 즐거운
                    마음으로 참여해주세요.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
