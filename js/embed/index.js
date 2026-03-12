/**
 * AI 튜터 맑은샘 - 임베드 위젯 엔트리 포인트
 *
 * window.MalgnTutor 설정을 읽어 채팅 위젯을 자동 생성합니다.
 *
 * 사용법 (레이어 모드 - 기본):
 * <script>
 * window.MalgnTutor = {
 *   apiUrl: "https://malgn-chatbot-api.dotype.workers.dev",
 *   apiKey: "YOUR_API_KEY",
 *   title: "AI 튜터 맑은샘",
 *   sessionId: 123,
 *   contentIds: [1, 2],
 *   settings: { persona: "...", temperature: 0.3, topP: 0.3, maxTokens: 1024 },
 *   width: 380,
 *   height: 650
 * };
 * </script>
 *
 * 사용법 (인라인 모드):
 * <div id="chatbot-area" style="width:100%; height:600px;"></div>
 * <script>
 * window.MalgnTutor = {
 *   mode: "inline",
 *   container: "#chatbot-area",
 *   apiUrl: "https://malgn-chatbot-api.dotype.workers.dev",
 *   apiKey: "YOUR_API_KEY",
 *   sessionId: 123,
 *   contentIds: [1, 2],
 *   settings: { ... }
 * };
 * </script>
 *
 * <link rel="stylesheet" href="https://malgn-chatbot.pages.dev/css/chatbot.css">
 * <script src="https://malgn-chatbot.pages.dev/js/chatbot-embed.js"></script>
 */

import { Api } from './api.js';
import { UI } from './ui.js';
import { ChatManager } from './chat.js';
import { TabManager } from './tabs.js';
import { QuizManager } from './quiz.js';

// 중복 로드 방지
if (window.__malgnTutorLoaded) {
  console.warn('[MalgnTutor] Already loaded, skipping.');
} else {
  window.__malgnTutorLoaded = true;

  function boot() {
    // 설정 읽기
    const cfg = window.MalgnTutor;
    if (!cfg || !cfg.apiUrl) {
      console.error('[MalgnTutor] window.MalgnTutor.apiUrl is required.');
      return;
    }

    const isInline = cfg.mode === 'inline';

    // Bootstrap Icons CDN 주입 (없으면)
    if (!document.querySelector('link[href*="bootstrap-icons"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css';
      document.head.appendChild(link);
    }

    // API 클라이언트
    const api = new Api(cfg.apiUrl, cfg.apiKey);

    // UI 주입
    UI.inject({
      mode: cfg.mode || 'layer',
      container: cfg.container || null,
      title: cfg.title || '',
      videoIframeId: cfg.videoIframeId || '',
      width: cfg.width || 380,
      height: cfg.height || 650
    });

    // Tab 매니저
    const tabManager = new TabManager();
    tabManager.init();

    // Quiz 매니저
    const quizManager = new QuizManager(api);

    // Chat 매니저
    const chatManager = new ChatManager(api, {
      contentIds: cfg.contentIds || [],
      courseId: cfg.courseId || 0,
      courseUserId: cfg.courseUserId || 0,
      lessonId: cfg.lessonId || 0,
      userId: cfg.userId || 0,
      settings: cfg.settings || {},
      parentSessionId: cfg.parentSessionId || 0
    });
    chatManager.init();

    // 세션 생성 시작 → FAB 로딩 표시
    chatManager.onSessionCreating = () => {
      UI.setFabLoading(true);
    };

    // 세션 생성 후 학습 데이터 렌더링 + 퀴즈 로딩
    chatManager.onSessionCreated = (data) => {
      UI.setFabLoading(false);
      if (data.learning) {
        tabManager.renderLearningData(data.learning);
      }
      if (data.session && data.session.id) {
        quizManager.loadQuizzes(data.session.id);
      }
      // 기존 자식 세션 반환 시 메시지 렌더링
      if (data.messages && data.messages.length > 0) {
        chatManager.clearMessages();
        data.messages.forEach(msg => {
          if (msg.role === 'user') {
            chatManager.addUserMessage(msg.content);
          } else {
            chatManager.addAssistantMessage(msg.content);
          }
        });
      }
    };

    // 기존 세션 로드 후 학습 데이터 렌더링 + 퀴즈 로딩
    chatManager.onSessionLoaded = (data) => {
      if (data.learning) {
        tabManager.renderLearningData(data.learning);
      }
      if (data.id) {
        quizManager.loadQuizzes(data.id);
      }
    };

    // 추천 질문 클릭 → 채팅으로 전송
    tabManager.onQuestionClick = (question) => {
      chatManager.sendMessage(question);
    };

    // 기존 세션 ID가 있으면 로드
    if (cfg.sessionId) {
      chatManager.loadSession(cfg.sessionId);
    }

    // 레이어 모드: FAB 토글 + 닫기 버튼 이벤트
    if (!isInline) {
      document.getElementById('malgn-fab').addEventListener('click', () => UI.toggle());

      const closeBtn = document.getElementById('malgn-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          UI.close();
        });
      }
    }

    console.log(`[MalgnTutor] Initialized (${isInline ? 'inline' : 'layer'} mode).`);
  }

  // DOMContentLoaded 또는 즉시 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}
