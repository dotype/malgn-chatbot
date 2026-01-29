/**
 * API 모듈
 *
 * Backend API와 통신하는 함수들을 제공합니다.
 */

// API 기본 URL (환경에 따라 자동 선택)
// 프로덕션 도메인이 아니면 로컬 API 서버 사용 (Live Server, localhost 등 지원)
const isProduction = window.location.hostname.includes('pages.dev') ||
                     window.location.hostname.includes('dotype.workers.dev');
const API_BASE_URL = isProduction
  ? 'https://malgn-chatbot-api.dotype.workers.dev'
  : 'http://localhost:8787';

/**
 * API 객체
 * 모든 API 호출 함수를 포함합니다.
 */
const API = {
  /**
   * 기본 URL 설정
   * @param {string} url - 새 기본 URL
   */
  setBaseUrl(url) {
    this.baseUrl = url;
  },

  /**
   * 현재 기본 URL 반환
   */
  getBaseUrl() {
    return this.baseUrl || API_BASE_URL;
  },

  // ─── 인증 관련 (API Key) ────────────────────────

  /**
   * API Key 저장
   */
  setApiKey(apiKey) {
    localStorage.setItem('api_key', apiKey);
  },

  /**
   * API Key 조회
   */
  getApiKey() {
    return localStorage.getItem('api_key');
  },

  /**
   * API Key 삭제
   */
  removeApiKey() {
    localStorage.removeItem('api_key');
  },

  /**
   * 인증 여부 확인
   */
  isAuthenticated() {
    return !!this.getApiKey();
  },

  /**
   * Authorization 헤더 반환
   */
  getAuthHeaders() {
    const apiKey = this.getApiKey();
    if (apiKey) {
      return { 'Authorization': `Bearer ${apiKey}` };
    }
    return {};
  },

  /**
   * 로그아웃 (API Key 삭제)
   */
  logout() {
    this.removeApiKey();
  },

  /**
   * 응답 처리 (401 시 API Key 입력 요청)
   */
  async handleResponse(response) {
    if (response.status === 401) {
      this.removeApiKey();
      window.dispatchEvent(new CustomEvent('auth:required'));
      throw new Error('API Key가 유효하지 않습니다. 다시 입력해 주세요.');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || '요청 실패');
    }

    return response.json();
  },

  // ─── 채팅 ──────────────────────────────────────

  /**
   * 채팅 메시지 전송
   * @param {string} message - 사용자 메시지
   * @param {string|null} sessionId - 세션 ID (선택적)
   * @returns {Promise<Object>} - API 응답
   */
  async sendMessage(message, sessionId = null) {
    // AI 설정 가져오기
    const aiSettings = typeof Settings !== 'undefined' ? Settings.getAISettings() : {};

    const response = await fetch(`${this.getBaseUrl()}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify({
        message,
        sessionId,
        settings: aiSettings
      })
    });

    return this.handleResponse(response);
  },

  // ─── 콘텐츠 ────────────────────────────────────

  /**
   * 콘텐츠 목록 조회
   * @param {number} page - 페이지 번호
   * @param {number} limit - 페이지당 개수
   * @returns {Promise<Object>} - API 응답
   */
  async getContents(page = 1, limit = 20) {
    const response = await fetch(
      `${this.getBaseUrl()}/contents?page=${page}&limit=${limit}`,
      { headers: this.getAuthHeaders() }
    );

    return this.handleResponse(response);
  },

  /**
   * 파일 업로드
   * @param {File} file - 업로드할 파일
   * @param {string|null} title - 콘텐츠 제목 (선택적)
   * @returns {Promise<Object>} - API 응답
   */
  async uploadFile(file, title = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'file');
    if (title) {
      formData.append('title', title);
    }

    const response = await fetch(`${this.getBaseUrl()}/contents`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData
    });

    return this.handleResponse(response);
  },

  /**
   * 텍스트 콘텐츠 업로드
   * @param {string} title - 제목
   * @param {string} content - 텍스트 내용
   * @returns {Promise<Object>} - API 응답
   */
  async uploadText(title, content) {
    const response = await fetch(`${this.getBaseUrl()}/contents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify({
        type: 'text',
        title,
        content
      })
    });

    return this.handleResponse(response);
  },

  /**
   * 링크 콘텐츠 업로드
   * @param {string} title - 제목
   * @param {string} url - 링크 URL
   * @returns {Promise<Object>} - API 응답
   */
  async uploadLink(title, url) {
    const response = await fetch(`${this.getBaseUrl()}/contents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify({
        type: 'link',
        title,
        url
      })
    });

    return this.handleResponse(response);
  },

  /**
   * 콘텐츠 상세 조회
   * @param {string} id - 콘텐츠 ID
   * @returns {Promise<Object>} - API 응답
   */
  async getContent(id) {
    const response = await fetch(
      `${this.getBaseUrl()}/contents/${id}`,
      { headers: this.getAuthHeaders() }
    );

    return this.handleResponse(response);
  },

  /**
   * 콘텐츠 삭제
   * @param {string} id - 콘텐츠 ID
   * @returns {Promise<Object>} - API 응답
   */
  async deleteContent(id) {
    const response = await fetch(`${this.getBaseUrl()}/contents/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  },

  /**
   * 콘텐츠 수정
   * @param {number} id - 콘텐츠 ID
   * @param {string} title - 새 제목
   * @param {string|null} content - 새 내용 (선택적)
   * @returns {Promise<Object>} - API 응답
   */
  async updateContent(id, title, content = null) {
    const body = { title };
    if (content) {
      body.content = content;
    }

    const response = await fetch(`${this.getBaseUrl()}/contents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify(body)
    });

    return this.handleResponse(response);
  },

  // ─── 세션 ──────────────────────────────────────

  /**
   * 세션 목록 조회
   * @param {number} page - 페이지 번호
   * @param {number} limit - 페이지당 개수
   * @returns {Promise<Object>} - API 응답
   */
  async getSessions(page = 1, limit = 50) {
    const response = await fetch(
      `${this.getBaseUrl()}/sessions?page=${page}&limit=${limit}`,
      { headers: this.getAuthHeaders() }
    );

    return this.handleResponse(response);
  },

  /**
   * 새 세션 생성
   * @param {number[]} contentIds - 연결할 콘텐츠 ID 배열 (필수)
   * @param {Object} settings - AI 설정 (선택) { persona, temperature, topP }
   * @returns {Promise<Object>} - API 응답
   */
  async createSession(contentIds = [], settings = null) {
    const body = { content_ids: contentIds };
    if (settings) {
      body.settings = settings;
    }

    const response = await fetch(`${this.getBaseUrl()}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify(body)
    });

    return this.handleResponse(response);
  },

  /**
   * 세션 상세 조회 (메시지 포함)
   * @param {string} id - 세션 ID
   * @returns {Promise<Object>} - API 응답
   */
  async getSession(id) {
    const response = await fetch(
      `${this.getBaseUrl()}/sessions/${id}`,
      { headers: this.getAuthHeaders() }
    );

    return this.handleResponse(response);
  },

  /**
   * 세션 AI 설정 업데이트
   * @param {number} id - 세션 ID
   * @param {Object} settings - AI 설정
   * @returns {Promise<Object>} - API 응답
   */
  async updateSession(id, settings) {
    const response = await fetch(`${this.getBaseUrl()}/sessions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify({ settings })
    });

    return this.handleResponse(response);
  },

  /**
   * 세션 삭제
   * @param {string} id - 세션 ID
   * @returns {Promise<Object>} - API 응답
   */
  async deleteSession(id) {
    const response = await fetch(`${this.getBaseUrl()}/sessions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  },

  /**
   * 세션 퀴즈 조회
   * @param {number} id - 세션 ID
   * @returns {Promise<Object>} - API 응답
   */
  async getSessionQuizzes(id) {
    const response = await fetch(
      `${this.getBaseUrl()}/sessions/${id}/quizzes`,
      { headers: this.getAuthHeaders() }
    );

    return this.handleResponse(response);
  },

  // ─── 기타 ──────────────────────────────────────

  /**
   * 서버 상태 확인
   * @returns {Promise<Object>} - API 응답
   */
  async healthCheck() {
    const response = await fetch(`${this.getBaseUrl()}/health`);

    if (!response.ok) {
      throw new Error('서버 연결 실패');
    }

    return response.json();
  }
};

// 전역으로 API 객체 노출
window.API = API;
