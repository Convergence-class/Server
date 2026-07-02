# 스마트폰 과의존 예방 서비스 — Backend API

Express + TypeScript + Supabase + Google Gemini 기반 백엔드 서버

---

## 실행

```bash
npm install
npm run dev      # 개발 서버 (ts-node)
npm run build    # 프로덕션 빌드
npm start        # 빌드 후 실행
```

**Swagger UI:** http://localhost:3000/api-docs

---

## 환경변수 (.env)

| 키 | 설명 |
|----|------|
| `PORT` | 서버 포트 (기본 3000) |
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_SECRET_KEY` | Supabase Service Role Key |
| `GEMINI_API_KEY` | Google Gemini API Key |

---

## 인증 방식

Supabase Auth 기반 JWT 인증입니다.  
로그인 후 발급된 `access_token`을 모든 요청 헤더에 포함합니다.

```
Authorization: Bearer <access_token>
```

| 경로 | 인증 필요 |
|------|:--------:|
| POST /api/auth/signup | ✗ |
| POST /api/auth/login | ✗ |
| 나머지 모든 /api/* | ✓ |

---

## 에러 코드

| HTTP | 의미 | 예시 상황 |
|------|------|-----------|
| `400` | Bad Request | 필수 파라미터 누락, 타입 오류 |
| `401` | Unauthorized | 토큰 없음·만료·유효하지 않음 |
| `404` | Not Found | 조회 결과 없음 |
| `500` | Internal Server Error | Supabase / Gemini API 오류 |

```json
{ "error": "에러 메시지" }
```

---

## 전체 엔드포인트

### Auth `/api/auth`

| Method | 경로 | 인증 | 설명 |
|--------|------|:----:|------|
| POST | `/api/auth/signup` | ✗ | 회원가입 |
| POST | `/api/auth/login` | ✗ | 로그인 |
| POST | `/api/auth/logout` | ✓ | 로그아웃 |

#### POST /api/auth/signup
```json
// Request
{ "email": "user@example.com", "password": "password123" }

// Response 201
{ "message": "회원가입 성공", "user_id": "uuid-..." }
```

#### POST /api/auth/login
```json
// Request
{ "email": "user@example.com", "password": "password123" }

// Response 200
{ "access_token": "eyJ...", "user_id": "uuid-..." }
```

#### POST /api/auth/logout
```
Authorization: Bearer <access_token>

// Response 200
{ "message": "로그아웃 완료" }
```

---

### Emotion `/api/emotion`

| Method | 경로 | 설명 |
|--------|------|------|
| POST | `/api/emotion/log` | 이모지 감정기록 저장 |
| GET | `/api/emotion/history` | 감정 이력 전체 조회 |

#### POST /api/emotion/log
```json
// Request
{ "user_id": "user123", "emoji": "😊", "note": "오늘 기분 좋음" }

// Response 201
{
  "message": "감정 기록 저장 완료",
  "data": { "id": "uuid", "user_id": "user123", "emoji": "😊", "note": "오늘 기분 좋음", "created_at": "..." }
}
```

#### GET /api/emotion/history?user_id=user123
```json
// Response 200
{ "data": [{ "id": "uuid", "emoji": "😊", "note": "오늘 기분 좋음", "created_at": "..." }] }
```

---

### Usage `/api/usage`

| Method | 경로 | 설명 |
|--------|------|------|
| POST | `/api/usage/log` | 스마트폰 사용시간 저장 |
| GET | `/api/usage/summary` | 사용시간 + 감정 통합 조회 |

#### POST /api/usage/log
```json
// Request
{ "user_id": "user123", "app_name": "YouTube", "duration_minutes": 45, "logged_at": "2026-07-02T14:00:00.000Z" }

// Response 201
{ "message": "사용시간 저장 완료", "data": { ... } }
```

#### GET /api/usage/summary?user_id=user123&date=2026-07-02
> `date` 생략 시 오늘 기준 (형식: `YYYY-MM-DD`)

```json
// Response 200
{
  "data": {
    "date": "2026-07-02",
    "total_usage_minutes": 120,
    "usage_logs": [{ "app_name": "YouTube", "duration_minutes": 45, "logged_at": "..." }],
    "emotion_logs": [{ "emoji": "😊", "note": "기분 좋음", "created_at": "..." }]
  }
}
```

---

### CES-D `/api/cesd`

| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/api/cesd/questions` | 20문항 목록 조회 |
| POST | `/api/cesd/submit` | 설문 제출 + 점수 계산 |
| GET | `/api/cesd/result` | 최근 결과 조회 |

**점수 등급**

| 점수 | 등급 |
|------|------|
| 0 ~ 15 | 정상 |
| 16 ~ 24 | 경증 우울 |
| 25 ~ 60 | 중증 우울 |

> 4·8·12·16번 문항은 역채점 (서버 자동 처리, DB에는 원본 저장)

#### GET /api/cesd/questions
```json
// Response 200
{ "data": [{ "no": 1, "text": "평소에는 아무렇지도 않던 일들이 귀찮고 신경 쓰였다.", "reverse": false }] }
```

#### POST /api/cesd/submit
```json
// Request (0~3 정수 20개 배열)
{ "user_id": "user123", "answers": [1,0,2,3,1,2,0,3,1,0,2,3,0,1,2,3,1,2,0,1] }

// Response 201
{ "message": "CES-D 제출 완료", "data": { "score": 22, "level": "경증 우울", "created_at": "..." } }
```

#### GET /api/cesd/result?user_id=user123
```json
// Response 200
{ "data": { "score": 22, "level": "경증 우울", "created_at": "..." } }
```

---

### Chat `/api/chat`

| Method | 경로 | 설명 |
|--------|------|------|
| POST | `/api/chat/message` | AI 챗봇 메시지 전송 |
| GET | `/api/chat/history` | 대화 이력 조회 |

> Google Gemini 1.5 Flash 사용. 이전 대화 이력(최근 20개)을 컨텍스트로 포함한 멀티턴 대화 지원.

#### POST /api/chat/message
```json
// Request
{ "user_id": "user123", "message": "오늘 기분이 너무 우울해" }

// Response 200
{ "reply": "많이 힘드시겠어요. 어떤 일이 있으셨나요?" }
```

#### GET /api/chat/history?user_id=user123&limit=50
> `limit` 기본값: 50

```json
// Response 200
{
  "data": [
    { "role": "user",  "content": "오늘 기분이 너무 우울해", "created_at": "..." },
    { "role": "model", "content": "많이 힘드시겠어요...",    "created_at": "..." }
  ]
}
```

---

### Notice `/api/notice`

| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/api/notice/random` | 경각심 문구 랜덤 조회 |

#### GET /api/notice/random
```json
// Response 200
{ "data": { "id": 4, "message": "우리는 도구를 만든다. 그리고 그 도구가 결국 우리를 만든다.", "author": "마셜 맥루언" } }
```

> `author` 없는 문구는 `null` 반환

---

### Consent `/api/consent`

| Method | 경로 | 설명 |
|--------|------|------|
| POST | `/api/consent` | 동의 여부 저장 (upsert) |
| GET | `/api/consent` | 동의 여부 조회 |

#### POST /api/consent
```json
// Request
{ "user_id": "user123", "data_collection": true, "notification": true, "chatbot_optin": false }

// Response 200
{ "message": "동의 정보 저장 완료", "data": { "user_id": "user123", "data_collection": true, "notification": true, "chatbot_optin": false, "updated_at": "..." } }
```

#### GET /api/consent?user_id=user123
```json
// Response 200
{ "data": { "user_id": "user123", "data_collection": true, "notification": true, "chatbot_optin": false, "updated_at": "..." } }
```

---

### Status `/api/status`

| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/api/status/cards` | 카드 노출 여부 판단 |
| POST | `/api/status/cards/dismiss` | 챗봇 카드 닫기 (7일간 비노출) |

**카드 노출 조건**

| 카드 | 조건 |
|------|------|
| `showCESDCard` | CES-D 최근 점수 ≥ 16 |
| `showChatbotCard` | CES-D 점수 ≥ 16 AND `chatbot_optin = true` AND 닫은 지 7일 초과 |

#### GET /api/status/cards?user_id=user123
```json
// Response 200
{ "showCESDCard": true, "showChatbotCard": false }
```

#### POST /api/status/cards/dismiss
```json
// Request
{ "user_id": "user123" }

// Response 200
{ "message": "챗봇 카드가 7일간 숨겨집니다." }
```

---

## Supabase 테이블

| 테이블 | 용도 |
|--------|------|
| `auth.users` | Supabase 자동 생성 (회원 인증 정보) |
| `public.users` | 프로필 확장 테이블 (회원가입 시 트리거로 자동 생성) |
| `emotion_logs` | 이모지 감정기록 |
| `usage_logs` | 앱별 사용시간 |
| `cesd_questions` | CES-D 20문항 고정 데이터 |
| `cesd_results` | CES-D 응답 및 점수 |
| `chat_history` | AI 챗봇 대화 이력 |
| `notices` | 경각심 문구 |
| `consents` | 개인정보 수집 동의 + 챗봇 카드 dismiss 시각 |

---

## 프로젝트 구조

```
src/
├── index.ts                  # 서버 진입점, 인증 미들웨어 전역 적용
├── swagger.ts                # OpenAPI 3.0 명세
├── routes/
│   ├── index.ts
│   ├── auth.ts
│   ├── emotion.ts
│   ├── usage.ts
│   ├── cesd.ts
│   ├── chat.ts
│   ├── notice.ts
│   ├── consent.ts
│   └── status.ts
├── controllers/
│   ├── authController.ts
│   ├── emotionController.ts
│   ├── usageController.ts
│   ├── cesdController.ts
│   ├── chatController.ts
│   ├── noticeController.ts
│   ├── consentController.ts
│   └── statusController.ts
├── services/
│   ├── supabase.ts           # Supabase 클라이언트
│   ├── authService.ts
│   ├── emotionService.ts
│   ├── usageService.ts
│   ├── cesdService.ts
│   ├── chatService.ts
│   ├── noticeService.ts
│   ├── consentService.ts
│   └── statusService.ts
├── middlewares/
│   ├── authMiddleware.ts     # JWT 검증 (signup·login 제외)
│   └── errorHandler.ts
└── types/
    └── express.d.ts          # req.user 타입 확장
```