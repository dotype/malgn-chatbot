/**
 * API Client for embed widget
 */
export class Api {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * 공통 요청 헤더
   */
  getHeaders(json = true) {
    const headers = {};
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    if (json) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  /**
   * 응답 처리
   */
  async handleResponse(response) {
    if (response.status === 401) {
      throw new Error('API Key가 유효하지 않습니다.');
    }
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || '요청 실패');
    }
    return response.json();
  }

  /**
   * 세션 생성
   */
  async createSession(contentIds, config = {}) {
    const body = {
      content_ids: contentIds
    };
    if (config.courseId) body.course_id = config.courseId;
    if (config.courseUserId) body.course_user_id = config.courseUserId;
    if (config.lessonId) body.lesson_id = config.lessonId;
    if (config.settings) body.settings = config.settings;

    const response = await fetch(`${this.baseUrl}/sessions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });
    return this.handleResponse(response);
  }

  /**
   * 세션 상세 조회
   */
  async getSession(id) {
    const response = await fetch(`${this.baseUrl}/sessions/${id}`, {
      headers: this.getHeaders(false)
    });
    return this.handleResponse(response);
  }

  /**
   * 채팅 메시지 전송
   */
  async sendMessage(message, sessionId, settings = {}) {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ message, sessionId, settings })
    });
    return this.handleResponse(response);
  }

  /**
   * 세션 퀴즈 조회
   */
  async getQuizzes(sessionId) {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/quizzes`, {
      headers: this.getHeaders(false)
    });
    return this.handleResponse(response);
  }
}
