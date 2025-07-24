// 데이터베이스 테이블 타입 정의

export interface WinningResult {
  id: number;
  date: string;
  winning_numbers: number[];
  total_participants?: number | null;
  created_at: string;
  updated_at: string;
}

export interface RecommendationHistory {
  id: number;
  user_session_id: string;
  model_used: string;
  strategy_used: string;
  recommended_numbers: number[];
  confidence_score: number;
  created_at: string;
}

export interface PopularNumber {
  id: number;
  number: number;
  frequency: number;
  last_appeared: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      winning_results: {
        Row: WinningResult;
        Insert: Omit<WinningResult, "id" | "createdAt" | "updatedAt">;
        Update: Partial<Omit<WinningResult, "id" | "createdAt" | "updatedAt">>;
      };
      recommendation_history: {
        Row: RecommendationHistory;
        Insert: Omit<RecommendationHistory, "id" | "createdAt">;
        Update: Partial<Omit<RecommendationHistory, "id" | "createdAt">>;
      };
      popular_numbers: {
        Row: PopularNumber;
        Insert: Omit<PopularNumber, "id" | "createdAt" | "updatedAt">;
        Update: Partial<Omit<PopularNumber, "id" | "createdAt" | "updatedAt">>;
      };
    };
  };
}
