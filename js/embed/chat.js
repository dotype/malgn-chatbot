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
    this.onSessionCreating = null; // () => {} - 세션 생성 시작
    this.onSessionCreated = null;  // (sessionData) => {} - 세션 생성 완료
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
   * 기존 세션 로드
   */
  async loadSession(sessionId) {
    this.sessionId = sessionId;

    try {
      const result = await this.api.getSession(sessionId);
      if (result.success) {
        // 기존 메시지 렌더링
        this.clearMessages();
        const messages = result.data.messages || [];
        messages.forEach(msg => {
          if (msg.role === 'user') {
            this.addUserMessage(msg.content);
          } else {
            this.addAssistantMessage(msg.content);
          }
        });

        // 세션 로드 콜백 (학습 데이터/퀴즈 로딩용)
        if (this.onSessionLoaded) {
          this.onSessionLoaded(result.data);
        }
      }
    } catch (error) {
      console.error('세션 로드 실패:', error);
    }
  }

  /**
   * 메시지 영역 초기화
   */
  clearMessages() {
    this.messagesEl.innerHTML = '';
  }

  /**
   * 세션 확보 (없으면 생성)
   */
  async ensureSession() {
    if (this.sessionId) return this.sessionId;

    // 세션 생성 시작 콜백 (로딩 표시용)
    if (this.onSessionCreating) {
      this.onSessionCreating();
    }

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
   * 메시지 전송 (SSE 스트리밍)
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

    try {
      // 세션 확보
      await this.ensureSession();

      // 빈 AI 메시지 DOM 생성 (스트리밍으로 채워짐)
      const el = document.createElement('div');
      el.className = 'chatbot-msg chatbot-msg--assistant chatbot-msg--typing';
      const contentEl = document.createElement('div');
      contentEl.className = 'chatbot-msg-content';
      contentEl.innerHTML = '<span class="chatbot-typing-dot"></span><span class="chatbot-typing-dot"></span><span class="chatbot-typing-dot"></span>';
      el.appendChild(contentEl);
      this.messagesEl.appendChild(el);
      this.scrollToBottom();

      let fullText = '';
      let streaming = false;

      await this.api.sendMessageStream(
        message,
        this.sessionId,
        this.config.settings || {},
        // onToken
        (token) => {
          if (!streaming) {
            streaming = true;
            el.classList.remove('chatbot-msg--typing');
            contentEl.textContent = '';
          }
          fullText += token;
          contentEl.textContent = fullText;
          this.scrollToBottom();
        },
        // onDone
        (data) => {
          contentEl.innerHTML = formatContent(fullText);
          this.scrollToBottom();
          this.setLoading(false);
        },
        // onError
        (error) => {
          console.error('스트리밍 실패:', error);
          if (!streaming) contentEl.textContent = '';
          contentEl.innerHTML = formatContent(fullText || '오류가 발생했습니다: ' + error.message);
          this.setLoading(false);
        }
      );
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      this.addAssistantMessage('오류가 발생했습니다: ' + error.message);
      this.setLoading(false);
    }
  }

  /**
   * 사용자 메시지 추가
   */
  addUserMessage(content) {
    const el = document.createElement('div');
    el.className = 'chatbot-msg chatbot-msg--user';
    el.innerHTML = `<div class="chatbot-msg-content">${escapeHtml(content)}</div>`;
    this.messagesEl.appendChild(el);
    this.scrollToBottom();
  }

  /**
   * AI 응답 메시지 추가
   */
  addAssistantMessage(content) {
    const el = document.createElement('div');
    el.className = 'chatbot-msg chatbot-msg--assistant';
    el.innerHTML = `<div class="chatbot-msg-content">${formatContent(content)}</div>`;
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
    el.className = 'chatbot-msg chatbot-msg--assistant chatbot-msg--typing';
    el.innerHTML = `
      <div class="chatbot-msg-content">
        <span class="chatbot-typing-dot"></span>
        <span class="chatbot-typing-dot"></span>
        <span class="chatbot-typing-dot"></span>
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
    requestAnimationFrame(() => {
      const body = document.getElementById('malgn-body');
      if (body) body.scrollTop = body.scrollHeight;
    });
  }
}
