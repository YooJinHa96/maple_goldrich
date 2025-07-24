// AI 모델 정보
export interface AIModelInfo {
  name: string;
  maxTokens: number;
  temperature: number;
  costPerRequest: number;
}

// 추천 요청 타입
export interface RecommendationRequest {
  count: number;
  strategy: "safe" | "aggressive" | "balanced";
  recentWinningNumbers: number[];
  totalResults: number;
  averageWinningNumber: number;
}

// 추천 응답 타입
export interface RecommendationResponse {
  recommendedNumbers: number[];
  analysis: string;
  confidence: number;
  modelName: string;
}

// AI 모델 인터페이스
export interface IAIModel {
  generateRecommendation(
    request: RecommendationRequest
  ): Promise<RecommendationResponse>;
  getModelInfo(): AIModelInfo;
}

// 추천 전략 인터페이스
export interface IRecommendationStrategy {
  getNumberRange(): { min: number; max: number };
  getPriority(): "safety" | "probability" | "balanced";
  getName(): string;
  calculateRiskLevel(): number;
}

// AI 서비스 설정
export interface AIServiceConfig {
  claude: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  gpt: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
}

// 추천 히스토리 타입
export interface RecommendationHistory {
  id: number;
  userSessionId: string;
  recommendedNumbers: number[];
  aiModel: string;
  strategy: string;
  analysis: string;
  confidence: number;
  createdAt: string;
}
