/**
 * Chat 모듈
 *
 * AI 튜터 맑은샘 - 채팅 기능
 */

const Chat = {
  sessionId: null,
  isLoading: false,

  /**
   * 초기화
   */
  init() {
    this.chatMessages = document.getElementById('chatMessages');
    this.chatForm = document.getElementById('chatForm');
    this.chatInput = document.getElementById('chatInput');
    this.sendBtn = document.getElementById('sendBtn');

    this.bindEvents();
  },

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 폼 제출
    this.chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.sendMessage();
    });

    // 입력창 엔터키
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  },

  /**
   * 메시지 전송
   */
  async sendMessage() {
    const message = this.chatInput.value.trim();

    if (!message || this.isLoading) {
      return;
    }

    // 사용자 메시지 표시
    this.addUserMessage(message);

    // 입력창 초기화
    this.chatInput.value = '';

    // 로딩 상태
    this.setLoading(true);
    this.addTypingIndicator();

    try {
      const result = await API.sendMessage(message, this.sessionId);

      // 타이핑 인디케이터 제거
      this.removeTypingIndicator();

      if (result.success) {
        // 세션 ID 저장
        this.sessionId = result.data.sessionId;

        // AI 응답 표시
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
  },

  /**
   * 사용자 메시지 추가
   */
  addUserMessage(content) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message message--user';
    messageEl.innerHTML = `
      <div class="message-content">${this.escapeHtml(content)}</div>
    `;

    this.chatMessages.appendChild(messageEl);
    this.scrollToBottom();
  },

  /**
   * AI 응답 메시지 추가
   */
  addAssistantMessage(content) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message message--assistant';
    messageEl.innerHTML = `
      <div class="message-content">${this.formatContent(content)}</div>
    `;

    this.chatMessages.appendChild(messageEl);
    this.scrollToBottom();
  },

  /**
   * 시스템 메시지 추가
   */
  addSystemMessage(content) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message message--assistant';
    messageEl.innerHTML = `
      <div class="message-content" style="font-style: italic; color: var(--text-secondary);">
        ${this.escapeHtml(content)}
      </div>
    `;

    this.chatMessages.appendChild(messageEl);
    this.scrollToBottom();
  },

  /**
   * 타이핑 인디케이터 추가
   */
  addTypingIndicator() {
    const existingIndicator = document.getElementById('typingIndicator');
    if (existingIndicator) return;

    const indicatorEl = document.createElement('div');
    indicatorEl.id = 'typingIndicator';
    indicatorEl.className = 'message message--assistant message--typing';
    indicatorEl.innerHTML = `
      <div class="message-content">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;

    this.chatMessages.appendChild(indicatorEl);
    this.scrollToBottom();
  },

  /**
   * 타이핑 인디케이터 제거
   */
  removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
  },

  /**
   * 로딩 상태 설정
   */
  setLoading(loading) {
    this.isLoading = loading;
    this.sendBtn.disabled = loading;
    this.chatInput.disabled = loading;

    if (!loading) {
      this.chatInput.focus();
    }
  },

  /**
   * 스크롤을 맨 아래로 이동
   */
  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  },

  /**
   * HTML 이스케이프
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * 콘텐츠 포맷팅 (줄바꿈 처리)
   */
  formatContent(content) {
    return this.escapeHtml(content).replace(/\n/g, '<br>');
  },

  /**
   * 세션 로드
   */
  async loadSession(sessionId) {
    if (!sessionId) {
      this.clearMessages();
      this.clearLearningData();
      return;
    }

    this.sessionId = Number(sessionId);

    try {
      const result = await API.getSession(this.sessionId);

      if (result.success) {
        // AI 설정 적용
        if (result.data.settings && typeof Settings !== 'undefined') {
          Settings.applySessionSettings(result.data.settings);
        }

        // 학습 데이터 표시
        if (result.data.learning) {
          this.renderLearningData(result.data.learning);
        } else {
          this.clearLearningData();
        }

        // 메시지 렌더링
        this.renderMessages(result.data.messages || []);
      }
    } catch (error) {
      console.error('세션 로드 실패:', error);
      this.clearMessages();
      this.clearLearningData();
    }
  },

  /**
   * 학습 데이터 렌더링 (학습목표, 요약, 추천질문)
   */
  renderLearningData(learning) {
    // 학습 목표
    const goalsText = document.getElementById('goalsText');
    if (goalsText) {
      goalsText.textContent = learning.goal || '학습 목표가 설정되지 않았습니다.';
    }

    // 요약
    const summaryText = document.getElementById('summaryText');
    if (summaryText) {
      summaryText.textContent = learning.summary || '요약이 생성되지 않았습니다.';
    }

    // 추천 질문
    const recommendText = document.getElementById('recommendText');
    if (recommendText) {
      const questions = learning.recommendedQuestions || [];
      if (questions.length > 0) {
        recommendText.innerHTML = questions.map((q, i) =>
          `<div class="recommend-question mb-2" style="cursor: pointer;" data-question="${this.escapeHtml(q)}">
            <span class="badge bg-primary me-1">${i + 1}</span>${this.escapeHtml(q)}
          </div>`
        ).join('');

        // 추천 질문 클릭 이벤트 - 바로 질문 전송
        recommendText.querySelectorAll('.recommend-question').forEach(el => {
          el.addEventListener('click', () => {
            const question = el.dataset.question;
            if (this.chatInput && question) {
              this.chatInput.value = question;
              this.sendMessage();
            }
          });
        });
      } else {
        recommendText.textContent = '추천 질문이 생성되지 않았습니다.';
      }
    }
  },

  /**
   * 학습 데이터 초기화
   */
  clearLearningData() {
    const goalsText = document.getElementById('goalsText');
    const summaryText = document.getElementById('summaryText');
    const recommendText = document.getElementById('recommendText');

    if (goalsText) goalsText.textContent = '학습 목표가 설정되지 않았습니다.';
    if (summaryText) summaryText.textContent = '요약이 생성되지 않았습니다.';
    if (recommendText) recommendText.textContent = '추천 질문이 생성되지 않았습니다.';
  },

  /**
   * 메시지 목록 렌더링
   */
  renderMessages(messages) {
    this.chatMessages.innerHTML = '';

    if (messages.length === 0) {
      this.addAssistantMessage('안녕하세요! AI 튜터입니다. 궁금한 점이 있으면 언제든 물어보세요!');
      return;
    }

    for (const msg of messages) {
      if (msg.role === 'user') {
        this.addUserMessage(msg.content);
      } else {
        this.addAssistantMessage(msg.content);
      }
    }
  },

  /**
   * 메시지 초기화 (세션 삭제 시)
   */
  clearMessages() {
    this.chatMessages.innerHTML = '';
    this.sessionId = null;
    this.addAssistantMessage('안녕하세요! AI 튜터입니다. 궁금한 점이 있으면 언제든 물어보세요!');
  },

  /**
   * 채팅 기록 초기화
   */
  clearChat() {
    this.chatMessages.innerHTML = '';
    this.sessionId = null;
    this.addAssistantMessage('안녕하세요! AI 튜터입니다. 궁금한 점이 있으면 언제든 물어보세요!');
  }
};

// 전역으로 Chat 객체 노출
window.Chat = Chat;
