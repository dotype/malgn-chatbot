/**
 * AI 튜터 맑은샘 - 임베드 위젯 엔트리 포인트
 *
 * window.MalgnTutor 설정을 읽어 채팅 위젯을 자동 생성합니다.
 *
 * 사용법:
 * <script>
 * window.MalgnTutor = {
 *   apiUrl: "https://malgn-chatbot-api.dotype.workers.dev",
 *   apiKey: "YOUR_API_KEY",
 *   courseId: 0,
 *   courseUserId: 0,
 *   lessonId: 0,
 *   contentIds: [1, 2],
 *   settings: { persona: "...", temperature: 0.3, topP: 0.3, maxTokens: 1024 },
 *   width: 380,
 *   height: 650
 * };
 * </script>
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
      settings: cfg.settings || {}
    });
    chatManager.init();

    // 세션 생성 후 학습 데이터 렌더링 + 퀴즈 로딩
    chatManager.onSessionCreated = (data) => {
      if (data.learning) {
        tabManager.renderLearningData(data.learning);
      }
      if (data.session && data.session.id) {
        quizManager.loadQuizzes(data.session.id);
      }
    };

    // 추천 질문 클릭 → 채팅으로 전송
    tabManager.onQuestionClick = (question) => {
      chatManager.sendMessage(question);
    };

    // FAB 토글
    document.getElementById('malgn-fab').addEventListener('click', () => UI.toggle());

    // 닫기 버튼
    document.getElementById('malgn-close').addEventListener('click', () => UI.close());

    console.log('[MalgnTutor] Initialized successfully.');
  }

  // DOMContentLoaded 또는 즉시 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}
