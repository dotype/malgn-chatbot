/**
 * ChatManager - 핵심 채팅 로직
 *
 * 자동 세션 생성: 첫 메시지 전송 시 세션을 생성합니다.
 */
import { escapeHtml, formatContent } from './utils.js';

export class ChatManager {
  constructor(api, config) {
    this.api = api;
    this.config = config;
    this.sessionId = null;
    this.isLoading = false;

    // 콜백
    this.onSessionCreated = null; // (sessionData) => {}
  }

  /**
   * 초기화 - 이벤트 바인딩
   */
  init() {
    this.messagesEl = document.getElementById('malgn-messages');
    this.inputEl = document.getElementById('malgn-input');
    this.sendBtn = document.getElementById('malgn-send');

    // 전송 버튼 클릭
    this.sendBtn.addEventListener('click', () => this.sendMessage());

    // 엔터키
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // 입력창 포커스 시 최신 메시지가 보이도록 하단으로 스크롤
    this.inputEl.addEventListener('focus', () => this.scrollToBottom());
  }

  /**
   * 세션 확보 (없으면 생성)
   */
  async ensureSession() {
    if (this.sessionId) return this.sessionId;

    const result = await this.api.createSession(
      this.config.contentIds || [],
      {
        courseId: this.config.courseId,
        courseUserId: this.config.courseUserId,
        lessonId: this.config.lessonId,
        settings: this.config.settings
      }
    );

    if (result.success) {
      this.sessionId = result.data.session.id;

      // 세션 생성 콜백 (학습 데이터/퀴즈 로딩용)
      if (this.onSessionCreated) {
        this.onSessionCreated(result.data);
      }
    }

    return this.sessionId;
  }

  /**
   * 메시지 전송
   */
  async sendMessage(text) {
    const message = text || this.inputEl.value.trim();
    if (!message || this.isLoading) return;

    // 입력창 초기화
    this.inputEl.value = '';

    // 사용자 메시지 표시
    this.addUserMessage(message);

    // 로딩
    this.setLoading(true);
    this.addTypingIndicator();

    try {
      // 세션 확보
      await this.ensureSession();

      // 메시지 전송
      const result = await this.api.sendMessage(
        message,
        this.sessionId,
        this.config.settings || {}
      );

      this.removeTypingIndicator();

      if (result.success) {
        this.addAssistantMessage(result.data.response);
      } else {
        this.addAssistantMessage('죄송합니다. 응답을 생성할 수 없습니다.');
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      this.removeTypingIndicator();
      this.addAssistantMessage('오류가 발생했습니다: ' + error.message);
    }

    this.setLoading(false);
  }

  /**
   * 사용자 메시지 추가
   */
  addUserMessage(content) {
    const el = document.createElement('div');
    el.className = 'message message--user';
    el.innerHTML = `<div class="message-content">${escapeHtml(content)}</div>`;
    this.messagesEl.appendChild(el);
    this.scrollToBottom();
  }

  /**
   * AI 응답 메시지 추가
   */
  addAssistantMessage(content) {
    const el = document.createElement('div');
    el.className = 'message message--assistant';
    el.innerHTML = `<div class="message-content">${formatContent(content)}</div>`;
    this.messagesEl.appendChild(el);
    this.scrollToBottom();
  }

  /**
   * 타이핑 인디케이터 추가
   */
  addTypingIndicator() {
    if (document.getElementById('malgn-typing')) return;

    const el = document.createElement('div');
    el.id = 'malgn-typing';
    el.className = 'message message--assistant message--typing';
    el.innerHTML = `
      <div class="message-content">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    this.messagesEl.appendChild(el);
    this.scrollToBottom();
  }

  /**
   * 타이핑 인디케이터 제거
   */
  removeTypingIndicator() {
    const el = document.getElementById('malgn-typing');
    if (el) el.remove();
  }

  /**
   * 로딩 상태 설정
   */
  setLoading(loading) {
    this.isLoading = loading;
    this.sendBtn.disabled = loading;
    this.inputEl.disabled = loading;
    if (!loading) this.inputEl.focus();
  }

  /**
   * 스크롤 맨 아래
   */
  scrollToBottom() {
    const body = document.getElementById('malgn-body');
    if (body) {
      body.scrollTop = body.scrollHeight;
    }
  }
}
