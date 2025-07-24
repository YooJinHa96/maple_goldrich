// API 관련 상수
export const API_ENDPOINTS = {
  RECOMMEND: "/api/recommend",
  RESULTS: "/api/results",
  STATISTICS: "/api/statistics",
} as const;

// AI 모델 상수
export const AI_MODELS = {
  CLAUDE: "claude",
  GPT: "gpt",
  BOTH: "both",
} as const;

// 추천 전략 상수
export const STRATEGIES = {
  SAFE: "safe",
  AGGRESSIVE: "aggressive",
  BALANCED: "balanced",
} as const;

// 번호 범위 상수
export const NUMBER_RANGES = {
  MIN: 10000,
  MAX: 99999,
} as const;

// 추천 개수 제한
export const RECOMMENDATION_LIMITS = {
  MIN: 1,
  MAX: 10,
  DEFAULT: 5,
} as const;

// 페이지네이션 상수
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// 캐시 TTL (초)
export const CACHE_TTL = {
  STATISTICS: 3600, // 1시간
  POPULAR_NUMBERS: 1800, // 30분
  RECOMMENDATION: 300, // 5분
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  INVALID_COUNT: "추천 개수는 1-10 사이여야 합니다.",
  INVALID_MODEL: "유효하지 않은 AI 모델입니다.",
  INVALID_STRATEGY: "유효하지 않은 전략입니다.",
  API_ERROR: "API 호출 중 오류가 발생했습니다.",
  VALIDATION_ERROR: "입력 데이터가 유효하지 않습니다.",
} as const;

// 성공 메시지
export const SUCCESS_MESSAGES = {
  RECOMMENDATION_CREATED: "추천이 성공적으로 생성되었습니다.",
  RESULT_SAVED: "결과가 성공적으로 저장되었습니다.",
} as const;

// UI 관련 상수
export const UI = {
  LOADING_DELAY: 1000, // 로딩 표시 지연 시간 (ms)
  DEBOUNCE_DELAY: 300, // 디바운스 지연 시간 (ms)
  TOAST_DURATION: 5000, // 토스트 표시 시간 (ms)
} as const;
