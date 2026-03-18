# Malgn Chatbot

## 프로젝트 개요

LMS(학습관리시스템)에 임베드하여 사용하는 AI 튜터 챗봇 플랫폼.
교수자가 학습 자료(텍스트, 파일, 링크)를 등록하면, RAG(Retrieval-Augmented Generation) 파이프라인을 통해 학습자에게 문서 기반 질의응답, 학습 목표/요약/추천 질문, 자동 퀴즈를 제공한다.

### 주요 기능

- **문서 기반 AI 채팅**: 등록된 학습 자료를 벡터 검색하여 정확한 답변 생성 (마크다운 렌더링 지원)
- **학습 메타데이터 자동 생성**: 세션 생성 시 학습 목표, 핵심 요약, 추천 질문+답변(Q&A 쌍) 자동 생성
- **자동 퀴즈 생성**: 세션 생성 시 설정에 맞게 4지선다 및 OX 퀴즈 자동 생성 (난이도: 쉬움/보통/어려움)
- **부모-자식 세션**: 교수자 세션(부모)을 기반으로 학습자별 개별 세션(자식) 생성
- **SSE 스트리밍**: 실시간 토큰 스트리밍으로 빠른 응답 제공
- **웰컴 메시지**: 세션 시작 시 설정한 환영 메시지 자동 표시
- **멀티테넌트**: 하나의 코드베이스로 복수 기관 독립 운영

### 기술 스택

| 구분 | 기술 |
|------|------|
| **프론트엔드** | Vanilla JavaScript, Bootstrap 5, esbuild (IIFE 번들링) |
| **백엔드** | Cloudflare Workers, Hono 프레임워크 |
| **데이터베이스** | Cloudflare D1 (SQLite) |
| **벡터 DB** | Cloudflare Vectorize (768차원, 코사인 유사도) |
| **KV 캐시** | Cloudflare KV (세션 캐시 24시간 TTL) |
| **오브젝트 스토리지** | Cloudflare R2 (예약) |
| **AI 모델 (채팅)** | `@cf/meta/llama-3.1-8b-instruct` |
| **AI 모델 (학습/퀴즈)** | `@cf/meta/llama-3.1-70b-instruct` |
| **임베딩 모델** | `@cf/baai/bge-base-en-v1.5` (768차원) |
| **AI Gateway** | Cloudflare AI Gateway (`malgn-chatbot`, cache 3600s) |
| **호스팅** | Cloudflare Pages (프론트), Cloudflare Workers (API) |

### 저장소 구조

```
malgn-chatbot/          ← 프론트엔드 (관리자 대시보드 + 임베드 위젯)
malgn-chatbot-api/      ← 백엔드 API (Cloudflare Workers)
malgn-chatbot-user1/    ← user1 테넌트 프론트엔드 배포본
malgn-chatbot-user2/    ← user2 테넌트 프론트엔드 배포본
```

---

## 핵심 아키텍처

### 프론트엔드 구조 (`malgn-chatbot/`)

```
├── index.html                  # 관리자 대시보드 (3컬럼 레이아웃)
├── package.json                # esbuild 빌드 설정
├── css/
│   ├── style.css               # 대시보드 스타일
│   └── chatbot.css             # 임베드 위젯 스타일
├── js/
│   ├── app.js                  # 메인 오케스트레이터 (초기화, 이벤트 바인딩)
│   ├── api.js                  # REST API 클라이언트 (대시보드용)
│   ├── chat.js                 # 채팅 메시지 송수신
│   ├── contents.js             # 콘텐츠 관리 (텍스트/파일/링크 업로드)
│   ├── sessions.js             # 세션 목록/생성/삭제
│   ├── settings.js             # AI 설정 (persona, temperature, topP 등)
│   ├── tenants.js              # 멀티테넌트 전환
│   ├── chatbot-embed.js        # 빌드된 임베드 위젯 (생성 파일)
│   └── embed/                  # 임베드 위젯 소스 (ES6 모듈)
│       ├── index.js            # 진입점, 설정 파싱
│       ├── api.js              # API 클라이언트 클래스
│       ├── chat.js             # ChatManager (메시지/스트리밍)
│       ├── ui.js               # DOM 주입, FAB 버튼
│       ├── tabs.js             # TabManager (목표/요약/추천/퀴즈 탭)
│       ├── quiz.js             # QuizManager (퀴즈 렌더링/검증)
│       └── utils.js            # 유틸리티 (escapeHtml, formatContent)
└── docs/
    └── history/                # 작업 히스토리 (날짜별 .md 파일)
```

### 백엔드 구조 (`malgn-chatbot-api/`)

```
├── src/
│   ├── index.js                # Hono 앱 진입점 + 라우팅 + Swagger UI
│   ├── openapi.js              # OpenAPI 3.0 스펙 문서
│   ├── middleware/
│   │   ├── auth.js             # Bearer 토큰 인증
│   │   └── errorHandler.js     # 글로벌 에러 핸들러
│   ├── routes/
│   │   ├── chat.js             # POST /chat, /chat/stream
│   │   ├── sessions.js         # GET/POST/PUT/DELETE /sessions
│   │   ├── contents.js         # GET/POST/PUT/DELETE /contents
│   │   └── users.js            # 사용자 관련 (미사용, 라우트 미등록)
│   ├── services/
│   │   ├── chatService.js      # RAG 파이프라인 + LLM 응답 생성 핵심
│   │   ├── contentService.js   # 파일 업로드, 텍스트 추출, 임베딩 저장
│   │   ├── embeddingService.js # 텍스트→벡터 변환 (768차원)
│   │   ├── learningService.js  # 학습 메타데이터 생성 (목표/요약/추천질문)
│   │   ├── quizService.js      # 퀴즈 생성 (4지선다 + OX)
│   │   ├── openaiService.js    # OpenAI 연동 (선택)
│   │   └── userService.js      # 사용자 관리 (Placeholder)
│   └── utils/
│       └── utils.js            # 유틸리티 함수
├── migrations/
│   ├── 001_quiz_content_based.sql    # TB_QUIZ 콘텐츠 기반 리팩토링
│   ├── 002_session_course_fields.sql # course_id, course_user_id, lesson_id 추가
│   ├── 003_session_parent_id.sql     # parent_id 추가 (부모-자식 세션)
│   ├── 004_content_lesson_id.sql     # TB_CONTENT에 lesson_id 추가
│   └── 005_session_quiz_difficulty.sql # quiz_difficulty 추가 (easy/normal/hard)
├── schema.sql                  # 전체 DB 스키마
├── wrangler.toml               # 멀티테넌트 Cloudflare 설정
└── package.json                # hono, @hono/swagger-ui, jose, pdf-parse, unpdf
```

### DB 스키마 (D1)

| 테이블 | 설명 | 주요 컬럼 |
|--------|------|-----------|
| **TB_CONTENT** | 학습 자료 | `id`, `content_nm`, `filename`, `file_type`, `file_size`(INTEGER), `content`(전문), `lesson_id`(LMS 차시), `status` |
| **TB_SESSION** | 채팅 세션 | `id`, `parent_id`(기본0), `session_nm`, `persona`, `temperature`, `top_p`, `max_tokens`, `summary_count`, `recommend_count`, `choice_count`(기본3), `ox_count`(기본2), `quiz_difficulty`(easy/normal/hard, 기본normal), `learning_goal`, `learning_summary`(JSON), `recommended_questions`(JSON, Q&A 쌍), `course_id`, `course_user_id`, `lesson_id`, `user_id` |
| **TB_MESSAGE** | 채팅 메시지 | `id`, `session_id`(FK), `user_id`, `role`(user/assistant), `content` |
| **TB_SESSION_CONTENT** | 세션-콘텐츠 매핑 | `session_id`(FK), `content_id`(FK), UNIQUE(session_id, content_id) 제약 |
| **TB_QUIZ** | 자동 생성 퀴즈 | `content_id`(FK), `quiz_type`(choice/ox), `question`, `options`(JSON, choice만), `answer`, `explanation`, `position`(순서) |

**공통 패턴**: 모든 테이블에 `status` 컬럼 (1=활성, 0=중지, -1=삭제), soft delete 방식

**주요 인덱스**:
- `TB_SESSION`: `(parent_id, course_user_id)` — 자식 세션 중복 방지 조회 (+ lesson_id 조건)
- `TB_MESSAGE`: `(session_id, created_at)` — 채팅 히스토리 조회
- `TB_QUIZ`: `(content_id, position)` — 콘텐츠별 퀴즈 순서 조회

### RAG 파이프라인 (데이터 흐름)

```
사용자 질문 입력
    │
    ▼
[1단계 병렬 처리] ─── Promise.all ───
    ├── 세션 콘텐츠 ID 조회 (parent_id 처리)
    ├── 질문 임베딩 (768차원 벡터 변환)
    └── 세션 학습 데이터 조회 (DB 직접)
    │
    ▼
[2단계 병렬 처리] ─── Promise.all ───
    ├── Vectorize 유사 문서 검색 (top 5, 임계값 0.5)
    ├── 채팅 히스토리 조회 (최근 10개 = 5턴)
    └── 퀴즈 컨텍스트 조회 (정답 정보)
    │
    ▼
[3단계] 시스템 프롬프트 구축 (XML 태그 구조)
    ├── <role>              : AI 튜터 페르소나
    ├── <learning_context>  : 학습 목표 + 핵심 요약 + 추천 질문
    ├── <rules>             : 8개 응답 규칙
    ├── <output_format>     : 출력 형식 가이드
    ├── <reference_documents>: RAG 검색 결과 문서
    └── <quiz_info>         : 퀴즈 정답 정보
    │
    ▼
[4단계] LLM 호출 (Llama 3.1 8B)
    messages = [system, ...history, user]
    │
    ▼
[5단계] 응답 저장 및 반환
    ├── TB_MESSAGE에 user/assistant 메시지 저장
    └── { response, sources, sessionId } 반환
```

### 부모-자식 세션 패턴

```
교수자 세션 (parent_id = 0)
    ├── 콘텐츠 연결 (TB_SESSION_CONTENT)
    ├── 학습 메타데이터 (learning_goal, learning_summary, recommended_questions)
    │
    ├── 학습자A 세션 (parent_id = 교수자세션ID)
    │   └── 부모의 콘텐츠/학습데이터 공유, 독립 채팅 히스토리
    ├── 학습자B 세션 (parent_id = 교수자세션ID)
    │   └── 동일
    └── ...
```

- `effectiveSessionId`: 자식 세션은 콘텐츠 조회 시 부모 ID를 사용
- 같은 parent + course_user_id + lesson_id 조합이면 기존 자식 세션 반환 (중복 방지)

### 임베드 위젯 모드

**Layer 모드** (기본): 플로팅 팝업, FAB 버튼으로 토글
```html
<script>
window.MalgnTutor = {
  apiUrl: "https://api.example.com",
  apiKey: "YOUR_KEY",
  title: "AI 튜터",
  welcomeMessage: "안녕하세요!",   // 웰컴 메시지 (선택)
  videoIframeId: "",              // 비디오 iframe 연동 (선택)
  parentSessionId: 0,             // 부모 세션 ID (0=새 세션)
  courseId: 0,                    // LMS 코스 ID (선택)
  courseUserId: 0,                // LMS 수강생 ID (선택)
  lessonId: 0,                   // LMS 레슨 ID (선택)
  userId: 0,                     // 사용자 ID (선택)
  contentIds: [1, 2, 3],         // 연결할 콘텐츠 ID (새 세션 시)
  settings: { persona: "...", temperature: 0.3, topP: 0.3, maxTokens: 1024,
              summaryCount: 3, recommendCount: 3, choiceCount: 3, oxCount: 2,
              quizDifficulty: "normal" }
};
</script>
<script src="https://malgn-chatbot.pages.dev/js/chatbot-embed.js"></script>
```

**Inline 모드**: 지정 컨테이너에 직접 삽입
```html
<div id="malgn-chatbot-container"></div>
<script>
window.MalgnTutor = {
  mode: "inline",
  container: "#malgn-chatbot-container",
  apiUrl: "...", apiKey: "..."
};
</script>
```

### 멀티테넌트 배포

- `wrangler.toml`의 `[env.<tenant_id>]` 섹션으로 테넌트별 리소스 분리
- 각 테넌트별 독립: D1 DB, KV 네임스페이스, R2 버킷, Vectorize 인덱스
- 배포: `wrangler deploy --env <tenant_id>`
- 현재 테넌트: `dev` (로컬), `user1` (dev와 DB 공유), `user2` (완전 독립)

---

## 주요 페이지/기능 설명

### 관리자 대시보드 (`index.html`)

3컬럼 레이아웃:

**좌측 패널 - AI 설정**
- 웰컴 메시지 편집
- 페르소나(시스템 프롬프트) 편집
- Temperature (0~1), Top-p (0.1~1) 슬라이더
- Max Tokens (256~4096)
- 표시 모드 전환 (Layer/Inline)
- 채팅창 크기 설정 (너비/높이)
- 학습 설정 (요약 수, 추천 질문 수, 4지선다 수, OX 수, 퀴즈 난이도)

**중앙 패널 - 학습 자료 관리**
- 텍스트 직접 입력, 파일 업로드 (PDF/TXT/MD/SRT/VTT, 최대 10MB), 링크 등록
- 드래그 앤 드롭 파일 업로드
- 콘텐츠별 퀴즈 설정 (4지선다 수, OX 수)
- 콘텐츠 목록 (편집/삭제)

**우측 패널 - 채팅 세션**
- 세션 목록 (제목, 최근 메시지, 메시지 수)
- 세션 생성/삭제
- 세션 선택 시 채팅 인터페이스 표시

### 임베드 위젯 채팅 인터페이스

- **탭 영역**: 학습 목표, 학습 요약, 추천 질문(Q&A 토글), 퀴즈
- **채팅 영역**: 메시지 목록 (user/assistant), 마크다운 렌더링, 자동 스크롤
- **입력 영역**: textarea (Shift+Enter 줄바꿈 지원) + 전송 버튼
- **퀴즈**: 4지선다/OX 문제, 오답 시 1회 재시도, 해설 표시 (난이도별 생성)
- **웰컴 메시지**: 새 세션 시작 시 설정한 환영 메시지 자동 표시

### API 엔드포인트

**인증**: `/chat/*`, `/contents/*`, `/sessions/*` 경로에 Bearer 토큰 인증 적용

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/` | → `/docs` 리다이렉트 |
| `GET` | `/health` | 헬스 체크 |
| `GET` | `/openapi.json` | OpenAPI 스펙 |
| `GET` | `/docs` | Swagger UI 문서 |
| `POST` | `/chat` | 동기 채팅 (RAG 파이프라인) |
| `POST` | `/chat/stream` | SSE 스트리밍 채팅 |
| `GET` | `/sessions` | 세션 목록 (부모만, 페이지네이션) |
| `POST` | `/sessions` | 세션 생성 (부모 또는 자식) |
| `GET` | `/sessions/:id` | 세션 상세 (메시지 + 콘텐츠 + 학습데이터) |
| `PUT` | `/sessions/:id` | 세션 AI 설정 업데이트 |
| `DELETE` | `/sessions/:id` | 세션 soft delete (부모 삭제 시 자식 연쇄 삭제) |
| `GET` | `/sessions/:id/quizzes` | 세션 연결 퀴즈 조회 |
| `POST` | `/sessions/:id/quizzes` | 세션 퀴즈 재생성 |
| `GET` | `/contents` | 콘텐츠 목록 (페이지네이션) |
| `POST` | `/contents` | 콘텐츠 등록 (text/file/link) |
| `GET` | `/contents/:id` | 콘텐츠 상세 |
| `PUT` | `/contents/:id` | 콘텐츠 수정 (제목/내용) |
| `DELETE` | `/contents/:id` | 콘텐츠 soft delete |
| `GET` | `/contents/:id/quizzes` | 콘텐츠별 퀴즈 조회 |
| `POST` | `/contents/:id/quizzes` | 콘텐츠별 퀴즈 재생성 |
| `POST` | `/contents/regenerate-all-quizzes` | 전체 퀴즈 재생성 |
| `POST` | `/contents/reembed` | 전체 콘텐츠 재임베딩 |

---

## 개발 규칙

### 코딩 원칙

1. **프론트엔드는 Vanilla JS 싱글톤 모듈 패턴** 사용 — 프레임워크 없음, 각 모듈은 `const ModuleName = { init(), ... }` 형태
2. **임베드 위젯은 ES6 모듈** → esbuild로 IIFE 번들링 (`npm run build`)
3. **백엔드는 Hono 프레임워크** 기반, 서비스 레이어 분리 (routes → services)
4. **이벤트 기반 모듈 통신**: `window.dispatchEvent(new CustomEvent('event:name', { detail }))` 패턴
5. **병렬 처리 극대화**: 독립적인 비동기 작업은 항상 `Promise.all()`로 병렬 실행
6. **비동기 백그라운드 작업**: 퀴즈/학습데이터 생성은 `executionCtx.waitUntil()`로 응답 후 처리
7. **DB 조회는 status 필터링 필수**: 모든 SELECT 쿼리에 `WHERE status = 1` 포함

### 금지 사항

1. **프론트엔드에 프레임워크(React, Vue 등) 도입 금지** — 순수 JS 유지
2. **하드코딩된 API URL 금지** — 반드시 `window.MalgnTutor.apiUrl` 또는 테넌트 설정 사용
3. **DB 물리 삭제 금지** — 반드시 soft delete (`status = -1`) 사용
4. **Vectorize 의존 학습 데이터 조회 금지** — DB 직접 조회 (`getSessionLearningData`) 사용
5. **시스템 프롬프트 하드코딩 금지** — 반드시 `buildSystemPrompt()` 메서드 사용
6. **동기 대기 금지** — LLM 호출(퀴즈/학습데이터 생성)은 `waitUntil()`로 비동기 처리
7. **wrangler.toml에 시크릿 직접 기입 금지** — `wrangler secret put` 명령어 사용

### 권장 패턴

1. **청크 분할**: 텍스트는 500자 단위, 100자 오버랩, 문장 경계 기준 (`embeddingService.splitIntoChunks`)
2. **Vectorize ID 규칙**: `content-{contentId}-chunk-{index}`, `session-{sessionId}-goal`, `session-{sessionId}-summary`
3. **에러 응답 형식**: `{ success: false, error: { code, message, detail } }` 표준 포맷
4. **프론트엔드 상태 유지**: `localStorage`에 설정/테넌트/선택 콘텐츠 저장
5. **테넌트 추가 시**: wrangler.toml 템플릿 복사 → 리소스 생성 → 스키마 적용 → 시크릿 설정 → 배포
6. **Cloudflare Pages 배포 시 한국어 커밋 메시지 오류**: `--commit-message` 플래그로 영문 메시지 사용
7. **CSS 테마**: 퍼플 계열 (`#7C3AED` primary, `#6D28D9` secondary, `#8B5CF6` accent)
8. **콘텐츠 등록 흐름**: 텍스트 추출 → DB 저장 → 청크 분할 → 임베딩 → Vectorize 저장 (퀴즈는 세션 생성 시 설정에 맞게 자동 생성)

### 빌드 & 배포

```bash
# 프론트엔드 임베드 위젯 빌드
cd malgn-chatbot && npm run build

# API 배포 (테넌트별)
cd malgn-chatbot-api && wrangler deploy --env user1
cd malgn-chatbot-api && wrangler deploy --env user2

# D1 마이그레이션
wrangler d1 execute malgn-chatbot-db --file=./migrations/003_session_parent_id.sql
wrangler d1 execute malgn-chatbot-db-user2 --file=./migrations/003_session_parent_id.sql --env user2

# Cloudflare Pages 배포 (한국어 커밋 시 영문 메시지 필요)
wrangler pages deploy . --project-name=malgn-chatbot --commit-dirty=true --commit-message="deploy"
```
