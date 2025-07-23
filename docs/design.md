# 메이플스토리 골드리치의 비밀금고 번호 추천 웹사이트 - 설계 문서

## 📋 설계 개요

### 프로젝트 목적

골드리치의 비밀금고 이벤트에서 당첨될 가능성이 높은 번호를 AI 분석을 통해 추천해주는 웹사이트

### 핵심 기능

1. **데이터 관리**: 당첨 결과 데이터 수집 및 관리
2. **AI 추천**: Claude/GPT를 활용한 번호 추천
3. **통계 분석**: 당첨 통계 및 인기 번호 분석
4. **사용자 인터페이스**: 모던한 UI/UX

## 🏗️ 시스템 아키텍처

### 전체 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase      │    │   AI Services   │    │   Monitoring    │
│   (Database)    │    │   (Claude/GPT)  │    │   (Vercel)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Clean Architecture 적용

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Pages     │  │ Components  │  │   Hooks     │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Business Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Services   │  │   UseCases  │  │  Entities   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Repositories│  │   External  │  │   Database  │          │
│  │             │  │   APIs      │  │             │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## 📁 프로젝트 구조

### 디렉토리 구조

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── results/              # 당첨 결과 API
│   │   ├── recommend/            # AI 추천 API
│   │   └── statistics/           # 통계 API
│   ├── globals.css               # 전역 스타일
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 메인 페이지
├── components/                   # UI 컴포넌트
│   ├── ui/                       # Shadcn UI 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── select.tsx
│   └── features/                 # 도메인별 컴포넌트
│       ├── recommendation/       # 추천 관련 컴포넌트
│       │   ├── RecommendationForm.tsx
│       │   ├── RecommendationResult.tsx
│       │   └── RecommendationHistory.tsx
│       ├── statistics/           # 통계 관련 컴포넌트
│       │   ├── StatisticsChart.tsx
│       │   └── PopularNumbers.tsx
│       └── admin/                # 관리자 컴포넌트
│           └── DataInputForm.tsx
├── lib/                          # 유틸리티 및 설정
│   ├── supabase/                 # Supabase 클라이언트
│   │   ├── client.ts
│   │   ├── types.ts
│   │   └── queries.ts
│   ├── ai/                       # AI API 클라이언트
│   │   ├── claude.ts
│   │   ├── openai.ts
│   │   └── types.ts
│   └── utils/                    # 공통 유틸리티
│       ├── constants.ts
│       ├── helpers.ts
│       └── validation.ts
├── types/                        # TypeScript 타입 정의
│   ├── database.ts               # 데이터베이스 타입
│   ├── api.ts                    # API 타입
│   └── common.ts                 # 공통 타입
├── hooks/                        # 커스텀 React 훅
│   ├── useRecommendation.ts
│   ├── useStatistics.ts
│   └── useLocalStorage.ts
└── tests/                        # 테스트 파일
    ├── components/
    ├── api/
    └── utils/
```

## 🗄️ 데이터베이스 설계

### 테이블 스키마

#### 1. winning_results (당첨 결과)

```sql
CREATE TABLE winning_results (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  winning_numbers INTEGER[] NOT NULL,
  total_participants INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_winning_results_date ON winning_results(date);
CREATE INDEX idx_winning_results_created_at ON winning_results(created_at);
```

#### 2. recommendation_history (추천 히스토리)

```sql
CREATE TABLE recommendation_history (
  id SERIAL PRIMARY KEY,
  user_session_id VARCHAR(255) NOT NULL,
  recommended_numbers INTEGER[] NOT NULL,
  ai_model VARCHAR(50) NOT NULL,
  count_requested INTEGER NOT NULL,
  analysis_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_recommendation_history_session ON recommendation_history(user_session_id);
CREATE INDEX idx_recommendation_history_created_at ON recommendation_history(created_at);
```

#### 3. popular_numbers (인기 번호 통계)

```sql
CREATE TABLE popular_numbers (
  id SERIAL PRIMARY KEY,
  number INTEGER NOT NULL,
  frequency INTEGER DEFAULT 0,
  last_appeared DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_popular_numbers_number ON popular_numbers(number);
CREATE INDEX idx_popular_numbers_frequency ON popular_numbers(frequency);
```

### RLS (Row Level Security) 설정

```sql
-- winning_results 테이블
ALTER TABLE winning_results ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Allow read access to winning_results" ON winning_results
  FOR SELECT USING (true);

-- 관리자만 쓰기 가능 (API 키로 제어)
CREATE POLICY "Allow insert access to winning_results" ON winning_results
  FOR INSERT WITH CHECK (true);

-- recommendation_history 테이블
ALTER TABLE recommendation_history ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능
CREATE POLICY "Allow all access to recommendation_history" ON recommendation_history
  FOR ALL USING (true);
```

## 🔌 API 설계

### 1. 당첨 결과 API

#### GET /api/results

```typescript
// 응답 타입
interface GetResultsResponse {
  success: boolean;
  data: {
    results: WinningResult[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}

// 쿼리 파라미터
interface GetResultsQuery {
  page?: number; // 기본값: 1
  limit?: number; // 기본값: 10
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}
```

#### POST /api/results

```typescript
// 요청 타입
interface CreateResultRequest {
  date: string; // YYYY-MM-DD
  winningNumbers: number[];
  totalParticipants?: number;
}

// 응답 타입
interface CreateResultResponse {
  success: boolean;
  data: WinningResult;
  error?: string;
}
```

### 2. AI 추천 API

#### POST /api/recommend

```typescript
// 요청 타입
interface RecommendRequest {
  count: number; // 1-10
  aiModel: "claude" | "gpt" | "both";
  strategy?: "safe" | "aggressive" | "balanced";
}

// 응답 타입
interface RecommendResponse {
  success: boolean;
  data: {
    recommendedNumbers: number[];
    analysis: string;
    confidence: number;
    aiModel: string;
    strategy: string;
  };
  error?: string;
}
```

### 3. 통계 API

#### GET /api/statistics

```typescript
// 응답 타입
interface StatisticsResponse {
  success: boolean;
  data: {
    totalResults: number;
    dateRange: {
      start: string;
      end: string;
    };
    popularNumbers: PopularNumber[];
    recentWinningNumbers: number[];
    averageWinningNumber: number;
  };
  error?: string;
}
```

## 🤖 AI 서비스 설계 (SOLID 원칙 적용)

### 1. S - Single Responsibility Principle (단일 책임 원칙)

#### AI 모델 인터페이스 (단일 책임: AI 추천 생성)

```typescript
// 각 AI 모델은 추천 생성이라는 단일 책임만 가짐
interface IAIModel {
  generateRecommendation(
    request: RecommendationRequest
  ): Promise<RecommendationResponse>;
  getModelInfo(): AIModelInfo;
}

interface RecommendationRequest {
  count: number;
  strategy: RecommendationStrategy;
  historicalData: WinningResult[];
}

interface RecommendationResponse {
  recommendedNumbers: number[];
  analysis: string;
  confidence: number;
  modelName: string;
}

interface AIModelInfo {
  name: string;
  maxTokens: number;
  temperature: number;
  costPerRequest: number;
}
```

#### 추천 전략 인터페이스 (단일 책임: 번호 범위 및 우선순위 결정)

```typescript
// 각 전략은 번호 범위와 우선순위 결정이라는 단일 책임만 가짐
interface IRecommendationStrategy {
  getNumberRange(): { min: number; max: number };
  getPriority(): "safety" | "probability" | "balanced";
  getName(): string;
  calculateRiskLevel(): number;
}
```

### 2. O - Open/Closed Principle (개방-폐쇄 원칙)

#### 확장 가능한 AI 모델 구조

```typescript
// 새로운 AI 모델 추가 시 기존 코드 수정 없이 확장 가능
abstract class BaseAIModel implements IAIModel {
  abstract generateRecommendation(
    request: RecommendationRequest
  ): Promise<RecommendationResponse>;
  abstract getModelInfo(): AIModelInfo;

  // 공통 로직은 추상 클래스에서 제공
  protected validateRequest(request: RecommendationRequest): void {
    if (request.count < 1 || request.count > 10) {
      throw new Error("Invalid recommendation count");
    }
  }

  protected formatResponse(
    numbers: number[],
    analysis: string,
    confidence: number
  ): RecommendationResponse {
    return {
      recommendedNumbers: numbers,
      analysis,
      confidence,
      modelName: this.getModelInfo().name,
    };
  }
}

// 새로운 AI 모델 추가 시 기존 코드 수정 없이 확장
class ClaudeAIModel extends BaseAIModel {
  async generateRecommendation(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    this.validateRequest(request);
    // Claude API 호출 로직
    const response = await this.callClaudeAPI(request);
    return this.formatResponse(
      response.numbers,
      response.analysis,
      response.confidence
    );
  }

  getModelInfo(): AIModelInfo {
    return {
      name: "claude",
      maxTokens: 1000,
      temperature: 0.7,
      costPerRequest: 0.01,
    };
  }

  private async callClaudeAPI(request: RecommendationRequest) {
    // Claude API 호출 구현
  }
}

class GPTAIModel extends BaseAIModel {
  async generateRecommendation(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    this.validateRequest(request);
    // GPT API 호출 로직
    const response = await this.callGPTAPI(request);
    return this.formatResponse(
      response.numbers,
      response.analysis,
      response.confidence
    );
  }

  getModelInfo(): AIModelInfo {
    return {
      name: "gpt",
      maxTokens: 1000,
      temperature: 0.7,
      costPerRequest: 0.02,
    };
  }

  private async callGPTAPI(request: RecommendationRequest) {
    // GPT API 호출 구현
  }
}
```

#### 확장 가능한 추천 전략 구조

```typescript
// 새로운 전략 추가 시 기존 코드 수정 없이 확장 가능
abstract class BaseRecommendationStrategy implements IRecommendationStrategy {
  abstract getNumberRange(): { min: number; max: number };
  abstract getPriority(): "safety" | "probability" | "balanced";
  abstract getName(): string;

  // 공통 로직
  calculateRiskLevel(): number {
    const range = this.getNumberRange();
    const priority = this.getPriority();

    if (priority === "safety") return 0.2;
    if (priority === "probability") return 0.8;
    return 0.5;
  }
}

class SafeStrategy extends BaseRecommendationStrategy {
  getNumberRange() {
    return { min: 10000, max: 50000 };
  }
  getPriority() {
    return "safety";
  }
  getName() {
    return "safe";
  }
}

class AggressiveStrategy extends BaseRecommendationStrategy {
  getNumberRange() {
    return { min: 1, max: 1000 };
  }
  getPriority() {
    return "probability";
  }
  getName() {
    return "aggressive";
  }
}

class BalancedStrategy extends BaseRecommendationStrategy {
  getNumberRange() {
    return { min: 1000, max: 10000 };
  }
  getPriority() {
    return "balanced";
  }
  getName() {
    return "balanced";
  }
}
```

### 3. L - Liskov Substitution Principle (리스코프 치환 원칙)

#### 치환 가능한 AI 모델 구조

```typescript
// 모든 AI 모델은 동일한 인터페이스를 구현하므로 치환 가능
class AIModelFactory {
  private static models: Map<string, IAIModel> = new Map();

  static registerModel(name: string, model: IAIModel): void {
    this.models.set(name, model);
  }

  static getModel(name: string): IAIModel {
    const model = this.models.get(name);
    if (!model) {
      throw new Error(`AI model '${name}' not found`);
    }
    return model;
  }

  // 모든 모델이 동일한 인터페이스를 구현하므로 치환 가능
  static async generateRecommendationWithAnyModel(
    modelName: string,
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    const model = this.getModel(modelName);
    return await model.generateRecommendation(request);
  }
}

// 사용 예시: 어떤 모델이든 동일한 방식으로 사용 가능
const claudeModel = new ClaudeAIModel();
const gptModel = new GPTAIModel();

AIModelFactory.registerModel("claude", claudeModel);
AIModelFactory.registerModel("gpt", gptModel);

// 치환 가능: claude를 gpt로 바꿔도 동일한 인터페이스 사용
const result1 = await AIModelFactory.generateRecommendationWithAnyModel(
  "claude",
  request
);
const result2 = await AIModelFactory.generateRecommendationWithAnyModel(
  "gpt",
  request
);
```

### 4. I - Interface Segregation Principle (인터페이스 분리 원칙)

#### 클라이언트별 인터페이스 분리

```typescript
// 웹 클라이언트용 인터페이스 (간단한 추천만 필요)
interface IWebRecommendationService {
  getRecommendation(count: number, strategy: string): Promise<number[]>;
}

// 관리자용 인터페이스 (상세 분석 필요)
interface IAdminRecommendationService {
  getRecommendationWithAnalysis(
    request: RecommendationRequest
  ): Promise<RecommendationResponse>;
  getModelUsageStats(): Promise<ModelUsageStats>;
  getCostAnalysis(): Promise<CostAnalysis>;
}

// 모바일 클라이언트용 인터페이스 (제한된 기능)
interface IMobileRecommendationService {
  getQuickRecommendation(): Promise<number[]>;
  getLastRecommendation(): Promise<number[]>;
}

// 각 클라이언트는 필요한 인터페이스만 구현
class WebRecommendationService implements IWebRecommendationService {
  async getRecommendation(count: number, strategy: string): Promise<number[]> {
    const model = AIModelFactory.getModel("claude");
    const response = await model.generateRecommendation({
      count,
      strategy: this.getStrategyByName(strategy),
      historicalData: await this.getHistoricalData(),
    });
    return response.recommendedNumbers;
  }
}

class AdminRecommendationService implements IAdminRecommendationService {
  async getRecommendationWithAnalysis(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    const model = AIModelFactory.getModel(request.aiModel || "claude");
    return await model.generateRecommendation(request);
  }

  async getModelUsageStats(): Promise<ModelUsageStats> {
    // 상세 통계 제공
  }

  async getCostAnalysis(): Promise<CostAnalysis> {
    // 비용 분석 제공
  }
}
```

### 5. D - Dependency Inversion Principle (의존성 역전 원칙)

#### 의존성 역전 구조

```typescript
// 고수준 모듈: 추천 서비스
interface IRecommendationRepository {
  getHistoricalData(): Promise<WinningResult[]>;
  saveRecommendation(recommendation: RecommendationResponse): Promise<void>;
}

interface IAIProvider {
  generateRecommendation(
    request: RecommendationRequest
  ): Promise<RecommendationResponse>;
}

// 고수준 모듈은 추상화에 의존
class RecommendationService {
  constructor(
    private aiProvider: IAIProvider,
    private repository: IRecommendationRepository,
    private strategyProvider: IStrategyProvider
  ) {}

  async generateRecommendation(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    const historicalData = await this.repository.getHistoricalData();
    const strategy = this.strategyProvider.getStrategy(request.strategy);

    const aiRequest: RecommendationRequest = {
      ...request,
      historicalData,
      strategy,
    };

    const response = await this.aiProvider.generateRecommendation(aiRequest);
    await this.repository.saveRecommendation(response);

    return response;
  }
}

// 저수준 모듈: 구체적인 구현
class SupabaseRecommendationRepository implements IRecommendationRepository {
  async getHistoricalData(): Promise<WinningResult[]> {
    // Supabase에서 데이터 조회
  }

  async saveRecommendation(
    recommendation: RecommendationResponse
  ): Promise<void> {
    // Supabase에 추천 결과 저장
  }
}

class ClaudeAIProvider implements IAIProvider {
  async generateRecommendation(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    // Claude API 호출
  }
}

// 의존성 주입을 통한 결합도 감소
const recommendationService = new RecommendationService(
  new ClaudeAIProvider(),
  new SupabaseRecommendationRepository(),
  new StrategyProvider()
);
```

### 6. SOLID 원칙 적용의 이점

#### 확장성

```typescript
// 새로운 AI 모델 추가 (기존 코드 수정 없음)
class GeminiAIModel extends BaseAIModel {
  async generateRecommendation(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    // Gemini API 호출 로직
  }

  getModelInfo(): AIModelInfo {
    return {
      name: "gemini",
      maxTokens: 1000,
      temperature: 0.7,
      costPerRequest: 0.015,
    };
  }
}

// 새로운 전략 추가 (기존 코드 수정 없음)
class ConservativeStrategy extends BaseRecommendationStrategy {
  getNumberRange() {
    return { min: 50000, max: 100000 };
  }
  getPriority() {
    return "safety";
  }
  getName() {
    return "conservative";
  }
}
```

#### 테스트 용이성

```typescript
// 모킹을 통한 단위 테스트
class MockAIProvider implements IAIProvider {
  async generateRecommendation(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    return {
      recommendedNumbers: [12345, 67890],
      analysis: "Mock analysis",
      confidence: 0.8,
      modelName: "mock",
    };
  }
}

// 테스트에서 의존성 주입
const testService = new RecommendationService(
  new MockAIProvider(),
  new MockRepository(),
  new MockStrategyProvider()
);
```

## 🎨 UI/UX 설계

### 디자인 시스템

```typescript
// 색상 팔레트
const colors = {
  primary: {
    50: "#eff6ff",
    500: "#3b82f6",
    900: "#1e3a8a",
  },
  secondary: {
    50: "#f8fafc",
    500: "#64748b",
    900: "#0f172a",
  },
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
};

// 타이포그래피
const typography = {
  fontFamily: {
    sans: ["Inter", "system-ui", "sans-serif"],
    mono: ["JetBrains Mono", "monospace"],
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
  },
};
```

### 컴포넌트 설계 (Clean Architecture + SOLID 원칙 적용)

#### 1. 컴포넌트 계층 구조 (Clean Architecture)

```typescript
// Presentation Layer (UI 컴포넌트)
interface IRecommendationFormProps {
  onSubmit: (data: RecommendRequest) => void;
  isLoading: boolean;
  error?: string;
}

interface IStatisticsChartProps {
  data: PopularNumber[];
  type: "bar" | "line" | "pie";
  title: string;
  onDataPointClick?: (data: any) => void;
}

// Business Layer (비즈니스 로직)
interface IRecommendationUseCase {
  generateRecommendation(
    request: RecommendRequest
  ): Promise<RecommendationResponse>;
  validateRequest(request: RecommendRequest): ValidationResult;
}

interface IStatisticsUseCase {
  getPopularNumbers(): Promise<PopularNumber[]>;
  getWinningTrends(): Promise<TrendData[]>;
  calculateStatistics(): Promise<StatisticsData>;
}

// Data Layer (데이터 접근)
interface IRecommendationRepository {
  saveRecommendation(recommendation: RecommendationResponse): Promise<void>;
  getRecommendationHistory(): Promise<RecommendationHistory[]>;
}

interface IStatisticsRepository {
  getPopularNumbers(): Promise<PopularNumber[]>;
  getWinningResults(): Promise<WinningResult[]>;
}
```

#### 2. S - Single Responsibility Principle (단일 책임 원칙)

##### RecommendationForm 컴포넌트 (단일 책임: 폼 렌더링 및 입력 처리)

```typescript
// UI 렌더링만 담당하는 순수 컴포넌트
interface RecommendationFormProps {
  onSubmit: (data: RecommendRequest) => void;
  isLoading: boolean;
  error?: string;
  validationErrors?: ValidationErrors;
}

// 비즈니스 로직은 별도 훅으로 분리
interface UseRecommendationForm {
  formData: RecommendRequest;
  isLoading: boolean;
  error?: string;
  validationErrors: ValidationErrors;
  handleSubmit: (data: RecommendRequest) => Promise<void>;
  handleInputChange: (field: keyof RecommendRequest, value: any) => void;
  validateForm: () => ValidationResult;
}

// 단일 책임: 폼 상태 관리
const useRecommendationForm = (): UseRecommendationForm => {
  const [formData, setFormData] = useState<RecommendRequest>({
    count: 1,
    aiModel: "claude",
    strategy: "balanced",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const validateForm = useCallback((): ValidationResult => {
    const errors: ValidationErrors = {};

    if (formData.count < 1 || formData.count > 10) {
      errors.count = "추천 개수는 1-10 사이여야 합니다.";
    }

    if (!formData.aiModel) {
      errors.aiModel = "AI 모델을 선택해주세요.";
    }

    setValidationErrors(errors);
    return { isValid: Object.keys(errors).length === 0, errors };
  }, [formData]);

  const handleSubmit = useCallback(
    async (data: RecommendRequest) => {
      const validation = validateForm();
      if (!validation.isValid) return;

      setIsLoading(true);
      setError(undefined);

      try {
        await onSubmit(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "추천 생성에 실패했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [validateForm, onSubmit]
  );

  return {
    formData,
    isLoading,
    error,
    validationErrors,
    handleSubmit,
    handleInputChange: (field, value) =>
      setFormData((prev) => ({ ...prev, [field]: value })),
    validateForm,
  };
};

// 단일 책임: UI 렌더링만 담당
const RecommendationForm: React.FC<RecommendationFormProps> = ({
  onSubmit,
}) => {
  const {
    formData,
    isLoading,
    error,
    validationErrors,
    handleSubmit,
    handleInputChange,
    validateForm,
  } = useRecommendationForm();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(formData);
      }}
    >
      <div className="space-y-4">
        <NumberInput
          label="추천 개수"
          value={formData.count}
          onChange={(value) => handleInputChange("count", value)}
          error={validationErrors.count}
          min={1}
          max={10}
        />

        <SelectInput
          label="AI 모델"
          value={formData.aiModel}
          onChange={(value) => handleInputChange("aiModel", value)}
          error={validationErrors.aiModel}
          options={[
            { value: "claude", label: "Claude" },
            { value: "gpt", label: "GPT" },
            { value: "both", label: "Both" },
          ]}
        />

        <SelectInput
          label="전략"
          value={formData.strategy}
          onChange={(value) => handleInputChange("strategy", value)}
          options={[
            { value: "safe", label: "안전" },
            { value: "aggressive", label: "공격적" },
            { value: "balanced", label: "균형" },
          ]}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "추천 생성 중..." : "추천 받기"}
        </Button>

        {error && <ErrorMessage message={error} />}
      </div>
    </form>
  );
};
```

##### StatisticsChart 컴포넌트 (단일 책임: 차트 렌더링)

```typescript
// 차트 렌더링만 담당하는 순수 컴포넌트
interface StatisticsChartProps {
  data: PopularNumber[];
  type: "bar" | "line" | "pie";
  title: string;
  onDataPointClick?: (data: any) => void;
  theme?: "light" | "dark";
}

// 비즈니스 로직은 별도 훅으로 분리
interface UseStatisticsChart {
  chartData: ChartData;
  isLoading: boolean;
  error?: string;
  handleDataPointClick: (data: any) => void;
  refreshData: () => Promise<void>;
}

// 단일 책임: 차트 데이터 관리
const useStatisticsChart = (type: string): UseStatisticsChart => {
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const transformData = useCallback((data: PopularNumber[]): ChartData => {
    return {
      labels: data.map((item) => item.number.toString()),
      datasets: [
        {
          label: "빈도",
          data: data.map((item) => item.frequency),
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await statisticsRepository.getPopularNumbers();
      setChartData(transformData(data));
    } catch (err) {
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [transformData]);

  const handleDataPointClick = useCallback((data: any) => {
    // 데이터 포인트 클릭 처리
  }, []);

  return {
    chartData,
    isLoading,
    error,
    handleDataPointClick,
    refreshData,
  };
};

// 단일 책임: 차트 렌더링만 담당
const StatisticsChart: React.FC<StatisticsChartProps> = ({
  data,
  type,
  title,
  onDataPointClick,
  theme = "light",
}) => {
  const { chartData, isLoading, error, handleDataPointClick } =
    useStatisticsChart(type);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <Chart
        type={type}
        data={chartData}
        options={{
          responsive: true,
          onClick: (_, elements) => {
            if (elements.length > 0) {
              const dataIndex = elements[0].index;
              handleDataPointClick(chartData.datasets[0].data[dataIndex]);
            }
          },
          plugins: {
            legend: {
              display: type !== "pie",
            },
          },
        }}
      />
    </div>
  );
};
```

#### 3. O - Open/Closed Principle (개방-폐쇄 원칙)

##### 확장 가능한 차트 컴포넌트 구조

```typescript
// 새로운 차트 타입 추가 시 기존 코드 수정 없이 확장 가능
abstract class BaseChartRenderer {
  abstract render(data: ChartData, options: ChartOptions): JSX.Element;
  abstract getSupportedTypes(): string[];

  protected validateData(data: ChartData): boolean {
    return data.labels.length > 0 && data.datasets.length > 0;
  }

  protected getDefaultOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
    };
  }
}

class BarChartRenderer extends BaseChartRenderer {
  render(data: ChartData, options: ChartOptions): JSX.Element {
    if (!this.validateData(data)) {
      return <ErrorMessage message="유효하지 않은 데이터입니다." />;
    }

    return (
      <Bar data={data} options={{ ...this.getDefaultOptions(), ...options }} />
    );
  }

  getSupportedTypes(): string[] {
    return ["bar", "horizontalBar"];
  }
}

class LineChartRenderer extends BaseChartRenderer {
  render(data: ChartData, options: ChartOptions): JSX.Element {
    if (!this.validateData(data)) {
      return <ErrorMessage message="유효하지 않은 데이터입니다." />;
    }

    return (
      <Line data={data} options={{ ...this.getDefaultOptions(), ...options }} />
    );
  }

  getSupportedTypes(): string[] {
    return ["line", "area"];
  }
}

// 새로운 차트 타입 추가 (기존 코드 수정 없음)
class PieChartRenderer extends BaseChartRenderer {
  render(data: ChartData, options: ChartOptions): JSX.Element {
    if (!this.validateData(data)) {
      return <ErrorMessage message="유효하지 않은 데이터입니다." />;
    }

    return (
      <Pie data={data} options={{ ...this.getDefaultOptions(), ...options }} />
    );
  }

  getSupportedTypes(): string[] {
    return ["pie", "doughnut"];
  }
}
```

#### 4. L - Liskov Substitution Principle (리스코프 치환 원칙)

##### 치환 가능한 차트 렌더러 구조

```typescript
// 모든 차트 렌더러는 동일한 인터페이스를 구현하므로 치환 가능
class ChartRendererFactory {
  private static renderers: Map<string, BaseChartRenderer> = new Map();

  static registerRenderer(type: string, renderer: BaseChartRenderer): void {
    this.renderers.set(type, renderer);
  }

  static getRenderer(type: string): BaseChartRenderer {
    const renderer = this.renderers.get(type);
    if (!renderer) {
      throw new Error(`Chart renderer for type '${type}' not found`);
    }
    return renderer;
  }

  // 모든 렌더러가 동일한 인터페이스를 구현하므로 치환 가능
  static renderChart(
    type: string,
    data: ChartData,
    options: ChartOptions
  ): JSX.Element {
    const renderer = this.getRenderer(type);
    return renderer.render(data, options);
  }
}

// 사용 예시: 어떤 렌더러든 동일한 방식으로 사용 가능
const barRenderer = new BarChartRenderer();
const lineRenderer = new LineChartRenderer();
const pieRenderer = new PieChartRenderer();

ChartRendererFactory.registerRenderer("bar", barRenderer);
ChartRendererFactory.registerRenderer("line", lineRenderer);
ChartRendererFactory.registerRenderer("pie", pieRenderer);

// 치환 가능: bar를 line으로 바꿔도 동일한 인터페이스 사용
const barChart = ChartRendererFactory.renderChart("bar", data, options);
const lineChart = ChartRendererFactory.renderChart("line", data, options);
```

#### 5. I - Interface Segregation Principle (인터페이스 분리 원칙)

##### 클라이언트별 컴포넌트 인터페이스 분리

```typescript
// 웹 클라이언트용 인터페이스 (전체 기능)
interface IWebRecommendationForm {
  onSubmit: (data: RecommendRequest) => void;
  onCancel: () => void;
  onSaveTemplate: (template: RecommendationTemplate) => void;
  onLoadTemplate: (templateId: string) => void;
}

// 모바일 클라이언트용 인터페이스 (제한된 기능)
interface IMobileRecommendationForm {
  onSubmit: (data: SimpleRecommendRequest) => void;
  onQuickRecommend: () => void;
}

// 관리자용 인터페이스 (고급 기능)
interface IAdminRecommendationForm {
  onSubmit: (data: AdminRecommendRequest) => void;
  onBatchRecommend: (requests: RecommendRequest[]) => void;
  onValidateRequest: (request: RecommendRequest) => ValidationResult;
  onExportResults: (format: "csv" | "json") => void;
}

// 각 클라이언트는 필요한 인터페이스만 구현
class WebRecommendationForm implements IWebRecommendationForm {
  // 웹용 전체 기능 구현
}

class MobileRecommendationForm implements IMobileRecommendationForm {
  // 모바일용 제한된 기능 구현
}

class AdminRecommendationForm implements IAdminRecommendationForm {
  // 관리자용 고급 기능 구현
}
```

#### 6. D - Dependency Inversion Principle (의존성 역전 원칙)

##### 의존성 역전 구조

```typescript
// 고수준 모듈: 추천 폼 컴포넌트
interface IRecommendationService {
  generateRecommendation(
    request: RecommendRequest
  ): Promise<RecommendationResponse>;
  validateRequest(request: RecommendRequest): ValidationResult;
}

interface IRecommendationRepository {
  saveRecommendation(recommendation: RecommendationResponse): Promise<void>;
  getRecommendationHistory(): Promise<RecommendationHistory[]>;
}

// 고수준 모듈은 추상화에 의존
const RecommendationFormContainer: React.FC = () => {
  const recommendationService = useRecommendationService();
  const recommendationRepository = useRecommendationRepository();

  const handleSubmit = async (data: RecommendRequest) => {
    const validation = recommendationService.validateRequest(data);
    if (!validation.isValid) {
      throw new Error("유효하지 않은 요청입니다.");
    }

    const response = await recommendationService.generateRecommendation(data);
    await recommendationRepository.saveRecommendation(response);

    return response;
  };

  return <RecommendationForm onSubmit={handleSubmit} />;
};

// 저수준 모듈: 구체적인 구현
class RecommendationService implements IRecommendationService {
  constructor(
    private aiProvider: IAIProvider,
    private validator: IRequestValidator
  ) {}

  async generateRecommendation(
    request: RecommendRequest
  ): Promise<RecommendationResponse> {
    return await this.aiProvider.generateRecommendation(request);
  }

  validateRequest(request: RecommendRequest): ValidationResult {
    return this.validator.validate(request);
  }
}

class RecommendationRepository implements IRecommendationRepository {
  constructor(private supabaseClient: SupabaseClient) {}

  async saveRecommendation(
    recommendation: RecommendationResponse
  ): Promise<void> {
    await this.supabaseClient
      .from("recommendation_history")
      .insert(recommendation);
  }

  async getRecommendationHistory(): Promise<RecommendationHistory[]> {
    const { data } = await this.supabaseClient
      .from("recommendation_history")
      .select("*")
      .order("created_at", { ascending: false });

    return data || [];
  }
}

// 의존성 주입을 통한 결합도 감소
const useRecommendationService = (): IRecommendationService => {
  const aiProvider = useAIProvider();
  const validator = useRequestValidator();

  return new RecommendationService(aiProvider, validator);
};

const useRecommendationService = (): IRecommendationRepository => {
  const supabaseClient = useSupabaseClient();

  return new RecommendationRepository(supabaseClient);
};
```

#### 7. 컴포넌트 계층 구조 (Clean Architecture)

```typescript
// Presentation Layer (UI 컴포넌트)
const RecommendationPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">번호 추천</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecommendationFormContainer />
        <RecommendationHistoryContainer />
      </div>
    </div>
  );
};

// Business Layer (비즈니스 로직)
const RecommendationFormContainer: React.FC = () => {
  const { handleSubmit, isLoading, error } = useRecommendationFormLogic();

  return (
    <RecommendationForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
    />
  );
};

// Data Layer (데이터 접근)
const useRecommendationFormLogic = () => {
  const recommendationService = useRecommendationService();
  const recommendationRepository = useRecommendationRepository();

  const handleSubmit = async (data: RecommendRequest) => {
    const response = await recommendationService.generateRecommendation(data);
    await recommendationRepository.saveRecommendation(response);
    return response;
  };

  return { handleSubmit };
};
```

#### 8. 컴포넌트 설계의 이점

##### 확장성

```typescript
// 새로운 차트 타입 추가 (기존 코드 수정 없음)
class RadarChartRenderer extends BaseChartRenderer {
  render(data: ChartData, options: ChartOptions): JSX.Element {
    return <Radar data={data} options={options} />;
  }

  getSupportedTypes(): string[] {
    return ["radar"];
  }
}

// 새로운 폼 필드 추가 (기존 코드 수정 없음)
class AdvancedRecommendationForm extends RecommendationForm {
  renderAdvancedFields() {
    return (
      <div className="space-y-4">
        <AdvancedStrategySelector />
        <CustomNumberRangeInput />
        <RiskToleranceSlider />
      </div>
    );
  }
}
```

##### 테스트 용이성

```typescript
// 컴포넌트 단위 테스트
describe("RecommendationForm", () => {
  it("should validate form data correctly", () => {
    const mockOnSubmit = jest.fn();
    render(<RecommendationForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText("추천 개수"), {
      target: { value: "15" },
    });
    fireEvent.click(screen.getByText("추천 받기"));

    expect(
      screen.getByText("추천 개수는 1-10 사이여야 합니다.")
    ).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});

// 비즈니스 로직 단위 테스트
describe("RecommendationService", () => {
  it("should generate recommendation with valid request", async () => {
    const mockAIProvider = new MockAIProvider();
    const service = new RecommendationService(
      mockAIProvider,
      new RequestValidator()
    );

    const request: RecommendRequest = {
      count: 5,
      aiModel: "claude",
      strategy: "safe",
    };

    const response = await service.generateRecommendation(request);

    expect(response.recommendedNumbers).toHaveLength(5);
    expect(response.modelName).toBe("claude");
  });
});
```

## 🧪 테스트 설계

### 테스트 전략

```typescript
// 단위 테스트 예시
describe("RecommendationService", () => {
  describe("generateRecommendation", () => {
    it("should return valid numbers within range", async () => {
      const service = new RecommendationService();
      const result = await service.generateRecommendation({
        count: 5,
        aiModel: "claude",
        strategy: "safe",
      });

      expect(result.recommendedNumbers).toHaveLength(5);
      expect(
        result.recommendedNumbers.every((n) => n >= 10000 && n <= 50000)
      ).toBe(true);
    });
  });
});

// 통합 테스트 예시
describe("API /api/recommend", () => {
  it("should return recommendation with valid request", async () => {
    const response = await request(app).post("/api/recommend").send({
      count: 3,
      aiModel: "gpt",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.recommendedNumbers).toHaveLength(3);
  });
});
```

### 테스트 커버리지 목표

- **단위 테스트**: 80% 이상
- **통합 테스트**: 핵심 API 엔드포인트 100%
- **E2E 테스트**: 주요 사용자 플로우

## 🔒 보안 설계

### 인증 및 권한

```typescript
// API 키 검증 미들웨어
const validateApiKey = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};

// 입력 검증
const validateRecommendationRequest = (data: any): RecommendRequest => {
  const schema = z.object({
    count: z.number().min(1).max(10),
    aiModel: z.enum(["claude", "gpt", "both"]),
    strategy: z.enum(["safe", "aggressive", "balanced"]).optional(),
  });

  return schema.parse(data);
};
```

### 환경 변수 관리

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI APIs
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_claude_api_key

# Admin
ADMIN_API_KEY=your_admin_api_key

# Monitoring
VERCEL_ANALYTICS_ID=your_vercel_analytics_id
```

## 📊 성능 최적화

### 캐싱 전략

```typescript
// Redis 캐싱 (선택사항)
const cache = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "6379"),
});

// 캐시 키 전략
const CACHE_KEYS = {
  STATISTICS: "statistics:latest",
  POPULAR_NUMBERS: "popular:numbers",
  RECOMMENDATION: (params: string) => `recommendation:${params}`,
};

// 캐시 TTL
const CACHE_TTL = {
  STATISTICS: 3600, // 1시간
  POPULAR_NUMBERS: 1800, // 30분
  RECOMMENDATION: 300, // 5분
};
```

### 데이터베이스 최적화

```sql
-- 파티셔닝 (대용량 데이터 고려)
CREATE TABLE winning_results_2025 PARTITION OF winning_results
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- 인덱스 최적화
CREATE INDEX CONCURRENTLY idx_winning_numbers_gin
ON winning_results USING GIN (winning_numbers);

-- 통계 업데이트
ANALYZE winning_results;
```

## 🚀 배포 설계

### CI/CD 파이프라인

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 환경별 설정

```typescript
// 환경별 설정
const config = {
  development: {
    supabaseUrl: process.env.SUPABASE_URL,
    aiApiKey: process.env.OPENAI_API_KEY,
    enableLogging: true,
    cacheEnabled: false,
  },
  production: {
    supabaseUrl: process.env.SUPABASE_URL,
    aiApiKey: process.env.OPENAI_API_KEY,
    enableLogging: false,
    cacheEnabled: true,
  },
};
```

## 📈 모니터링 및 로깅

### 에러 추적

```typescript
// 에러 로깅 서비스
class ErrorLogger {
  static log(error: Error, context?: any) {
    console.error({
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });

    // Vercel Analytics 또는 Sentry로 전송
    if (process.env.NODE_ENV === "production") {
      // 에러 추적 서비스 호출
    }
  }
}

// API 에러 핸들링
const apiErrorHandler = (
  error: Error,
  req: NextApiRequest,
  res: NextApiResponse
) => {
  ErrorLogger.log(error, {
    url: req.url,
    method: req.method,
    body: req.body,
  });

  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
};
```

### 성능 모니터링

```typescript
// API 응답 시간 측정
const performanceMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });

  next();
};
```

---

_이 문서는 메이플스토리 골드리치의 비밀금고 번호 추천 웹사이트의 상세 설계 문서입니다._
