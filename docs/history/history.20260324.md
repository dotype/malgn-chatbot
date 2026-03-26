# 변경사항 - 2026.03.24

## 세션 업데이트 API 확장 + 학습 메타데이터 개별 API + 세션 퀴즈 CRUD + 링크 문서 추출

4가지 주요 변경사항.

---

### 1. 세션 업데이트 API 확장 (PUT /sessions/:id)

기존 AI 설정만 수정 가능했던 API에 학습 메타데이터 필드 추가.

#### 추가된 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `settings.sessionNm` | string | 세션 이름 |
| `settings.learningGoal` | string\|null | 학습 목표 (null 전달 시 초기화) |
| `settings.learningSummary` | string\|array\|null | 학습 요약 (배열 전달 시 자동 JSON 변환) |
| `settings.recommendedQuestions` | string\|array\|null | 추천 질문 (배열 전달 시 자동 JSON 변환) |

#### 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `malgn-chatbot-api/src/routes/sessions.js` | PUT /:id에 sessionNm, learningGoal, learningSummary, recommendedQuestions 추가 |
| `malgn-chatbot-api/src/openapi.js` | PUT /sessions/:id 스펙 현행화 |

---

### 2. 학습 메타데이터 개별 API

학습 목표, 요약, 추천 질문을 각각 독립적으로 업데이트하는 경량 엔드포인트 추가.

#### 신규 엔드포인트

| 메서드 | 경로 | Body 필드 | 설명 |
|--------|------|-----------|------|
| `PUT` | `/sessions/:id/learning-goal` | `{ "learningGoal": "..." }` | 학습 목표 수정 |
| `PUT` | `/sessions/:id/learning-summary` | `{ "learningSummary": [...] }` | 학습 요약 수정 |
| `PUT` | `/sessions/:id/recommended-questions` | `{ "recommendedQuestions": [...] }` | 추천 질문 수정 |

- `settings` 래퍼 없이 바로 필드 전달
- 미전달 필드는 기존값 유지, `null` 전달 시 초기화
- 배열/객체 전달 시 자동 JSON 변환

#### 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `malgn-chatbot-api/src/routes/sessions.js` | 3개 PUT 엔드포인트 신규 추가 |
| `malgn-chatbot-api/src/openapi.js` | 3개 엔드포인트 스펙 추가 |

---

### 3. 세션 직접 퀴즈 추가 (TB_QUIZ 확장)

기존에는 퀴즈가 콘텐츠에만 귀속되었으나, 세션에 직접 퀴즈를 추가/수정/삭제할 수 있도록 확장.

#### DB 마이그레이션

| 파일 | 작업 |
|------|------|
| `malgn-chatbot-api/migrations/006_quiz_session_id.sql` | **신규** - session_id 컬럼 + 인덱스 추가 |

```sql
ALTER TABLE TB_QUIZ ADD COLUMN session_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_quiz_session ON TB_QUIZ(session_id, position);
```

#### 퀴즈 데이터 구분

| 구분 | content_id | session_id | 생성 방식 |
|------|-----------|------------|-----------|
| 콘텐츠 퀴즈 | 콘텐츠 ID | NULL | 세션 생성 시 LLM 자동 생성 |
| 세션 퀴즈 | 0 | 세션 ID | API를 통한 수동 추가 |

#### 신규 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/sessions/:id/quiz` | 세션에 퀴즈 수동 추가 |
| `PUT` | `/sessions/:id/quiz/:quizId` | 세션 퀴즈 수정 (부분 업데이트) |
| `DELETE` | `/sessions/:id/quiz/:quizId` | 세션 퀴즈 개별 삭제 |

#### 변경된 기존 API

| 메서드 | 경로 | 변경 내용 |
|--------|------|-----------|
| `GET` | `/sessions/:id/quizzes` | 콘텐츠 퀴즈 + 세션 직접 추가 퀴즈 통합 반환 |

#### 퀴즈 추가 요청 예시

```json
POST /sessions/1/quiz
{
  "quizType": "choice",
  "question": "HTTP 메서드 중 리소스를 조회하는 것은?",
  "options": ["GET", "POST", "PUT", "DELETE"],
  "answer": "1",
  "explanation": "GET은 서버에서 리소스를 조회할 때 사용합니다."
}
```

#### 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `malgn-chatbot-api/migrations/006_quiz_session_id.sql` | **신규** - 마이그레이션 |
| `malgn-chatbot-api/schema.sql` | TB_QUIZ에 session_id 컬럼, 인덱스 추가 |
| `malgn-chatbot-api/src/services/quizService.js` | addQuizToSession, getQuizzesBySession, updateSessionQuiz, deleteSessionQuiz 메서드 추가 |
| `malgn-chatbot-api/src/routes/sessions.js` | POST/PUT/DELETE quiz 엔드포인트 추가, GET quizzes에 세션 퀴즈 통합 |
| `malgn-chatbot-api/src/openapi.js` | 3개 엔드포인트 스펙 추가, GET quizzes 설명 업데이트 |

---

### 4. 링크 업로드 시 PDF/Word/PowerPoint 문서 추출

`uploadLink`에서 바이너리 문서 파일(PDF, DOCX, PPTX)을 감지하여 텍스트를 추출하도록 기능 확장.

#### 지원 형식

| 형식 | 감지 방법 | 추출 방법 |
|------|-----------|-----------|
| PDF | `.pdf` 확장자, `application/pdf` | 기존 `extractPdfText()` 3단계 fallback |
| Word | `.docx` 확장자, `wordprocessingml` content-type | Cloudflare AI `toMarkdown()` |
| PowerPoint | `.pptx` 확장자, `presentationml` content-type | Cloudflare AI `toMarkdown()` |

#### 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `malgn-chatbot-api/src/services/contentService.js` | uploadLink 문서 감지 분기 추가, detectDocumentType(), extractDocumentText() 메서드 신규 |

---

### 5. 채팅 응답 품질 개선 (Hallucination/Garbled Text 대응)

Llama 3.1 8B 모델의 한국어 응답에서 의미 없는 영단어/코드 토큰이 섞여 나오는 문제 해결.

#### 원인 분석

1. **모델 한계**: Llama 3.1 8B의 한국어 생성 능력 부족으로 garbled text 발생
2. **top_p 미전달 버그**: 프론트엔드에서 설정한 topP가 실제 LLM 호출에 전달되지 않고 있었음
3. **히스토리 오염**: garbled 응답이 DB에 저장되어 다음 대화의 컨텍스트로 재투입 → 연쇄 품질 저하

#### 변경 내용

**① 채팅 모델 변경**

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 채팅 모델 | `@cf/meta/llama-3.1-8b-instruct` | `@cf/meta/llama-3.1-70b-instruct` |
| temperature 기본값 | 0.3 | 0.2 |
| topP 기본값 | 0.3 | 0.2 |
| maxTokens 기본값 | 1024 | 512 |
| maxTokens 상한선 | 없음 (프론트 값 그대로 사용) | 512 (서버에서 강제 제한) |

**② top_p 파라미터 버그 수정**

LLM 호출 시 `top_p`가 누락되어 있던 버그 수정. `generateResponse()`와 `generateResponseStream()` 모두에 `top_p: this.topP` 추가.

**③ 시스템 프롬프트 개선**

| 항목 | 변경 내용 |
|------|-----------|
| 언어 규칙 | "반드시 한국어로 답변. 영어 예문 필요 시에만 영어 사용" 명시 |
| garbled 방지 | "의미 없는 단어, 무작위 영단어, 알 수 없는 문자열 절대 생성 금지" 추가 |
| 답변 길이 | "3~5문장" 고정 제한 삭제 → "핵심 위주 + 충분한 설명 + 예시 1~2개" 균형 유도 |
| 출력 형식 | 불필요한 규칙 축소 (프롬프트 길이 자체를 줄여 모델 부담 감소) |

**④ 응답 후처리 필터 (sanitizeResponse) 신규 추가**

LLM 응답에서 garbled text를 감지하고 제거하는 3단계 필터:

| 단계 | 처리 | 예시 |
|------|------|------|
| 괄호 내 garbled 제거 | 20자 이상 괄호 내용이 garbled이면 괄호째 제거 | `( Nadu tipos primero-founded... )` → 제거 |
| 줄 단위 garbled 제거 | 전체 줄이 garbled이면 삭제 | 영단어만 나열된 줄 제거 |
| garbled 꼬리 제거 | 정상 문장 뒤 문장 부호 이후 garbled 시작 시 잘라냄 | `"...already. Nadu tipos..."` → `"...already."` |

garbled 판별 기준:
- 10자 이상 긴 영단어가 2개 이상
- camelCase 코드 토큰 3개 이상 (`.font(relativeMyriskcf` 등)
- 영단어 5개 이상 연속 나열
- `.method(param` 패턴 (코드 유출)

**⑤ 스트리밍 응답 후처리 연동**

- 스트리밍 완료 시 서버가 전체 응답을 후처리하여 `sanitizedResponse` 반환
- 프론트엔드가 `done` 이벤트에서 정제된 응답으로 화면 교체
- DB에는 정제된 응답만 저장 (히스토리 오염 방지)

#### 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `malgn-chatbot-api/src/services/chatService.js` | 모델 변경, temperature/topP/maxTokens 조정, top_p 전달 버그 수정, 프롬프트 개선, sanitizeResponse()/isGarbledText()/removeGarbledTail() 신규 |
| `malgn-chatbot-api/src/routes/chat.js` | 스트리밍 완료 시 sanitizeResponse 적용, sanitizedResponse 반환, 정제된 응답 DB 저장 |
| `malgn-chatbot/js/embed/chat.js` | onDone에서 sanitizedResponse 수신 시 화면 교체 |
| `malgn-chatbot/js/settings.js` | maxTokens 기본값 1024 → 256 |
| `malgn-chatbot/index.html` | maxTokens 슬라이더 기본값 1024 → 256 |

---

### 6. 임베딩 모델 다국어 전환 (bge-base-en → bge-m3)

영어 전용 임베딩 모델을 다국어 모델로 변경하여 한국어 콘텐츠 벡터 검색 정확도 개선.

#### 배경

기존 `bge-base-en-v1.5`는 영어 전용 임베딩 모델로, 한국어 콘텐츠를 벡터화할 때 정확도가 낮아 RAG 검색 시 엉뚱한 청크가 반환되는 문제 발생. 이로 인해 LLM이 무관한 컨텍스트를 받아 garbled text를 생성하는 원인 중 하나로 분석.

#### 변경 내용

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 임베딩 모델 | `@cf/baai/bge-base-en-v1.5` (영어 전용) | `@cf/baai/bge-m3` (100+ 다국어) |
| 벡터 차원 | 768차원 | 1024차원 |
| 최대 입력 토큰 | 512 | 8,192 |

#### Vectorize 인덱스 재생성

차원 수 변경으로 기존 인덱스 삭제 후 재생성:

```bash
# 기존 인덱스 삭제
wrangler vectorize delete malgn-chatbot-vectors --force
wrangler vectorize delete malgn-chatbot-vectors-user2 --force

# 1024차원으로 재생성
wrangler vectorize create malgn-chatbot-vectors --dimensions=1024 --metric=cosine
wrangler vectorize create malgn-chatbot-vectors-user2 --dimensions=1024 --metric=cosine
```

#### 콘텐츠 재임베딩

전체 콘텐츠를 새 임베딩 모델로 재벡터화:

| 테넌트 | 콘텐츠 수 | 결과 |
|--------|----------|------|
| default (dev/user1) | 42개 | 성공 |
| user2 | 2개 | 성공 |

#### 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `malgn-chatbot-api/src/services/embeddingService.js` | 모델 `bge-base-en-v1.5` → `bge-m3`, 주석 768차원 → 1024차원 |
| `malgn-chatbot-api/wrangler.toml` | 테넌트 추가 가이드 dimensions 768 → 1024 |

---

### 7. LLM 모델 통일 (Mistral Small 3.1 24B)

모든 LLM을 `@cf/mistralai/mistral-small-3.1-24b-instruct`로 통일.

#### 배경

- Llama 3.1 8B/70B: 한국어 응답에서 garbled text, 지시 미준수 (hallucination, PDF 메타데이터 퀴즈)
- Qwen 1.5 14B: deprecated (2025-10-01)
- Qwen3 30B: 빈 응답 반환 (thinking 모드 호환 문제 추정)

#### 변경 내용

| 용도 | 변경 전 | 변경 후 |
|------|---------|---------|
| 채팅 (RAG 응답) | `@cf/meta/llama-3.1-8b-instruct` | `@cf/mistralai/mistral-small-3.1-24b-instruct` |
| 학습 메타데이터 생성 | `@cf/meta/llama-3.1-70b-instruct` | `@cf/mistralai/mistral-small-3.1-24b-instruct` |
| 퀴즈 생성 | `@cf/meta/llama-3.1-70b-instruct` | `@cf/mistralai/mistral-small-3.1-24b-instruct` |
| 임베딩 | `@cf/baai/bge-base-en-v1.5` | `@cf/baai/bge-m3` (별도 변경) |

학습 메타데이터 생성 `max_tokens`: 1024 → 2048 (JSON 응답 잘림 방지)

#### 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `malgn-chatbot-api/src/services/chatService.js` | 모델 → mistral-small-3.1-24b |
| `malgn-chatbot-api/src/services/learningService.js` | 모델 → mistral-small-3.1-24b, max_tokens 2048 |
| `malgn-chatbot-api/src/services/quizService.js` | 모델 → mistral-small-3.1-24b |

---

### 8. 퀴즈 품질 개선

풀 수 없는 퀴즈, PDF 메타데이터 퀴즈 문제 해결.

#### 4지선다 프롬프트 개선

| 항목 | 변경 내용 |
|------|-----------|
| 자기 완결성 | "질문만 읽고도 답을 고를 수 있어야 합니다. 모든 조건과 정보를 질문에 포함하세요." |
| 금지 유형 | 변수명/기호 암기, 풀이 절차, 단순 정의, 원문 그대로 묻기 |
| 권장 유형 | 개념 적용(계산 결과), 차이점/공통점, 조건 기반 판단 |
| 수학 예시 | 구체적인 수학 퀴즈 예시 2개 추가 (연립방정식, LaTeX) |
| LaTeX | 수학/과학 콘텐츠에서 `\( 수식 \)` 형태 사용 유도 |

#### OX 퀴즈 프롬프트 개선

| 항목 | 변경 내용 |
|------|-----------|
| 자기 완결성 | "서술문만 읽고도 O/X를 판단할 수 있어야 합니다." |
| LaTeX | 수학/과학 콘텐츠에서 LaTeX 사용 유도 |

#### 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `malgn-chatbot-api/src/services/quizService.js` | 프롬프트 규칙 강화, 수학 예시 추가, LaTeX 규칙, 나쁜 예시 추가 |

---

### 9. KaTeX 수식 렌더링 추가

채팅 응답 및 퀴즈에서 LaTeX 수식을 렌더링하도록 KaTeX 통합.

#### 지원 형식

| 구분 | 입력 | 렌더링 |
|------|------|--------|
| 인라인 수식 | `\( x^2 + y^2 \)` | 인라인 렌더링 |
| 디스플레이 수식 | `$$ E = mc^2 $$` 또는 `\[ ... \]` | 블록 렌더링 |

#### 구현 방식

- **KaTeX CDN**: JS + CSS를 동적 로드 (`katex@0.16.40`)
- **Shadow DOM 대응**: KaTeX CSS를 Shadow Root에 별도 주입
- **LaTeX 보호**: `formatContent()`에서 LaTeX 수식을 마크다운 처리(볼드, 이탤릭)로부터 보호
- **적용 위치**: 채팅 메시지, 퀴즈 문제/선택지, 채점 해설

#### 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `malgn-chatbot/js/embed/utils.js` | LaTeX 보호 로직, `loadKaTeX()`, `renderMath()` 함수 추가 |
| `malgn-chatbot/js/embed/index.js` | KaTeX 로드 (`loadKaTeX(root)`) |
| `malgn-chatbot/js/embed/chat.js` | 메시지 렌더링 후 `renderMath()` 호출 |
| `malgn-chatbot/js/embed/quiz.js` | 퀴즈/해설 렌더링 후 `renderMath()` 호출 |

---

### 10. PDF 메타데이터 저장 방지

PDF 텍스트 추출 시 메타데이터가 본문에 포함되어 저장되는 문제 해결.

#### 문제

이미지 기반 PDF(스캔본)에서 텍스트 추출 시 본문 없이 `PDFFormatVersion=1.6`, `IsLinearized=false` 등 메타데이터만 저장됨. 이를 기반으로 "PDF 문서의 메타데이터 항목은?" 같은 무의미한 퀴즈가 생성.

#### 변경 내용

| 단계 | 파일 | 처리 |
|------|------|------|
| 콘텐츠 저장 시 | contentService.js | `removePdfMetadataLines()` — `key=value` 패턴 추가, 빈 `Page N` 마커 제거 |
| 학습 데이터 생성 시 | learningService.js | `stripPdfMetadata()` 2차 안전망 |
| 퀴즈 생성 시 | quizService.js | `stripPdfMetadata()` 2차 안전망 + 100자 미만 스킵 |

#### 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `malgn-chatbot-api/src/services/contentService.js` | `removePdfMetadataLines()` 패턴 확장 (`key=value`, `Page N`) |
| `malgn-chatbot-api/src/services/learningService.js` | `stripPdfMetadata()` 메서드 추가 |
| `malgn-chatbot-api/src/services/quizService.js` | `stripPdfMetadata()` 메서드 추가, 메타데이터 제거 후 길이 체크 |
