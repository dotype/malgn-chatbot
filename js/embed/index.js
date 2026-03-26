/**
 * AI 튜터 맑은샘 - 임베드 위젯 엔트리 포인트
 *
 * Shadow DOM을 사용하여 호스트 페이지 CSS로부터 완전 격리됩니다.
 * CSS가 JS 번들에 인라인되므로 별도 <link> 태그 없이 스크립트 하나로 동작합니다.
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
 * <script src="https://malgn-chatbot.pages.dev/js/chatbot-embed.js"></script>
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
 * <script src="https://malgn-chatbot.pages.dev/js/chatbot-embed.js"></script>
 */

import { Api } from './api.js';
import { UI } from './ui.js';
import { ChatManager } from './chat.js';
import { TabManager } from './tabs.js';
import { QuizManager } from './quiz.js';
import { loadKaTeX } from './utils.js';

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

    // Bootstrap Icons CDN - 메인 문서에도 로드 (@font-face 등록 보장)
    if (!document.querySelector('link[href*="bootstrap-icons"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css';
      document.head.appendChild(link);
    }

    // API 클라이언트
    const api = new Api(cfg.apiUrl, cfg.apiKey);

    // UI 주입 (Shadow DOM 생성)
    UI.inject({
      mode: cfg.mode || 'layer',
      container: cfg.container || null,
      title: cfg.title || '',
      videoIframeId: cfg.videoIframeId || '',
      width: cfg.width || 380,
      height: cfg.height || 650
    });

    // Shadow root 참조 (모든 모듈이 DOM 쿼리 시 사용)
    const root = UI.root;

    // KaTeX 수식 렌더링 로드 (Shadow DOM에 CSS 주입)
    loadKaTeX(root);

    // Tab 매니저
    const tabManager = new TabManager(root);
    tabManager.init();

    // Quiz 매니저
    const quizManager = new QuizManager(api, root);

    // 웰컴 메시지
    const welcomeMessage = cfg.welcomeMessage || '';

    // Chat 매니저
    const chatManager = new ChatManager(api, {
      contentIds: cfg.contentIds || [],
      chatContentIds: cfg.chatContentIds || [],
      courseId: cfg.courseId || 0,
      courseUserId: cfg.courseUserId || 0,
      lessonId: cfg.lessonId || 0,
      userId: cfg.userId || 0,
      settings: cfg.settings || {},
      parentSessionId: cfg.parentSessionId || 0
    }, root);
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
      } else if (welcomeMessage) {
        // 새 세션이고 웰컴 메시지가 설정되어 있으면 표시
        chatManager.addAssistantMessage(welcomeMessage);
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
      // 메시지가 없고 웰컴 메시지가 설정되어 있으면 표시
      if (welcomeMessage && (!data.messages || data.messages.length === 0)) {
        chatManager.addAssistantMessage(welcomeMessage);
      }
    };

    // 추천 질문 클릭 → 채팅으로 전송
    tabManager.onQuestionClick = (question) => {
      chatManager.sendMessage(question);
    };

    // 기존 세션 ID가 있으면 로드, 부모 세션이 있으면 자동 세션 생성
    if (cfg.sessionId) {
      chatManager.loadSession(cfg.sessionId);
    } else if (cfg.parentSessionId) {
      chatManager.ensureSession();
    }

    // 레이어 모드: FAB 토글 + 닫기 버튼 이벤트
    if (!isInline) {
      root.querySelector('#malgn-fab').addEventListener('click', () => UI.toggle());

      const closeBtn = root.querySelector('#malgn-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          UI.close();
        });
      }
    }

    // 초기화 버튼 이벤트
    const resetBtn = root.querySelector('#malgn-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        if (!confirm('대화 내용을 모두 삭제하시겠습니까?')) return;
        if (chatManager.sessionId) {
          try {
            await api.clearMessages(chatManager.sessionId);
          } catch (e) {
            console.error('[MalgnTutor] 메시지 초기화 실패:', e);
          }
        }
        chatManager.clearMessages();
        if (welcomeMessage) {
          chatManager.addAssistantMessage(welcomeMessage);
        }
      });
    }

    console.log(`[MalgnTutor] Initialized (${isInline ? 'inline' : 'layer'} mode, Shadow DOM).`);
  }

  // DOMContentLoaded 또는 즉시 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}
