import { z } from "zod";
import {
  AI_MODELS,
  STRATEGIES,
  RECOMMENDATION_LIMITS,
  NUMBER_RANGES,
} from "./constants";

// 추천 요청 스키마
export const recommendationRequestSchema = z.object({
  count: z
    .number()
    .int()
    .min(RECOMMENDATION_LIMITS.MIN)
    .max(RECOMMENDATION_LIMITS.MAX),
  aiModel: z.enum([AI_MODELS.CLAUDE, AI_MODELS.GPT, AI_MODELS.BOTH]),
  strategy: z
    .enum([STRATEGIES.SAFE, STRATEGIES.AGGRESSIVE, STRATEGIES.BALANCED])
    .optional(),
});

// 당첨 결과 생성 스키마
export const createResultRequestSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)"),
  winningNumbers: z
    .array(z.number().int().min(NUMBER_RANGES.MIN).max(NUMBER_RANGES.MAX))
    .min(1, "당첨 번호는 최소 1개 이상이어야 합니다"),
  totalParticipants: z.number().int().positive().optional(),
});

// 결과 조회 쿼리 스키마
export const getResultsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

// 추천 요청 검증
export function validateRecommendationRequest(data: any) {
  try {
    return {
      success: true,
      data: recommendationRequestSchema.parse(data),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      errors: [{ field: "unknown", message: "알 수 없는 오류가 발생했습니다" }],
    };
  }
}

// 당첨 결과 생성 검증
export function validateCreateResultRequest(data: any) {
  try {
    return {
      success: true,
      data: createResultRequestSchema.parse(data),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      errors: [{ field: "unknown", message: "알 수 없는 오류가 발생했습니다" }],
    };
  }
}

// 결과 조회 쿼리 검증
export function validateGetResultsQuery(query: any) {
  try {
    return {
      success: true,
      data: getResultsQuerySchema.parse(query),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      errors: [{ field: "unknown", message: "알 수 없는 오류가 발생했습니다" }],
    };
  }
}

// 숫자 배열 검증
export function validateNumberArray(numbers: any[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(numbers)) {
    errors.push("번호는 배열 형태여야 합니다");
    return { isValid: false, errors };
  }

  if (numbers.length === 0) {
    errors.push("번호는 최소 1개 이상이어야 합니다");
    return { isValid: false, errors };
  }

  numbers.forEach((num, index) => {
    if (!Number.isInteger(num)) {
      errors.push(`인덱스 ${index}: 정수가 아닙니다`);
    } else if (num < NUMBER_RANGES.MIN || num > NUMBER_RANGES.MAX) {
      errors.push(
        `인덱스 ${index}: 번호는 ${NUMBER_RANGES.MIN}에서 ${NUMBER_RANGES.MAX} 사이여야 합니다`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// 날짜 검증
export function validateDate(dateString: string): {
  isValid: boolean;
  error?: string;
} {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return {
      isValid: false,
      error: "날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)",
    };
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: "유효하지 않은 날짜입니다",
    };
  }

  const today = new Date();
  if (date > today) {
    return {
      isValid: false,
      error: "미래 날짜는 입력할 수 없습니다",
    };
  }

  return { isValid: true };
}

// API 키 검증
export function validateApiKey(apiKey: string | undefined): boolean {
  return apiKey === process.env.ADMIN_API_KEY;
}

// 검증 결과 타입
export interface ValidationResult {
  success: boolean;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  data?: any;
}

// 검증 에러 타입
export interface ValidationError {
  field: string;
  message: string;
}
