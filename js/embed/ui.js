/**
 * UI Module - DOM 생성 및 Shadow DOM 주입
 *
 * Shadow DOM을 사용하여 호스트 페이지 CSS로부터 완전 격리합니다.
 * CSS는 번들에 인라인되므로 별도 <link> 없이 스크립트 하나로 동작.
 *
 * 모드:
 * - layer (기본): 플로팅 팝업 + FAB 버튼
 * - inline: 지정된 컨테이너 안에 배치
 */

import chatbotCSS from '../../css/chatbot.css';

export const UI = {
  chatbot: null,
  fab: null,
  root: null, // Shadow root reference (모든 모듈이 DOM 쿼리 시 사용)
  isInline: false,

  /**
   * 채팅 위젯 HTML 주입 (Shadow DOM)
   */
  inject(config) {
    const width = config.width || 380;
    const height = config.height || 650;
    this.isInline = config.mode === 'inline';

    // Shadow DOM 호스트 엘리먼트
    const host = document.createElement('div');
    host.id = 'malgn-tutor-host';
    if (this.isInline) {
      host.style.cssText = 'display:block;width:100%;height:100%;';
    }

    // Shadow Root 생성
    const shadow = host.attachShadow({ mode: 'open' });
    this.root = shadow;

    // CSS 주입 (인라인 스타일)
    const style = document.createElement('style');
    style.textContent = chatbotCSS;
    shadow.appendChild(style);

    // Bootstrap Icons CDN (Shadow DOM 내부)
    const iconsLink = document.createElement('link');
    iconsLink.rel = 'stylesheet';
    iconsLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css';
    shadow.appendChild(iconsLink);

    // 레이어 모드: FAB 버튼 생성
    if (!this.isInline) {
      const fab = document.createElement('button');
      fab.id = 'malgn-fab';
      fab.className = 'chat-fab';
      fab.title = '채팅 열기';
      fab.innerHTML = `
        <i class="bi bi-chat-dots-fill chat-fab-icon"></i>
        <i class="bi bi-x-lg chat-fab-close"></i>
      `;
      shadow.appendChild(fab);
      this.fab = fab;
    }

    // 챗봇 창
    const chatbot = document.createElement('div');
    chatbot.id = 'malgn-chatbot';

    if (this.isInline) {
      chatbot.className = 'chatbot chatbot--inline';
    } else {
      chatbot.className = 'chatbot';
      chatbot.hidden = true;
      chatbot.style.width = width + 'px';
      chatbot.style.height = height + 'px';
    }

    chatbot.innerHTML = `
      <!-- Header -->
      <div class="chatbot-header">
        <span class="chatbot-title">
          <i class="bi bi-mortarboard-fill chatbot-title-icon"></i>
          ${config.title || 'AI 튜터 맑은샘'}
        </span>
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
              <i class="bi bi-stars"></i> 학습목표
            </h6>
            <div id="malgn-goals-text">학습 목표가 설정되지 않았습니다.</div>
          </div>
          <div class="malgn-tab-content" id="malgn-tab-summary">
            <h6>
              <i class="bi bi-journal-text"></i> 요약
            </h6>
            <div id="malgn-summary-text">요약이 생성되지 않았습니다.</div>
          </div>
          <div class="malgn-tab-content" id="malgn-tab-recommend">
            <h6>
              <i class="bi bi-chat-left-quote"></i> 추천질문
            </h6>
            <div id="malgn-recommend-text">추천 질문이 생성되지 않았습니다.</div>
          </div>
          <div class="malgn-tab-content" id="malgn-tab-quiz">
            <h6>
              <i class="bi bi-patch-question"></i> 퀴즈
            </h6>
            <div id="malgn-quiz-text">퀴즈가 생성되지 않았습니다.</div>
          </div>
        </div>

        <!-- Chat Messages -->
        <div class="chatbot-messages" id="malgn-messages">
          <div class="chatbot-msg chatbot-msg--assistant">
            <div class="chatbot-msg-content">
              안녕하세요! AI 튜터입니다. 궁금한 점이 있으면 언제든 물어보세요!
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Input -->
      <div class="chatbot-footer">
        <input type="text" class="chatbot-input" id="malgn-input" placeholder="메시지를 입력하세요">
        <button class="chatbot-send" id="malgn-send">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    `;

    shadow.appendChild(chatbot);

    // 호스트 엘리먼트를 DOM에 삽입
    if (this.isInline && config.container) {
      const target = typeof config.container === 'string'
        ? document.querySelector(config.container)
        : config.container;
      if (target) {
        target.appendChild(host);
      } else {
        console.error('[MalgnTutor] Container not found:', config.container);
        document.body.appendChild(host);
      }
    } else {
      document.body.appendChild(host);
    }

    this.chatbot = chatbot;
  },

  /**
   * 챗봇 열기 (레이어 모드에서만 동작)
   */
  open() {
    if (this.isInline) return;
    if (this.chatbot) this.chatbot.hidden = false;
    if (this.fab) this.fab.classList.add('active');
  },

  /**
   * FAB 로딩 상태 설정
   */
  setFabLoading(loading) {
    if (this.fab) {
      if (loading) {
        this.fab.classList.add('loading');
      } else {
        this.fab.classList.remove('loading');
      }
    }
  },

  /**
   * 챗봇 닫기 (레이어 모드에서만 동작)
   */
  close() {
    if (this.isInline) return;
    if (this.chatbot) this.chatbot.hidden = true;
    if (this.fab) this.fab.classList.remove('active');
  },

  /**
   * 챗봇 토글 (레이어 모드에서만 동작)
   */
  toggle() {
    if (this.isInline) return;
    if (this.chatbot && this.chatbot.hidden) {
      this.open();
    } else {
      this.close();
    }
  }
};
