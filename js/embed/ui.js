/**
 * UI Module - DOM 생성 및 주입
 *
 * 호스트 페이지에 챗봇 위젯 HTML을 동적 생성합니다.
 * ID에 malgn- 접두어를 사용하여 충돌 방지.
 */

export const UI = {
  chatbot: null,
  fab: null,

  /**
   * 채팅 위젯 HTML 주입
   */
  inject(config) {
    const width = config.width || 380;
    const height = config.height || 650;

    // FAB 버튼
    const fab = document.createElement('button');
    fab.id = 'malgn-fab';
    fab.className = 'chat-fab';
    fab.title = '채팅 열기';
    fab.innerHTML = `
      <i class="bi bi-chat-dots-fill chat-fab-icon"></i>
      <i class="bi bi-x-lg chat-fab-close"></i>
    `;
    document.body.appendChild(fab);
    this.fab = fab;

    // 챗봇 창
    const chatbot = document.createElement('div');
    chatbot.id = 'malgn-chatbot';
    chatbot.className = 'chatbot';
    chatbot.hidden = true;
    chatbot.style.width = width + 'px';
    chatbot.style.height = height + 'px';

    chatbot.innerHTML = `
      <!-- Header -->
      <div class="chatbot-header">
        <span class="chatbot-title">AI 튜터 맑은샘</span>
        <button class="chatbot-close" id="malgn-close">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Tabs -->
      <div class="chatbot-tabs">
        <button class="chatbot-tab active" data-tab="goals">목표</button>
        <button class="chatbot-tab" data-tab="summary">요약</button>
        <button class="chatbot-tab" data-tab="recommend">추천</button>
        <button class="chatbot-tab" data-tab="quiz">퀴즈</button>
      </div>

      <!-- Scrollable Body -->
      <div class="chatbot-body" id="malgn-body">
        <!-- Tab Content -->
        <div class="chatbot-content">
          <div class="malgn-tab-content active" id="malgn-tab-goals">
            <h6>
              <i class="bi bi-bullseye"></i> 학습목표
            </h6>
            <p id="malgn-goals-text">학습 목표가 설정되지 않았습니다.</p>
          </div>
          <div class="malgn-tab-content" id="malgn-tab-summary">
            <h6>
              <i class="bi bi-card-text"></i> 요약
            </h6>
            <p id="malgn-summary-text">요약이 생성되지 않았습니다.</p>
          </div>
          <div class="malgn-tab-content" id="malgn-tab-recommend">
            <h6>
              <i class="bi bi-lightbulb"></i> 추천 질문
            </h6>
            <p id="malgn-recommend-text">추천 질문이 생성되지 않았습니다.</p>
          </div>
          <div class="malgn-tab-content" id="malgn-tab-quiz">
            <h6>
              <i class="bi bi-question-circle"></i> 퀴즈
            </h6>
            <p id="malgn-quiz-text">퀴즈가 생성되지 않았습니다.</p>
          </div>
        </div>

        <!-- Chat Messages -->
        <div class="chatbot-messages" id="malgn-messages">
          <div class="message message--assistant">
            <div class="message-content">
              안녕하세요! AI 튜터입니다. 궁금한 점이 있으면 언제든 물어보세요!
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Input -->
      <div class="chatbot-footer">
        <input type="text" class="chatbot-input" id="malgn-input" placeholder="메시지를 입력하세요...">
        <button class="chatbot-send" id="malgn-send">
          <i class="bi bi-send"></i>
        </button>
      </div>
    `;

    document.body.appendChild(chatbot);
    this.chatbot = chatbot;
  },

  /**
   * 챗봇 열기
   */
  open() {
    if (this.chatbot) this.chatbot.hidden = false;
    if (this.fab) this.fab.classList.add('active');
  },

  /**
   * 챗봇 닫기
   */
  close() {
    if (this.chatbot) this.chatbot.hidden = true;
    if (this.fab) this.fab.classList.remove('active');
  },

  /**
   * 챗봇 토글
   */
  toggle() {
    if (this.chatbot && this.chatbot.hidden) {
      this.open();
    } else {
      this.close();
    }
  }
};
