import { supabase } from "./client";
import { WinningResult, RecommendationHistory } from "@/types/database";

// 당첨 결과 조회
export async function getWinningResults(limit = 10) {
  const { data, error } = await supabase
    .from("winning_results")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching winning results:", error);
    throw error;
  }

  return data;
}

// 통계 데이터 조회
export async function getStatistics() {
  const { data: results, error: resultsError } = await supabase
    .from("winning_results")
    .select("*");

  if (resultsError) {
    console.error("Error fetching results for statistics:", resultsError);
    throw resultsError;
  }

  if (!results || results.length === 0) {
    return {
      totalResults: 0,
      averageWinningNumber: 0,
      recentWinningNumbers: [],
    };
  }

  // 모든 당첨 번호를 평면화
  const allNumbers = results.flatMap((result) => result.winning_numbers || []);

  // 평균 계산
  const average =
    allNumbers.length > 0
      ? Math.round(
          allNumbers.reduce((sum, num) => sum + num, 0) / allNumbers.length
        )
      : 0;

  // 최근 3회차의 당첨 번호들
  const recentResults = results.slice(0, 3);
  const recentNumbers = recentResults.flatMap(
    (result) => result.winning_numbers || []
  );

  return {
    totalResults: results.length,
    averageWinningNumber: average,
    recentWinningNumbers: recentNumbers.slice(0, 20), // 최대 20개만 반환
  };
}

// 추천 기록 저장
export async function saveRecommendation(
  history: Omit<RecommendationHistory, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from("recommendation_history")
    .insert([history])
    .select();

  if (error) {
    console.error("Error saving recommendation:", error);
    throw error;
  }

  return data?.[0];
}

// 인기 번호 조회
export async function getPopularNumbers(limit = 10) {
  const { data, error } = await supabase
    .from("popular_numbers")
    .select("*")
    .order("frequency", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching popular numbers:", error);
    throw error;
  }

  return data || [];
}
