import { NUMBER_RANGES, RECOMMENDATION_LIMITS } from "./constants";

// 숫자 유효성 검사
export function isValidNumber(num: number): boolean {
  return (
    Number.isInteger(num) &&
    num >= NUMBER_RANGES.MIN &&
    num <= NUMBER_RANGES.MAX
  );
}

// 추천 개수 유효성 검사
export function isValidRecommendationCount(count: number): boolean {
  return (
    Number.isInteger(count) &&
    count >= RECOMMENDATION_LIMITS.MIN &&
    count <= RECOMMENDATION_LIMITS.MAX
  );
}

// 배열에서 중복 제거
export function removeDuplicates<T>(array: T[]): T[] {
  return [...new Set(array)];
}

// 배열 셔플
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 랜덤 숫자 생성
export function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 5자리 랜덤 번호 생성
export function generateRandomFiveDigitNumber(): number {
  return generateRandomNumber(NUMBER_RANGES.MIN, NUMBER_RANGES.MAX);
}

// 날짜 포맷팅
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// 시간 포맷팅
export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 숫자 천 단위 콤마 포맷팅
export function formatNumber(num: number): string {
  return num.toLocaleString("ko-KR");
}

// 배열을 청크로 분할
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// 객체에서 특정 키만 추출
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

// 객체에서 특정 키 제외
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
}

// 딜레이 함수
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 디바운스 함수
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 쿼리 파라미터 파싱
export function parseQueryParams(query: string): Record<string, string> {
  const params = new URLSearchParams(query);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

// 쿼리 파라미터 생성
export function buildQueryParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}

// UUID 생성 (간단한 버전)
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 세션 ID 생성
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
