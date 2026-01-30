/**
 * TabManager - 탭 전환 + 학습 데이터 렌더링
 */
import { escapeHtml } from './utils.js';

export class TabManager {
  constructor() {
    this.onQuestionClick = null; // 추천질문 클릭 콜백
  }

  /**
   * 초기화 - 탭 전환 이벤트 바인딩
   */
  init() {
    const tabs = document.querySelectorAll('#malgn-chatbot .chatbot-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });
  }

  /**
   * 탭 전환
   */
  switchTab(tabName) {
    // 모든 탭 비활성화
    const tabs = document.querySelectorAll('#malgn-chatbot .chatbot-tab');
    const contents = document.querySelectorAll('#malgn-chatbot .malgn-tab-content');

    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    // 선택된 탭 활성화
    const activeTab = document.querySelector(`#malgn-chatbot .chatbot-tab[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(`malgn-tab-${tabName}`);

    if (activeTab) activeTab.classList.add('active');
    if (activeContent) activeContent.classList.add('active');

    // 탭 콘텐츠가 보이도록 상단으로 스크롤
    const body = document.getElementById('malgn-body');
    if (body) body.scrollTop = 0;
  }

  /**
   * 학습 데이터 렌더링
   */
  renderLearningData(learning) {
    // 학습 목표
    const goalsEl = document.getElementById('malgn-goals-text');
    if (goalsEl) {
      goalsEl.textContent = learning.goal || '학습 목표가 설정되지 않았습니다.';
    }

    // 요약 (배열 또는 문자열)
    const summaryEl = document.getElementById('malgn-summary-text');
    if (summaryEl) {
      const summary = learning.summary;
      if (Array.isArray(summary) && summary.length > 0) {
        summaryEl.innerHTML = summary.map((s, i) =>
          `<div class="summary-item">
            <span class="chatbot-badge">${i + 1}</span>${escapeHtml(s)}
          </div>`
        ).join('');
      } else if (summary) {
        summaryEl.textContent = summary;
      } else {
        summaryEl.textContent = '요약이 생성되지 않았습니다.';
      }
    }

    // 추천 질문
    const recommendEl = document.getElementById('malgn-recommend-text');
    if (recommendEl) {
      const questions = learning.recommendedQuestions || [];
      if (questions.length > 0) {
        recommendEl.innerHTML = questions.map((q, i) =>
          `<div class="recommend-question" data-question="${escapeHtml(q)}">
            <span class="chatbot-badge chatbot-badge-primary">${i + 1}</span>${escapeHtml(q)}
          </div>`
        ).join('');

        // 추천 질문 클릭 → 채팅으로 전송
        recommendEl.querySelectorAll('.recommend-question').forEach(el => {
          el.addEventListener('click', () => {
            const question = el.dataset.question;
            if (question && this.onQuestionClick) {
              this.onQuestionClick(question);
            }
          });
        });
      } else {
        recommendEl.textContent = '추천 질문이 생성되지 않았습니다.';
      }
    }
  }

  /**
   * 학습 데이터 초기화
   */
  clearLearningData() {
    const goalsEl = document.getElementById('malgn-goals-text');
    const summaryEl = document.getElementById('malgn-summary-text');
    const recommendEl = document.getElementById('malgn-recommend-text');
    const quizEl = document.getElementById('malgn-quiz-text');

    if (goalsEl) goalsEl.textContent = '학습 목표가 설정되지 않았습니다.';
    if (summaryEl) summaryEl.textContent = '요약이 생성되지 않았습니다.';
    if (recommendEl) recommendEl.textContent = '추천 질문이 생성되지 않았습니다.';
    if (quizEl) quizEl.textContent = '퀴즈가 생성되지 않았습니다.';
  }
}
