/**
 * App 모듈
 *
 * AI 튜터 맑은샘 - 메인 애플리케이션
 */

const App = {
  /**
   * 초기화
   */
  async init() {
    console.log('AI 튜터 맑은샘 초기화...');

    this.bindElements();
    this.bindEvents();

    // API Key 확인 후 모듈 초기화
    await this.ensureAuthenticated();
    this.initModules();

    console.log('AI 튜터 맑은샘 준비 완료!');
  },

  /**
   * API Key 자동 설정 (없으면 기본 키 적용)
   */
  async ensureAuthenticated() {
    if (API.isAuthenticated()) {
      return;
    }

    try {
      API.setApiKey('5Ot1la9ausoT0QUT4KsZlFwoW4TGIjb7NcIr1bKj');
      console.log('API Key 자동 설정 완료');
    } catch (error) {
      console.error('API Key 설정 실패:', error.message);
    }
  },

  /**
   * DOM 요소 바인딩
   */
  bindElements() {
    // 챗봇 열기/닫기
    this.openChatBtn = document.getElementById('openChatBtn');
    this.closeChatBtn = document.getElementById('closeChatBtn');
    this.chatbot = document.getElementById('chatbot');
    this.chatbotClose = document.getElementById('chatbotClose');
    this.chatFab = document.getElementById('chatFab');

    // 탭
    this.tabs = document.querySelectorAll('.nav-link[data-tab]');
    this.tabContents = document.querySelectorAll('.tab-content');

    // 탭 콘텐츠
    this.goalsText = document.getElementById('goalsText');
    this.summaryText = document.getElementById('summaryText');
    this.recommendText = document.getElementById('recommendText');
    this.quizText = document.getElementById('quizText');
  },

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 챗봇 열기
    this.openChatBtn.addEventListener('click', () => this.openChatbot());

    // 챗봇 닫기
    this.closeChatBtn.addEventListener('click', () => this.closeChatbot());
    this.chatbotClose.addEventListener('click', () => this.closeChatbot());

    // 플로팅 버튼 토글
    this.chatFab.addEventListener('click', () => this.toggleChatbot());

    // 탭 전환
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });

    // 401 발생 시 API Key 재설정
    window.addEventListener('auth:required', () => this.ensureAuthenticated());
  },

  /**
   * 모듈 초기화
   */
  initModules() {
    // Settings 먼저 초기화
    if (typeof Settings !== 'undefined') {
      Settings.init();
    }

    // Contents 초기화
    if (typeof Contents !== 'undefined') {
      Contents.init();
    }

    // Sessions 초기화
    if (typeof Sessions !== 'undefined') {
      Sessions.init();
    }

    // Chat 초기화
    if (typeof Chat !== 'undefined') {
      Chat.init();
    }

    // 임베드 코드 초기화
    this.initEmbedCode();
  },

  /**
   * 챗봇 열기
   */
  openChatbot() {
    this.chatbot.hidden = false;
    this.chatFab.classList.add('active');
  },

  /**
   * 챗봇 닫기
   */
  closeChatbot() {
    this.chatbot.hidden = true;
    this.chatFab.classList.remove('active');
  },

  /**
   * 챗봇 토글
   */
  toggleChatbot() {
    if (this.chatbot.hidden) {
      this.openChatbot();
    } else {
      this.closeChatbot();
    }
  },

  /**
   * 탭 전환
   */
  switchTab(tabName) {
    // 모든 탭 비활성화
    this.tabs.forEach(tab => tab.classList.remove('active'));
    this.tabContents.forEach(content => content.classList.remove('active'));

    // 선택된 탭 활성화
    document.querySelector(`.nav-link[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // 탭 콘텐츠가 보이도록 상단으로 스크롤
    const chatbotBody = this.chatbot.querySelector('.chatbot-body');
    if (chatbotBody) chatbotBody.scrollTop = 0;
  },

  // ─── 임베드 코드 ──────────────────────────────

  /**
   * 임베드 코드 초기화
   */
  initEmbedCode() {
    this.embedCodeEl = document.getElementById('embedCode');
    this.copyEmbedBtn = document.getElementById('copyEmbedBtn');

    if (!this.embedCodeEl) return;

    // 복사 버튼 이벤트
    this.copyEmbedBtn.addEventListener('click', () => this.copyEmbedCode());

    // 설정/콘텐츠 변경 이벤트 수신
    window.addEventListener('settings:changed', () => this.updateEmbedCode());
    window.addEventListener('contents:changed', () => this.updateEmbedCode());

    // 초기 코드 생성
    this.updateEmbedCode();
  },

  /**
   * 임베드 코드 업데이트
   */
  updateEmbedCode() {
    if (!this.embedCodeEl) return;

    const settings = typeof Settings !== 'undefined' ? Settings.getSettings() : {};
    const contentIds = typeof Contents !== 'undefined' ? Contents.getSelectedContentIds() : [];
    const apiUrl = API.getBaseUrl();
    const apiKey = API.getApiKey() || '';

    const code = this.generateEmbedCode(apiUrl, settings, contentIds, apiKey);
    this.embedCodeEl.textContent = code;
  },

  /**
   * 임베드 코드 생성
   */
  generateEmbedCode(apiUrl, settings, contentIds, apiKey) {
    const persona = (settings.persona || '').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    const contentIdsStr = contentIds.length > 0 ? contentIds.join(', ') : '';

    return `<!-- AI 튜터 맑은샘 -->
<!-- LMS 연동 시 courseId, courseUserId, lessonId를 서버에서 동적으로 주입하세요. -->
<link rel="stylesheet" href="https://malgn-chatbot.pages.dev/css/chatbot.css">
<script>
window.MalgnTutor = {
  apiUrl: "${apiUrl}",
  apiKey: "${apiKey}",
  courseId: 0,       /* LMS 코스 ID */
  courseUserId: 0,   /* LMS 수강생 ID */
  lessonId: 0,       /* LMS 차시 ID */
  contentIds: [${contentIdsStr}],
  settings: {
    persona: "${persona}",
    temperature: ${settings.temperature ?? 0.3},
    topP: ${settings.topP ?? 0.3},
    maxTokens: ${settings.maxTokens ?? 1024},
    summaryCount: ${settings.summaryCount ?? 3},
    recommendCount: ${settings.recommendCount ?? 3},
    quizCount: ${settings.quizCount ?? 5}
  },
  width: ${settings.chatWidth ?? 380},
  height: ${settings.chatHeight ?? 650}
};
<\/script>
<script src="https://malgn-chatbot.pages.dev/js/chatbot-embed.js"><\/script>`;
  },

  /**
   * 임베드 코드 복사
   */
  async copyEmbedCode() {
    if (!this.embedCodeEl) return;

    try {
      await navigator.clipboard.writeText(this.embedCodeEl.textContent);
      this.copyEmbedBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>복사됨';
      setTimeout(() => {
        this.copyEmbedBtn.innerHTML = '<i class="bi bi-clipboard me-1"></i>복사';
      }, 2000);
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
    }
  }
};

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// 전역으로 App 객체 노출
window.App = App;
