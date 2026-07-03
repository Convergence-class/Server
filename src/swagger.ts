import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '스마트폰 과의존 예방 서비스 API',
      version: '1.0.0',
      description: '감정기록 · 사용시간 · CES-D · 챗봇 · 알림 · 동의 · 카드 상태 API',
    },
    servers: [{ url: 'http://localhost:3000/api' }],
    security: [{ BearerAuth: [] }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: '에러 메시지' },
          },
        },
      },
    },
    paths: {
      // ── Auth ──────────────────────────────────────────────
      '/auth/signup': {
        post: {
          tags: ['Auth'],
          summary: '회원가입',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email:    { type: 'string', format: 'email', example: 'user@example.com' },
                    password: { type: 'string', example: 'password123' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: '회원가입 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: '회원가입 성공' },
                      user_id: { type: 'string', example: 'uuid-...' },
                    },
                  },
                },
              },
            },
            400: { description: '입력값 오류', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: '로그인',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email:    { type: 'string', format: 'email', example: 'user@example.com' },
                    password: { type: 'string', example: 'password123' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: '로그인 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      access_token: { type: 'string', example: 'eyJ...' },
                      user_id:      { type: 'string', example: 'uuid-...' },
                    },
                  },
                },
              },
            },
            401: { description: '인증 실패', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: '로그아웃',
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: '로그아웃 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: '로그아웃 완료' },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // ── Usage ─────────────────────────────────────────────
      '/usage/log': {
        post: {
          tags: ['Usage'],
          summary: '스마트폰 사용시간 저장',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['user_id', 'app_name', 'duration_minutes'],
                  properties: {
                    user_id:          { type: 'string', example: 'user123' },
                    app_name:         { type: 'string', example: 'YouTube' },
                    duration_minutes: { type: 'integer', example: 45 },
                    logged_at:        { type: 'string', format: 'date-time', example: '2026-07-02T14:00:00.000Z' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: '저장 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: '사용시간 저장 완료' },
                      data:    { type: 'object' },
                    },
                  },
                },
              },
            },
            400: { description: '입력값 오류', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/usage/summary': {
        get: {
          tags: ['Usage'],
          summary: '사용시간 + 감정 통합 조회',
          parameters: [
            { name: 'user_id', in: 'query', required: true,  schema: { type: 'string' }, example: 'user123' },
            { name: 'date',    in: 'query', required: false, schema: { type: 'string' }, example: '2026-07-02', description: 'YYYY-MM-DD (생략 시 오늘)' },
          ],
          responses: {
            200: {
              description: '조회 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          date:                 { type: 'string', example: '2026-07-02' },
                          total_usage_minutes:  { type: 'integer', example: 120 },
                          usage_logs:           { type: 'array', items: { type: 'object' } },
                          emotion_logs:         { type: 'array', items: { type: 'object' } },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: '입력값 오류', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },

      // ── CES-D ─────────────────────────────────────────────
      '/cesd/questions': {
        get: {
          tags: ['CES-D'],
          summary: 'CES-D 문항 목록 조회',
          responses: {
            200: {
              description: '조회 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            no:      { type: 'integer', example: 1 },
                            text:    { type: 'string', example: '평소에는 아무렇지도 않던 일들이 귀찮고 신경 쓰였다.' },
                            reverse: { type: 'boolean', example: false },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/cesd/submit': {
        post: {
          tags: ['CES-D'],
          summary: 'CES-D 설문 제출 및 점수 계산',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['user_id', 'answers'],
                  properties: {
                    user_id: { type: 'string', example: 'user123' },
                    answers: {
                      type: 'array',
                      items: { type: 'integer', minimum: 0, maximum: 3 },
                      minItems: 20,
                      maxItems: 20,
                      example: [1,0,2,3,1,2,0,3,1,0,2,3,0,1,2,3,1,2,0,1],
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: '제출 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'CES-D 제출 완료' },
                      data: {
                        type: 'object',
                        properties: {
                          score: { type: 'integer', example: 22 },
                          level: { type: 'string', example: '경증 우울', enum: ['정상', '경증 우울', '중증 우울'] },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: '입력값 오류', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/cesd/result': {
        get: {
          tags: ['CES-D'],
          summary: '최근 CES-D 결과 조회',
          parameters: [
            { name: 'user_id', in: 'query', required: true, schema: { type: 'string' }, example: 'user123' },
          ],
          responses: {
            200: {
              description: '조회 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          score:      { type: 'integer', example: 22 },
                          level:      { type: 'string', example: '경증 우울' },
                          created_at: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                  },
                },
              },
            },
            404: { description: '결과 없음' },
            400: { description: '입력값 오류', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },

      // ── Chat ──────────────────────────────────────────────
      '/chat/message': {
        post: {
          tags: ['Chat'],
          summary: 'AI 챗봇 메시지 전송',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['user_id', 'message'],
                  properties: {
                    user_id: { type: 'string', example: 'user123' },
                    message: { type: 'string', example: '오늘 기분이 너무 우울해' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'AI 응답 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      reply: { type: 'string', example: '많이 힘드시겠어요. 어떤 일이 있으셨나요?' },
                    },
                  },
                },
              },
            },
            400: { description: '입력값 오류', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/chat/history': {
        get: {
          tags: ['Chat'],
          summary: '대화 이력 조회',
          parameters: [
            { name: 'user_id', in: 'query', required: true,  schema: { type: 'string' }, example: 'user123' },
            { name: 'limit',   in: 'query', required: false, schema: { type: 'integer', default: 50 }, example: 50 },
          ],
          responses: {
            200: {
              description: '조회 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            role:       { type: 'string', enum: ['user', 'model'] },
                            content:    { type: 'string' },
                            created_at: { type: 'string', format: 'date-time' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: '입력값 오류', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },

      // ── Notice ────────────────────────────────────────────
      '/notice/random': {
        get: {
          tags: ['Notice'],
          summary: '경각심 문구 랜덤 조회',
          responses: {
            200: {
              description: '조회 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          id:      { type: 'integer', example: 4 },
                          message: { type: 'string', example: '우리는 도구를 만든다. 그리고 그 도구가 결국 우리를 만든다.' },
                          author:  { type: 'string', nullable: true, example: '마셜 맥루언' },
                        },
                      },
                    },
                  },
                },
              },
            },
            404: { description: '등록된 문구 없음' },
          },
        },
      },

      // ── Consent ───────────────────────────────────────────
      '/consent': {
        post: {
          tags: ['Consent'],
          summary: '개인정보 수집 동의 저장',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['user_id', 'data_collection', 'notification', 'chatbot_optin'],
                  properties: {
                    user_id:         { type: 'string', example: 'user123' },
                    data_collection: { type: 'boolean', example: true },
                    notification:    { type: 'boolean', example: true },
                    chatbot_optin:   { type: 'boolean', example: false },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: '저장 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: '동의 정보 저장 완료' },
                      data:    { type: 'object' },
                    },
                  },
                },
              },
            },
            400: { description: '입력값 오류', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        get: {
          tags: ['Consent'],
          summary: '동의 여부 조회',
          parameters: [
            { name: 'user_id', in: 'query', required: true, schema: { type: 'string' }, example: 'user123' },
          ],
          responses: {
            200: {
              description: '조회 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          user_id:         { type: 'string' },
                          data_collection: { type: 'boolean' },
                          notification:    { type: 'boolean' },
                          chatbot_optin:   { type: 'boolean' },
                          updated_at:      { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                  },
                },
              },
            },
            404: { description: '동의 정보 없음' },
            400: { description: '입력값 오류', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },

      // ── Status ────────────────────────────────────────────
      '/status/cards': {
        get: {
          tags: ['Status'],
          summary: '카드 노출 여부 조회',
          parameters: [
            { name: 'user_id', in: 'query', required: true, schema: { type: 'string' }, example: 'user123' },
          ],
          responses: {
            200: {
              description: '조회 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      showCESDCard:    { type: 'boolean', example: true },
                      showChatbotCard: { type: 'boolean', example: false },
                    },
                  },
                },
              },
            },
            400: { description: '입력값 오류', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/status/cards/dismiss': {
        post: {
          tags: ['Status'],
          summary: '챗봇 카드 닫기 (7일간 비노출)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['user_id'],
                  properties: {
                    user_id: { type: 'string', example: 'user123' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: '처리 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: '챗봇 카드가 7일간 숨겨집니다.' },
                    },
                  },
                },
              },
            },
            400: { description: '입력값 오류', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);