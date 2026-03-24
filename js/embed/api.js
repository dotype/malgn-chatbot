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
    if (config.userId) body.user_id = config.userId;
    if (config.settings) body.settings = config.settings;
    if (config.parentSessionId) body.parent_id = config.parentSessionId;

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
   * 채팅 메시지 전송 (SSE 스트리밍)
   */
  async sendMessageStream(message, sessionId, settings = {}, onToken, onDone, onError) {
    try {
      const response = await fetch(`${this.baseUrl}/chat/stream`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ message, sessionId, settings })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        if (onError) onError(new Error(error.error?.message || '스트리밍 요청 실패'));
        return;
      }

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = '';
      let currentEvent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += value;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('event: ')) {
            currentEvent = trimmed.slice(7);
          } else if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (currentEvent === 'token' && data.response && onToken) {
                onToken(data.response);
              } else if (currentEvent === 'done' && onDone) {
                onDone(data);
              } else if (currentEvent === 'error' && onError) {
                onError(new Error(data.message));
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch (error) {
      if (onError) onError(error);
    }
  }

  /**
   * 세션 메시지 초기화 (soft delete)
   */
  async clearMessages(sessionId) {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/messages`, {
      method: 'DELETE',
      headers: this.getHeaders(false)
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
